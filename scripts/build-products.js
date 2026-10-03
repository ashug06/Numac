const fs = require("fs");
const path = require("path");
const { fontLinks, seoMeta, siteHeader, siteFooter } = require("./chrome");

const root = path.join(__dirname, "..");
const data = JSON.parse(fs.readFileSync(path.join(root, "data", "products.json"), "utf8"));
const publicProducts = data.products.filter((p) => p.availability === "public" && p.image);
const railProducts = publicProducts.slice().sort((a, b) => {
  const fa = a.featured ? a.featuredOrder || 99 : 1000;
  const fb = b.featured ? b.featuredOrder || 99 : 1000;
  if (fa !== fb) return fa - fb;
  return String(a.brandName || "").localeCompare(String(b.brandName || ""));
});
const categories = data.categories || [];

const PLACEHOLDER = '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="14" y="8" width="20" height="32" rx="3"/><path d="M14 18h20"/></svg>';

const unpublishedHold = [
  "nuheal",
  "ovapreg",
  "panzonum-injection",
  "rabinum-d",
  "numcef",
  "macvir",
  "meconum-lg",
  "numal-forte"
];

function webpName(image) {
  return image.replace(/\.png$/i, ".webp");
}

function packListing(p) {
  const webp = webpName(p.image);
  return `<picture><source type="image/webp" srcset="assets/products/${webp}"><img src="assets/products/${p.image}" width="600" height="600" alt="" loading="lazy" decoding="async"></picture>`;
}

function packDetail(p) {
  const webp = webpName(p.image);
  return `<div class="product-hero"><picture><source type="image/webp" srcset="../assets/products/${webp}"><img src="../assets/products/${p.image}" width="800" height="800" alt="${escapeHtml(p.imageAlt || "")}" loading="eager" decoding="async"></picture></div>`;
}

function escapeHtml(s) {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;");
}

function metaRows(p) {
  const rows = [];
  if (p.dosageForm) rows.push(`<div><dt>Dosage form</dt><dd>${escapeHtml(p.dosageForm)}</dd></div>`);
  if (p.packSize) rows.push(`<div><dt>Pack</dt><dd>${escapeHtml(p.packSize)}</dd></div>`);
  if (p.genericName) rows.push(`<div><dt>Generic name</dt><dd>${escapeHtml(p.genericName)}</dd></div>`);
  if (p.strength && !String(p.strength).toLowerCase().includes("confirm")) {
    rows.push(`<div><dt>Strength</dt><dd>${escapeHtml(p.strength)}</dd></div>`);
  }
  if (p.composition) rows.push(`<div><dt>Composition</dt><dd>${escapeHtml(p.composition)}</dd></div>`);
  rows.push(`<div><dt>Marketer</dt><dd>${escapeHtml(p.marketer || p.manufacturer || "Numac Healthcare Pvt. Ltd.")}</dd></div>`);
  return rows.join("");
}

function card(p) {
  const blurb = p.composition || p.description;
  const meta = [p.dosageForm, p.packSize].filter(Boolean).join(" · ");
  return `          <a class="product-card" data-product="${escapeHtml(p.search || p.brandName)}" data-category="${escapeHtml(p.category)}" href="products/${p.id}.html">
            <div class="product-pack">${packListing(p)}</div>
            <div class="product-body">
              <span class="product-cat">${escapeHtml(p.pill || p.subcategory || "")}</span>
              <h3>${escapeHtml(p.brandName)}</h3>
              <p class="product-comp">${escapeHtml(blurb)}</p>
              <p class="product-meta">${escapeHtml(meta)}</p>
              <span class="product-cta">View product</span>
            </div>
          </a>`;
}

function railCard(p, decorative) {
  const tab = decorative ? ' tabindex="-1"' : "";
  const alt = decorative ? "" : escapeHtml(p.imageAlt || p.brandName);
  const heading = decorative
    ? `<p class="product-rail-name">${escapeHtml(p.brandName)}</p>`
    : `<h3>${escapeHtml(p.brandName)}</h3>`;
  return `              <a class="product-card"${tab} href="products/${p.id}.html">
                <div class="product-pack">
                  <picture>
                    <source type="image/webp" srcset="assets/products/${webpName(p.image)}">
                    <img src="assets/products/${p.image}" width="600" height="600" alt="${alt}" loading="lazy" decoding="async">
                  </picture>
                </div>
                <div class="product-body">
                  <span class="product-cat">${escapeHtml(p.pill || "")}</span>
                  ${heading}
                  <p class="product-comp">${escapeHtml(p.composition)}</p>
                  <p class="product-meta">${escapeHtml([p.dosageForm, p.packSize].filter(Boolean).join(" · "))}</p>
                  <span class="product-cta">View product</span>
                </div>
              </a>`;
}

