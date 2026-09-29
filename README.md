# Numac Healthcare Pvt. Ltd. — public website

Corporate site for **Numac Healthcare Private Limited**, a Bengaluru pharmaceutical marketing company established in April 2012. The site presents the product portfolio, contract-manufacturing model, mission and vision, careers, quality, and CSR — built to WCAG 2.2 Level AA practices.

## Run locally

From this folder:

```bash
npm start
```

Then open [c](http://localhost:4173). Alternatively open `index.html` in a browser; some search filters still work as plain files.

## Pages

| Path | Purpose |
| --- | --- |
| `index.html` | Home, therapeutic areas, flagship brands |
| `about.html` | Story, mission, vision, divisions |
| `products.html` | Filterable catalogue |
| `products/*.html` | Brand pages |
| `manufacturers.html` | Third-party / CMO partnership |
| `quality.html` | Quality policy and pharmacovigilance |
| `careers.html` | Roles and application form |
| `contact.html` | Malleshwaram office and enquiries |
| `csr.html` | Social responsibility |
| `accessibility.html` | Accessibility statement |
| `privacy.html` | Privacy notice |

## Accessibility

- Skip link, landmarks, visible focus, 4.5:1-oriented contrast
- High contrast and larger text controls (stored in the browser)
- Keyboard navigation with Escape to close menus
- Labelled forms and error text that is not colour-only
- `prefers-reduced-motion` and print styles

Independent audit is still recommended before claiming full conformance.

## Content notes

Product compositions follow publicly listed pharmacy data (for example RT-FAL artesunate 60 mg, Nuheal aceclofenac/paracetamol/serratiopeptidase, Lulinum luliconazole 1%). Where the public record is incomplete, the page tells the reader to trust the pack insert. This is not an online pharmacy.

Contact details used on the site:

- Sampige Road, Malleshwaram, Bengaluru, Karnataka 560003
- +91 78699 53506
- numachealthcare@yahoo.com

## Deploy

Upload the folder to any static host (Netlify, GitHub Pages, S3). Point `robots.txt` and `sitemap.xml` at the live domain. Wire forms to your inbox or a form backend; the current scripts validate in the browser and show a confirmation.

Original pack photographs sit in `source-photos/`. Enhanced 1200px catalogue frames are in `assets/products/`.

```bash
python scripts/process-photos.py
node scripts/build-products.js
```
