const { validate, handleEnquiry } = require("../api/enquiry-core");
const assert = require("assert");

let failed = 0;
function check(name, fn) {
  try {
    fn();
    console.log("PASS", name);
  } catch (err) {
    failed += 1;
    console.log("FAIL", name, err.message);
  }
}

async function checkAsync(name, fn) {
  try {
    await fn();
    console.log("PASS", name);
  } catch (err) {
    failed += 1;
    console.log("FAIL", name, err.message);
  }
}

check("rejects empty body", () => {
  const r = validate(null);
  assert.equal(r.ok, false);
});

check("rejects honeypot", () => {
  const r = validate({
    website: "http://spam.test",
    name: "Test User",
    email: "a@b.co",
    message: "Hello there doctor"
  });
  assert.equal(r.ok, false);
  assert.equal(r.spam, true);
});

check("rejects bad email", () => {
  const r = validate({ name: "Test User", email: "not-an-email", message: "Hello there" });
  assert.equal(r.ok, false);
});

check("accepts valid enquiry", () => {
  const r = validate({
    formType: "enquiry",
    name: "Dr Rao",
    email: "rao@hospital.example",
    message: "Please send literature for Panzonum-DSR.",
    audience: "Healthcare Professional"
  });
  assert.equal(r.ok, true);
  assert.equal(r.data.email, "rao@hospital.example");
});

(async () => {
  await checkAsync("does not report delivered when unconfigured", async () => {
    delete process.env.WEB3FORMS_ACCESS_KEY;
    delete process.env.RESEND_API_KEY;
    const result = await handleEnquiry(
      {
        formType: "enquiry",
        name: "Dr Rao",
        email: "rao@hospital.example",
        message: "Please send literature for Panzonum-DSR."
      },
      { ip: "test-unconfigured" }
    );
    assert.equal(result.json.delivered, false);
    assert.equal(result.status, 503);
  });

  await checkAsync("reports delivered only after provider success", async () => {
    process.env.WEB3FORMS_ACCESS_KEY = "test-key";
    delete process.env.ENQUIRY_TO;
    const result = await handleEnquiry(
      {
        formType: "enquiry",
        name: "Dr Rao",
        email: "rao@hospital.example",
        message: "Please send literature for Panzonum-DSR."
      },
      { ip: "test-ok" },
      {
        fetch: async (url, opts) => {
          const payload = JSON.parse(opts.body);
          assert.equal(payload.to, "ashutoshgoyal2026@gmail.com");
          return {
            ok: true,
            json: async () => ({ success: true })
          };
        }
      }
    );
    assert.equal(result.status, 200);
    assert.equal(result.json.delivered, true);
  });

  await checkAsync("does not report delivered on provider failure", async () => {
    process.env.WEB3FORMS_ACCESS_KEY = "test-key";
    const result = await handleEnquiry(
      {
        formType: "enquiry",
        name: "Dr Rao",
        email: "rao@hospital.example",
        message: "Please send literature for Panzonum-DSR."
      },
      { ip: "test-fail" },
      {
        fetch: async () => ({
          ok: false,
          json: async () => ({ success: false })
        })
      }
    );
    assert.equal(result.json.delivered, false);
    assert.equal(result.status, 502);
  });

  console.log(failed ? "Failed: " + failed : "All enquiry tests passed");
  process.exit(failed ? 1 : 0);
})();
