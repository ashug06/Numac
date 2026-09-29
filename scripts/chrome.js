/** Shared header, footer, and head fragments for the static site. */

const FONT_HREF =
  "https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&family=Source+Serif+4:opsz,wght@8..60,500;8..60,600;8..60,700&display=swap";

function fontLinks() {
  return `<link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="${FONT_HREF}" rel="stylesheet">`;
}

function seoMeta({ title, description, path = "/", image = "assets/logo.png" }) {
  const url = "https://numachealthcare.in" + path;
  const absImage = image.startsWith("http") ? image : "https://numachealthcare.in/" + image.replace(/^\//, "");
  return `<link rel="canonical" href="${url}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:type" content="website">
  <meta property="og:locale" content="en_IN">
  <meta property="og:url" content="${url}">
  <meta property="og:image" content="${absImage}">
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">`;
}

function siteHeader({ prefix = "", current = "" } = {}) {
  const p = prefix;
  const is = (key) => (current === key ? ' aria-current="page"' : "");
  return `<header class="site-header">
    <div class="wrap-wide header-inner">
      <a class="brand" href="${p}index.html">
        <img src="${p}assets/logo.png" width="44" height="44" alt="">
        <span class="brand-text">
          <span class="brand-name">Numac</span>
          <span class="brand-tag">Healthcare Pvt. Ltd.</span>
        </span>
      </a>
      <nav class="site-nav" id="site-nav" aria-label="Primary">
        <p class="nav-label">Menu</p>
        <ul>
          <li><a href="${p}index.html"${is("home")}>Home</a></li>
          <li><a href="${p}about.html"${is("about")}>About</a></li>
          <li><a href="${p}products.html"${is("products")}>Products</a></li>
          <li><a href="${p}manufacturers.html"${is("manufacturers")}>Manufacturers</a></li>
          <li><a href="${p}careers.html"${is("careers")}>Careers</a></li>
        </ul>
        <a class="btn btn-solid nav-cta" href="${p}contact.html"${is("contact")}>Contact Us</a>
        <div class="a11y-tools" role="group" aria-label="Display preferences">
          <button type="button" class="tool-btn" id="contrast-toggle" aria-pressed="false" title="High contrast">
            <span class="visually-hidden">High contrast</span>
            <span aria-hidden="true">HC</span>
          </button>
          <button type="button" class="tool-btn" id="text-toggle" aria-pressed="false" title="Larger text">
            <span class="visually-hidden">Larger text</span>
            <span aria-hidden="true">Aa</span>
          </button>
        </div>
      </nav>
      <div class="header-tools">
        <button type="button" class="nav-toggle" aria-expanded="false" aria-controls="site-nav">
          <span class="visually-hidden">Open menu</span>
          <span class="nav-toggle-bars" aria-hidden="true"></span>
        </button>
      </div>
    </div>
  </header>`;
}

function siteFooter({ prefix = "" } = {}) {
  const p = prefix;
  return `<footer class="site-footer">
    <div class="wrap-wide">
      <div class="footer-grid">
        <div>
          <p class="footer-brand">Numac Healthcare</p>
          <p>A Bengaluru pharmaceutical healthcare company established in 2012. Quality-focused products through trusted manufacturing partnerships.</p>
          <address>
            Sampige Road,<br>
            Malleshwaram, Bengaluru, Karnataka 560003
          </address>
          <p><a href="tel:+917869953506">+91 78699 53506</a><br>
          <a href="mailto:numachealthcare@yahoo.com">numachealthcare@yahoo.com</a></p>
        </div>
        <div>
          <h2>Explore</h2>
          <ul>
            <li><a href="${p}about.html">About</a></li>
            <li><a href="${p}products.html">Products</a></li>
            <li><a href="${p}manufacturers.html">Manufacturers</a></li>
            <li><a href="${p}careers.html">Careers</a></li>
          </ul>
        </div>
        <div>
          <h2>Company</h2>
          <ul>
            <li><a href="${p}contact.html">Contact</a></li>
            <li><a href="${p}quality.html">Quality</a></li>
            <li><a href="${p}privacy.html">Privacy</a></li>
            <li><a href="${p}accessibility.html">Accessibility</a></li>
            <li><a href="${p}csr.html">Social responsibility</a></li>
          </ul>
        </div>
        <div>
          <h2>For professionals</h2>
          <ul>
            <li><a href="${p}contact.html#enquiry">Product enquiry</a></li>
            <li><a href="${p}manufacturers.html#partner">Become a partner</a></li>
            <li><a href="${p}quality.html#pv">Report an adverse event</a></li>
          </ul>
        </div>
      </div>
      <p class="disclaimer">Numac products are intended for use as directed by a registered medical practitioner. Product information on this website is provided for professional and informational purposes and is not a substitute for medical advice. Always refer to the pack insert. This is not an online pharmacy.</p>
      <div class="footer-meta">
        <p>© 2026 Numac Healthcare Private Limited. All rights reserved.</p>
        <p><a href="${p}privacy.html">Privacy</a> · <a href="${p}accessibility.html">Accessibility</a></p>
      </div>
    </div>
  </footer>`;
}

module.exports = { FONT_HREF, fontLinks, seoMeta, siteHeader, siteFooter };
