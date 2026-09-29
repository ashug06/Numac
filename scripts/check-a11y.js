const fs = require("fs");
const path = require("path");

function walk(dir, acc) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const st = fs.statSync(full);
    if (st.isDirectory() && name !== "node_modules" && name !== "scripts" && name !== "data") {
      walk(full, acc);
    } else if (name.endsWith(".html")) {
      acc.push(full);
    }
  }
  return acc;
}

const files = walk(".", []);
let fail = 0;
for (const file of files) {
  const text = fs.readFileSync(file, "utf8");
  const issues = [];
  if (!text.includes('lang="en-IN"')) issues.push("lang");
  if (!text.includes("skip-link")) issues.push("skip-link");
  if (!text.includes('id="main"')) issues.push("main");
  if (!text.includes("<h1")) issues.push("h1");
  if (!text.includes("viewport")) issues.push("viewport");
  if (issues.length) {
    fail += 1;
    console.log(file, issues.join(", "));
  }
}
console.log("Checked", files.length, "html files;", fail, "with issues");
