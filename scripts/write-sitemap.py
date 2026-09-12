from pathlib import Path

pages = [
    "/",
    "/about.html",
    "/products.html",
    "/manufacturers.html",
    "/quality.html",
    "/careers.html",
    "/contact.html",
    "/csr.html",
    "/accessibility.html",
    "/privacy.html",
]
prods = sorted(p.name for p in Path("products").glob("*.html"))
urls = [f"  <url><loc>https://numachealthcare.in{u}</loc></url>" for u in pages]
urls += [f"  <url><loc>https://numachealthcare.in/products/{n}</loc></url>" for n in prods]
text = (
    '<?xml version="1.0" encoding="UTF-8"?>\n'
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    + "\n".join(urls)
    + "\n</urlset>\n"
)
Path("sitemap.xml").write_text(text, encoding="utf8")
print("jpgs", len(list(Path("assets/products").glob("*.jpg"))))
print("source", len(list(Path("source-photos").glob("*.jpeg"))))
print("product html", len(prods))
print("sitemap urls", 10 + len(prods))
