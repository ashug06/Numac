const ALLOWED_TYPES = new Set([
  "enquiry",
  "career",
  "partner"
]);

function trim(value, max) {
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, max);
}

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validate(body) {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Invalid request." };
  }
  if (trim(body.website, 200)) {
    return { ok: false, error: "Rejected.", spam: true };
  }
  const formType = trim(body.formType, 40) || "enquiry";
  if (!ALLOWED_TYPES.has(formType)) {
    return { ok: false, error: "Unknown form." };
  }
  const name = trim(body.name, 120);
  const email = trim(body.email, 160).toLowerCase();
  const message = trim(body.message, 4000);
  if (name.length < 2) return { ok: false, error: "Enter your name." };
  if (!isEmail(email)) return { ok: false, error: "Enter a valid email address." };
  if (message.length < 8) return { ok: false, error: "Enter a message." };

  const started = Number(body.formStarted);
  if (started && Date.now() - started < 1500) {
    return { ok: false, error: "Rejected.", spam: true };
  }

  if (formType === "partner" && trim(body.company, 160).length < 2) {
    return { ok: false, error: "Enter the company name." };
  }
  const phone = trim(body.phone, 40);
  if (phone && phone.replace(/\D/g, "").length < 8) {
    return { ok: false, error: "Enter a valid phone number, or leave it blank." };
  }

  return {
    ok: true,
    data: {
      formType,
      name,
      email,
      phone,
      audience: trim(body.audience || body.role, 80),
      organization: trim(body.organization || body.company, 160),
      city: trim(body.city, 80),
      state: trim(body.state, 80),
      product: trim(body.product || body.forms, 160) || (formType === "career" ? trim(body.role, 80) : ""),
      message,
      subject: trim(body.subject, 160) || "Website enquiry"
    }
  };
}

function formatMessage(data) {
  const lines = [
    "Form: " + data.formType,
    "Name: " + data.name,
    "Email: " + data.email,
    data.phone ? "Phone: " + data.phone : "",
    data.audience ? "Type / role: " + data.audience : "",
    data.organization ? "Organisation: " + data.organization : "",
    data.city ? "City: " + data.city : "",
    data.state ? "State: " + data.state : "",
    data.product ? "Product / detail: " + data.product : "",
    "",
    data.message
  ];
  return lines.filter(Boolean).join("\n");
}

function redactProviderText(text) {
  const key = process.env.WEB3FORMS_ACCESS_KEY;
  let out = String(text || "");
  if (key) out = out.split(key).join("[redacted]");
  return out.slice(0, 500);
}

async function readProviderResponse(res) {
  let raw = "";
  let json = {};
  if (typeof res.text === "function") {
    raw = await res.text();
    try {
      json = JSON.parse(raw);
    } catch (e) {
      json = {};
    }
  } else if (typeof res.json === "function") {
    json = await res.json();
    raw = JSON.stringify(json);
  }
  return { raw, json };
}

async function deliver(data, deps) {
  const fetchFn = (deps && deps.fetch) || fetch;
  const to = process.env.ENQUIRY_TO || "ashutoshgoyal2026@gmail.com";
  const body = formatMessage(data);
  const web3 = process.env.WEB3FORMS_ACCESS_KEY;
  const resend = process.env.RESEND_API_KEY;

  if (web3) {
    const payload = {
      access_key: web3,
      name: data.name,
      from_name: data.name,
      email: data.email,
      replyto: data.email,
      subject: data.subject,
      to,
      message: body
    };
    const res = await fetchFn("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload)
    });
    const { raw, json } = await readProviderResponse(res);
    const ok = Boolean(res && res.ok) && json.success !== false && json.success !== "false";
    if (!ok) {
      console.error("[enquiry] Web3Forms delivery failed", res && res.status, redactProviderText(raw || JSON.stringify(json)));
      const err = new Error("provider");
      err.status = 502;
      throw err;
    }
    return true;
  }

  if (resend) {
    const from = process.env.RESEND_FROM || "Numac Healthcare <onboarding@resend.dev>";
    const res = await fetchFn("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + resend,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: data.email,
        subject: data.subject,
        text: body
      })
    });
    if (!res.ok) {
      const err = new Error("provider");
      err.status = 502;
      throw err;
    }
    return true;
  }

  const err = new Error("not_configured");
  err.status = 503;
  throw err;
}

const hits = new Map();

function rateLimited(ip) {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000;
  const list = (hits.get(ip) || []).filter((t) => now - t < windowMs);
  if (list.length >= 8) {
    hits.set(ip, list);
    return true;
  }
  list.push(now);
  hits.set(ip, list);
  return false;
}

async function handleEnquiry(body, meta, deps) {
  const ip = (meta && meta.ip) || "unknown";
  if (rateLimited(ip)) {
    return { status: 429, json: { delivered: false, error: "Please wait before sending another enquiry." } };
  }
  const result = validate(body);
  if (!result.ok) {
    return { status: result.spam ? 400 : 400, json: { delivered: false, error: result.error } };
  }
  try {
    await deliver(result.data, deps);
    return { status: 200, json: { delivered: true } };
  } catch (err) {
    if (err && err.message === "not_configured") {
      return {
        status: 503,
        json: {
          delivered: false,
          error: "Enquiries cannot be delivered yet. Please email numachealthcare@yahoo.com directly."
        }
      };
    }
    return {
      status: 502,
      json: {
        delivered: false,
        error: "The enquiry could not be delivered. Please email numachealthcare@yahoo.com."
      }
    };
  }
}

module.exports = { validate, deliver, handleEnquiry, formatMessage };
