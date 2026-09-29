const { chromium } = require("playwright-core");
const http = require("http");

const base = process.env.QA_BASE || "http://localhost:4174";

function post(pathname, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const url = new URL(pathname, base);
    const req = http.request(
      {
        hostname: url.hostname,
        port: url.port,
        path: url.pathname,
        method: "POST",
        headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(data) }
      },
      (res) => {
        let d = "";
        res.on("data", (c) => (d += c));
        res.on("end", () => resolve({ status: res.statusCode, body: d }));
      }
    );
    req.on("error", reject);
    req.write(data);
    req.end();
  });
}

(async () => {
  const unconfigured = await post("/api/enquiry", {
    formType: "enquiry",
    name: "Dr Rao",
    email: "rao@hospital.example",
    message: "Please send literature for Panzonum-DSR."
  });
  console.log("API unconfigured", unconfigured.status, unconfigured.body);
  const invalid = await post("/api/enquiry", { formType: "enquiry", name: "A", email: "bad", message: "x" });
  console.log("API invalid", invalid.status, invalid.body);

  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const page = await browser.newPage();
  const cons = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") cons.push(msg.text());
  });
  page.on("pageerror", (err) => cons.push(err.message));

  const pages = ["/", "/products.html", "/about.html", "/manufacturers.html", "/careers.html", "/contact.html", "/products/fast-grow.html", "/404.html"];
  const widths = [320, 375, 768, 1024, 1280];
  const overflow = [];
  for (const route of pages) {
    const res = await page.goto(base + route, { waitUntil: "domcontentloaded", timeout: 20000 });
    if (!res || res.status() >= 400) overflow.push("HTTP " + (res && res.status()) + " " + route);
    for (const width of widths) {
      await page.setViewportSize({ width, height: 800 });
      const metrics = await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 2,
        title: document.title,
        h1: !!document.querySelector("h1")
      }));
      if (metrics.overflow) overflow.push("OVERFLOW " + route + " @" + width);
    }
  }
  const cat = await page.goto(base + "/products.html", { waitUntil: "domcontentloaded", timeout: 20000 });
  if (!cat || cat.status() >= 400) overflow.push("HTTP " + (cat && cat.status()) + " /products.html");
  const catalogue = await page.evaluate(() => {
    const hrefs = Array.prototype.map.call(document.querySelectorAll("#product-grid .product-card"), function (a) {
      return a.getAttribute("href");
    });
    return { n: hrefs.length, unique: new Set(hrefs).size };
  });
  if (catalogue.n !== 26 || catalogue.unique !== 26) {
    overflow.push("CATALOGUE_COUNT " + JSON.stringify(catalogue));
  }
  console.log("console errors", cons.length ? cons : "none");
  console.log("overflow", overflow.length ? overflow : "none");
  const fail = cons.length || overflow.length || unconfigured.status !== 503 || JSON.parse(unconfigured.body).delivered === true;
  process.exit(fail ? 1 : 0);
})();
