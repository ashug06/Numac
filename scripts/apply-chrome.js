const fs = require("fs");
const path = require("path");
const { FONT_HREF, fontLinks, seoMeta, siteHeader, siteFooter } = require("./chrome");

const pages = [
  {
    file: "about.html",
    current: "about",
    title: "About Numac Healthcare | Bengaluru pharmaceutical company",
    description: "Numac Healthcare Pvt. Ltd. was established in 2012 in Bengaluru. Learn about our purpose, portfolio focus, and how we work with manufacturing partners.",
    path: "/about.html"
  },
  {
    file: "products.html",
    current: "products",
    title: "Products | Numac Healthcare portfolio",
    description: "Browse Numac Healthcare brands across infection, gastroenterology, pain, dermatology, nutrition and related areas. Information for healthcare professionals and patients.",
    path: "/products.html"
  },
  {
    file: "manufacturers.html",
    current: "manufacturers",
    title: "Manufacturing partners | Numac Healthcare",
    description: "Numac works with selected manufacturing partners to support quality, consistency and reliable supply. Discuss contract manufacturing and distribution.",
    path: "/manufacturers.html"
  },
  {
    file: "careers.html",
    current: "careers",
    title: "Careers | Work at Numac Healthcare",
    description: "Build your career with Numac Healthcare in Bengaluru and the field. Medical representative and related roles in a growing healthcare organisation.",
    path: "/careers.html"
  },
  {
    file: "contact.html",
    current: "contact",
    title: "Contact Numac Healthcare | Product enquiry",
    description: "Contact Numac Healthcare in Malleshwaram, Bengaluru. Request product information, discuss distribution, or send a general enquiry.",
    path: "/contact.html"
  },
  {
    file: "quality.html",
    current: "about",
    title: "Quality | Numac Healthcare",
    description: "Numac Healthcare quality policy, artwork control, and pharmacovigilance for healthcare professionals and partners.",
    path: "/quality.html"
  },
  {
    file: "csr.html",
    current: "about",
    title: "Social responsibility | Numac Healthcare",
    description: "Numac Healthcare’s commitment to ethical business, workforce wellbeing, and the communities around our work.",
    path: "/csr.html"
  },
  {
    file: "privacy.html",
    current: "",
    title: "Privacy notice | Numac Healthcare",
    description: "How Numac Healthcare collects and uses enquiry and career data on this website.",
    path: "/privacy.html"
  },
  {
    file: "accessibility.html",
    current: "",
    title: "Accessibility | Numac Healthcare",
    description: "Accessibility statement for the Numac Healthcare website, including keyboard access and display preferences.",
    path: "/accessibility.html"
  },
  {
    file: "404.html",
    current: "",
    title: "Page not found | Numac Healthcare",
    description: "The requested page was not found on the Numac Healthcare website.",
    path: "/404.html"
  }
];

function patch(file, current, title, description, urlPath) {
  const full = path.join(__dirname, "..", file);
  let html = fs.readFileSync(full, "utf8");
  html = html.replace(
    /https:\/\/fonts\.googleapis\.com\/css2\?[^"]+/,
    FONT_HREF
  );
  if (!html.includes("family=Manrope")) {
    html = html.replace(
      /<link rel="stylesheet" href="css\/styles.css">/,
      `${fontLinks()}\n  <link rel="stylesheet" href="css/styles.css">`
    );
  }
  html = html.replace(/<header class="site-header">[\s\S]*?<\/header>/, siteHeader({ prefix: "", current }));
  html = html.replace(/<footer class="site-footer">[\s\S]*?<\/footer>/, siteFooter({ prefix: "" }));
  if (!html.includes('property="og:title"')) {
    html = html.replace(
      /<link rel="icon"/,
      `${seoMeta({ title, description, path: urlPath })}\n  <link rel="icon"`
    );
  }
  fs.writeFileSync(full, html);
  console.log("patched", file);
}

for (const page of pages) {
  patch(page.file, page.current, page.title, page.description, page.path);
}