function homepageRail() {
  const live = railProducts.map((p) => railCard(p, false)).join("\n");
  const copy = railProducts.map((p) => railCard(p, true)).join("\n");
  return `        <div class="product-rail">
          <div class="product-rail-viewport">
            <div class="product-rail-track">
              <div class="product-rail-seq">
${live}
              </div>
              <div class="product-rail-seq" aria-hidden="true">
${copy}
              </div>
            </div>
          </div>
        </div>`;
}

function filterControls() {
  return categories
    .map((c, i) => {
      const checked = c.id === "all" ? " checked" : "";
      return `              <label><input type="radio" name="category" value="${escapeHtml(c.id)}"${checked}> <span>${escapeHtml(c.label)}</span></label>`;
    })
    .join("\n");
}

function shell(p) {
  const desc = `${p.brandName} from Numac Healthcare. ${p.pill || ""}. ${p.composition || ""}`.replace(/"/g, "&quot;");
  const lede = p.description || p.professionalInformation || "";
  return `<!DOCTYPE html>
<html lang="en-IN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(p.brandName)} | Numac Healthcare</title>
  <meta name="description" content="${desc}">
  ${seoMeta({ title: p.brandName + " | Numac Healthcare", description: desc, path: "/products/" + p.id + ".html", image: "assets/products/" + webpName(p.image) })}
  <link rel="icon" href="../assets/favicon.ico" sizes="any">
  <link rel="icon" href="../assets/favicon-32.png" type="image/png" sizes="32x32">
  <link rel="icon" href="../assets/favicon-16.png" type="image/png" sizes="16x16">
  <link rel="apple-touch-icon" href="../assets/favicon-48.png" sizes="48x48">
  ${fontLinks()}
  <link rel="stylesheet" href="../css/styles.css">
</head>
<body>
  <a class="skip-link" href="#main">Skip to main content</a>
  ${siteHeader({ prefix: "../", current: "products" })}
  <main id="main">
    <header class="page-hero">
      <div class="wrap-wide">
        <nav class="breadcrumbs" aria-label="Breadcrumb">
          <ol>
            <li><a href="../index.html">Home</a></li>
            <li><a href="../products.html">Products</a></li>
            <li>${escapeHtml(p.brandName)}</li>
          </ol>
        </nav>
        <p class="kicker">${escapeHtml(p.pill || p.subcategory || "")}</p>
        <h1>${escapeHtml(p.brandName)}</h1>
        <p class="lede">${escapeHtml(lede)}</p>
      </div>
    </header>
    <section class="section" aria-labelledby="detail-title">
      <div class="wrap-wide split">
        <div>
          ${packDetail(p)}
          <h2 id="detail-title">Product information</h2>
          <dl class="pack-meta">
            ${metaRows(p)}
          </dl>
          <h3>Use as directed</h3>
          <p>${escapeHtml(p.professionalInformation)}</p>
          <div class="detail-actions">
            <a class="btn btn-solid" href="../contact.html#enquiry">Request product information</a>
            <a class="btn btn-outline" href="../products.html">Back to catalogue</a>
          </div>
        </div>
        <aside class="notice" role="note">
          <p><strong>For healthcare professionals and informed patients.</strong> This page is informational. It is not a diagnosis, a dose calculator, or an invitation to self-medicate. The pack insert and a registered medical practitioner overrule this website.</p>
          <p>To report a suspected adverse reaction, see <a href="../quality.html#pv">pharmacovigilance</a>.</p>
        </aside>
      </div>
    </section>
  </main>
  ${siteFooter({ prefix: "../" })}
  <script src="../js/main.js" defer></script>
</body>
</html>
`;
}

function holdPage(title, href, message) {
  return `<!DOCTYPE html>
<html lang="en-IN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)} | Numac Healthcare</title>
  <meta name="robots" content="noindex">
  <meta http-equiv="refresh" content="0; url=${href}">
  <link rel="canonical" href="${href.startsWith("http") ? href : href}">
</head>
<body>
  <a class="skip-link" href="#main">Skip to main content</a>
  <main id="main">
    <h1>${escapeHtml(title)}</h1>
    <p>${message}</p>
  </main>
</body>
</html>
`;
}

const dir = path.join(root, "products");
fs.mkdirSync(dir, { recursive: true });
for (const p of publicProducts) {
  fs.writeFileSync(path.join(dir, p.id + ".html"), shell(p));
}

const unpublishedDir = path.join(root, "data", "internal", "unpublished-html");
fs.mkdirSync(unpublishedDir, { recursive: true });
for (const slug of unpublishedHold) {
  fs.writeFileSync(
    path.join(unpublishedDir, slug + ".html"),
    holdPage(
      "Product information",
      "../products.html",
      'This listing is not published pending pack confirmation. See the <a href="../products.html">product catalogue</a> or <a href="../contact.html#enquiry">request product information</a>.'
    )
  );
}
fs.writeFileSync(
  path.join(unpublishedDir, "platonorm.html"),
  holdPage("Platonorm", "platonorm-syrup.html", 'See <a href="platonorm-syrup.html">Platonorm Syrup</a> from the photographed pack.')
);
fs.writeFileSync(
  path.join(unpublishedDir, "rt-fal.html"),
  holdPage("Numal-RT", "numal-rt-60.html", 'This pack is listed as <a href="numal-rt-60.html">Numal-RT 60 mg</a>.')
);

const listing = path.join(root, "products.html");
let html = fs.readFileSync(listing, "utf8");
html = html.replace(
  /<div class="filter-list">[\s\S]*?<\/div>/,
  `<div class="filter-list">\n${filterControls()}\n            </div>`
);
html = html.replace(/<p class="catalogue-note">[\s\S]*?<\/p>\s*/g, "");
html = html.replace(
  /<p class="live" id="filter-status"[^>]*>[\s\S]*?<\/p>/,
  `<p class="catalogue-note">Browse the photographed range. Additional brands will be added when pack photography and labelling are confirmed. Category labels are working browse groups, not an official company taxonomy.</p>
        <p class="live" id="filter-status" aria-live="polite">${publicProducts.length} products shown.</p>`
);
const gridBlock = `<!-- catalogue-grid:start -->
        <div class="product-grid" id="product-grid">
${publicProducts.map(card).join("\n")}
        </div>
        <nav class="catalogue-pager" id="catalogue-pager" aria-label="Catalogue pages" hidden></nav>
        <!-- catalogue-grid:end -->`;
if (html.includes("<!-- catalogue-grid:start -->")) {
  html = html.replace(/<!-- catalogue-grid:start -->[\s\S]*?<!-- catalogue-grid:end -->/, gridBlock);
} else {
  html = html.replace(
    /<div class="product-grid"[\s\S]*?<aside class="notice"/,
    `${gridBlock}\n\n        <aside class="notice"`
  );
}
fs.writeFileSync(listing, html);

const indexPath = path.join(root, "index.html");
let index = fs.readFileSync(indexPath, "utf8");
if (index.includes("<!-- featured-products:start -->")) {
  index = index.replace(
    /<!-- featured-products:start -->[\s\S]*?<!-- featured-products:end -->/,
    `<!-- featured-products:start -->\n${homepageRail()}\n        <!-- featured-products:end -->`
  );
} else {
  index = index.replace(
    /<div class="product-grid">\s*<a class="product-card" href="products\/fast-grow.html">[\s\S]*?<\/div>\s*<p style="margin-top:1.5rem"><a class="btn btn-outline" href="products.html">[\s\S]*?<\/a><\/p>/,
    `<!-- featured-products:start -->\n${homepageRail()}\n        <!-- featured-products:end -->\n        <p class="featured-cta"><a class="btn btn-outline" href="products.html">View all products</a></p>`
  );
}
index = index.replace(/View the full catalogue/g, "View all products");
fs.writeFileSync(indexPath, index);

const publicUrls = [
  "",
  "about.html",
  "products.html",
  "manufacturers.html",
  "quality.html",
  "careers.html",
  "contact.html",
  "csr.html",
  "accessibility.html",
  "privacy.html"
].concat(publicProducts.map((p) => "products/" + p.id + ".html"));
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${publicUrls.map((u) => `  <url><loc>https://numachealthcare.com/${u}</loc></url>`).join("\n")}
</urlset>
`;
fs.writeFileSync(path.join(root, "sitemap.xml"), sitemap);

console.log("Public products:", publicProducts.length, "| homepage rail:", railProducts.length, "| unpublished holds:", unpublishedHold.length);
