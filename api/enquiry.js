const { handleEnquiry } = require("./enquiry-core");

function ipFrom(req) {
  const xf = req.headers["x-forwarded-for"];
  if (typeof xf === "string" && xf.trim()) return xf.split(",")[0].trim();
  return req.socket && req.socket.remoteAddress ? req.socket.remoteAddress : "unknown";
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    if (req.body && typeof req.body === "string") {
      try {
        resolve(JSON.parse(req.body));
      } catch (e) {
        reject(new Error("invalid_json"));
      }
      return;
    }
    if (req.body && typeof req.body === "object" && !Buffer.isBuffer(req.body)) {
      resolve(req.body);
      return;
    }
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 20000) {
        reject(new Error("too_large"));
      }
    });
    req.on("end", () => {
      if (!raw) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch (e) {
        reject(new Error("invalid_json"));
      }
    });
  });
}

module.exports = async function handler(req, res) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }
  if (req.method !== "POST") {
    res.statusCode = 405;
    res.end(JSON.stringify({ delivered: false, error: "Method not allowed." }));
    return;
  }
  try {
    const body = await readJson(req);
    const result = await handleEnquiry(body, { ip: ipFrom(req) });
    res.statusCode = result.status;
    res.end(JSON.stringify(result.json));
  } catch (err) {
    res.statusCode = err && err.message === "too_large" ? 413 : 400;
    res.end(JSON.stringify({ delivered: false, error: "Invalid request." }));
  }
};
