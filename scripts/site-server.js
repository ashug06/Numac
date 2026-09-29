const http = require("http");
const fs = require("fs");
const path = require("path");
const handler = require("../api/enquiry");
const { writeWeb3Client } = require("./write-web3-client");

const root = path.join(__dirname, "..");
const port = Number(process.env.PORT || 4173);

function loadEnv() {
  const file = path.join(root, ".env");
  if (!fs.existsSync(file)) return;
  fs.readFileSync(file, "utf8")
    .split(/\r?\n/)
    .forEach((line) => {
      const t = line.trim();
      if (!t || t.startsWith("#")) return;
      const i = t.indexOf("=");
      if (i < 1) return;
      const key = t.slice(0, i).trim();
      let val = t.slice(i + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = val;
    });
}

loadEnv();
writeWeb3Client();

const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".ico": "image/x-icon",
  ".xml": "application/xml",
  ".txt": "text/plain; charset=utf-8",
  ".pdf": "application/pdf"
};

function safePath(urlPath) {
  let p;
  try {
    p = decodeURIComponent((urlPath || "/").split("?")[0]);
  } catch (err) {
    return null;
  }
  p = p.replace(/\\/g, "/");
  if (p === "/") p = "/index.html";
  const blocked = /^\/(\.env|api|scripts|source-photos|\.git|\.venv|node_modules|data|qa-out)\b/i;
  if (blocked.test(p)) return null;
  if (/\.pdf$/i.test(p)) return null;
  if (/nhc-\d/i.test(p) || /nov-25/i.test(p)) return null;
  if (/product-register|verification-report|\/preview\//i.test(p)) return null;
  if (p.includes("..")) return null;
  if (!path.extname(p) && fs.existsSync(path.join(root, p + ".html"))) p += ".html";
  const full = path.normalize(path.join(root, p.replace(/^\//, "")));
  const rel = path.relative(root, full);
  if (!rel || rel.startsWith("..") || path.isAbsolute(rel)) return null;
  return full;
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://127.0.0.1");
  if (url.pathname === "/api/enquiry") {
    await handler(req, res);
    return;
  }
  const file = safePath(url.pathname);
  if (!file || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    const missing = path.join(root, "404.html");
    res.statusCode = 404;
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.end(fs.readFileSync(missing));
    return;
  }
  const ext = path.extname(file).toLowerCase();
  res.statusCode = 200;
  res.setHeader("Content-Type", types[ext] || "application/octet-stream");
  fs.createReadStream(file).pipe(res);
});

server.listen(port, () => {
  console.log("Numac site at http://localhost:" + port);
});
