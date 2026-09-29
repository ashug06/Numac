const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");

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
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = val;
    });
}

function writeWeb3Client() {
  loadEnv();
  const key = process.env.WEB3FORMS_ACCESS_KEY || "";
  if (!key && process.env.VERCEL) {
    console.error(
      "Missing WEB3FORMS_ACCESS_KEY. Add it in Vercel → Project Settings → Environment Variables."
    );
    process.exit(1);
  }
  const dest = path.join(root, "js", "web3forms-access.js");
  fs.writeFileSync(
    dest,
    "window.NUMAC_WEB3FORMS_ACCESS_KEY = " + JSON.stringify(key) + ";\n"
  );
}

if (require.main === module) {
  writeWeb3Client();
}

module.exports = { writeWeb3Client };
