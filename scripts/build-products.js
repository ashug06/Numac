const fs = require("fs");
const path = require("path");

const products = [
  { slug: "fast-grow", name: "FAST GROW Tablets", pill: "Hair care", filter: "skin", search: "fast grow biotin msm hair", form: "Tablet", pack: "3 x 10 tablets", composition: "Biotin, inositol, choline bitartrate, MSM, antioxidants, vitamins, minerals and trace elements. 100% vegetarian.", uses: "Nutritional support for hair as advised by a clinician. Not a treatment for undiagnosed scalp or endocrine disease.", notes: "A founding Numac brand. Pack photographed with blister.", image: "fast-grow.png", alt: "FAST GROW tablets carton and blister pack by Numac Healthcare, labelled 3 by 10 vegetarian tablets." },
  { slug: "lulinum", name: "Lulinum Cream", pill: "Antifungal", filter: "skin", search: "lulinum luliconazole cream fungal", form: "Cream", pack: "30 g", composition: "Luliconazole Cream IP.", uses: "Topical treatment of dermatophyte infections as prescribed.", notes: "Antifungal cream in the NHC dermatology range.", image: "lulinum.png", alt: "Lulinum Luliconazole Cream IP 30 gram carton by Numac Healthcare." },
  { slug: "terbinum", name: "Terbinum Cream", pill: "Antifungal", filter: "skin", search: "terbinum terbinafine cream", form: "Cream", pack: "20 g", composition: "Terbinafine Hydrochloride Cream IP.", uses: "Topical antifungal as prescribed for susceptible skin infections.", notes: "Extracted from a shared dermatology pack shot.", image: "terbinum.png", alt: "Terbinum Terbinafine Hydrochloride Cream IP 20 gram carton." },
  { slug: "momenum", name: "Momenum Cream", pill: "Dermatology", filter: "skin", search: "momenum mometasone furoate cream", form: "Cream", pack: "15 g", composition: "Mometasone Furoate Cream IP.", uses: "Topical corticosteroid for steroid-responsive dermatoses as prescribed. Not for undiagnosed infection.", notes: "Use on medical advice only; duration should be limited.", image: "momenum.png", alt: "Momenum Mometasone Furoate Cream IP 15 gram carton." },
  { slug: "nhc-pmt", name: "NHC-PMT Soap", pill: "Dermatology", filter: "skin", search: "nhc-pmt permethrin soap scabies", form: "Medicated soap", pack: "75 g bar", composition: "Permethrin soap.", uses: "External use only. Used in scabies and lice protocols as directed. Avoid eyes.", notes: "Photographed with carton and embossed NHC bar.", image: "nhc-pmt.png", alt: "NHC-PMT permethrin medicated soap 75 gram carton and green soap bar." },
  { slug: "macflu-150", name: "Macflu-150", pill: "Antifungal", filter: "infection", search: "macflu fluconazole 150", form: "Tablet", pack: "30 x 1 tablets", composition: "Fluconazole Tablets IP 150 mg.", uses: "Oral antifungal as prescribed. Single-dose regimens still require a diagnosis.", notes: "Prescription only.", image: "macflu-150.png", alt: "Macflu-150 Fluconazole Tablets IP 150 mg carton by Numac Healthcare." },
  { slug: "cefunum-500", name: "Cefunum-500", pill: "Antibiotic", filter: "infection", search: "cefunum cefuroxime 500 antibiotic", form: "Tablet", pack: "10 x 10 tablets", composition: "Cefuroxime Tablets IP 500 mg.", uses: "Oral cephalosporin for susceptible bacterial infections. Complete the course.", notes: "Document beta-lactam allergy before supply.", image: "cefunum-500.png", alt: "Cefunum-500 Cefuroxime Tablets IP 500 mg carton and blister pack." },
  { slug: "nhfero-cv", name: "NHFERO-CV", pill: "Antibiotic", filter: "infection", search: "nhfero faropenem clavulanate", form: "Tablet", pack: "1 x 6 tablets", composition: "Faropenem and potassium clavulanate tablets.", uses: "Oral penem with beta-lactamase inhibitor as prescribed.", notes: "Schedule H. Not for viral illness.", image: "nhfero-cv.png", alt: "NHFERO-CV Faropenem and Potassium Clavulanate tablets carton and six-tablet blister." },
  { slug: "nhclin-600", name: "NHCLIN-600", pill: "Antibiotic", filter: "infection", search: "nhclin clindamycin injection 600", form: "Injection", pack: "1 x 4 ml ampoule", composition: "Clindamycin Injection I.P. 600 mg / 4 ml.", uses: "For I.M. / I.V. use only under medical supervision.", notes: "Hospital antibiotic. Follow dilution and infusion guidance on the insert.", image: "nhclin-600.png", alt: "NHCLIN-600 Clindamycin Injection IP 600 mg in 4 ml carton." },
  { slug: "numal-rt-60", name: "Numal-RT 60 mg", pill: "Antimalarial", filter: "infection", search: "numal-rt artesunate 60 malaria rt-fal", form: "Injection, combi pack", pack: "Single-use vial, IM/IV", composition: "Artesunate Injection IP 60 mg.", uses: "Treatment of malaria as per national guidelines. Given by a clinician. Not for self-injection.", notes: "The 60 mg artesunate combi pack marketed as Numal-RT. Trade listings sometimes used the name RT-FAL.", image: "numal-rt-60.png", alt: "Numal-RT Artesunate Injection IP 60 mg combi pack carton." },
  { slug: "numal-rt-120", name: "Numal-RT 120 mg", pill: "Antimalarial", filter: "infection", search: "numal-rt artesunate 120 malaria", form: "Injection, combi pack", pack: "Single-use vial, IM/IV", composition: "Artesunate Injection IP 120 mg.", uses: "Higher-strength artesunate combi pack for malaria treatment under supervision.", notes: "Extracted from a three-brand antimalarial photograph.", image: "numal-rt-120.png", alt: "Numal-RT 120 Artesunate Injection IP 120 mg combi pack carton." },
  { slug: "numal-150", name: "NUMAL-150", pill: "Antimalarial", filter: "infection", search: "numal-150 arteether malaria injection", form: "Injection", pack: "3 ampoules of 2 ml", composition: "Alpha-beta arteether injection.", uses: "Intramuscular use only for malaria as prescribed. Labelled as a painless injection presentation.", notes: "Separated from the same group shot as Numal-RT.", image: "numal-150.png", alt: "NUMAL-150 alpha-beta arteether intramuscular injection carton, 3 ampoules of 2 ml." },
  { slug: "panzonum-dsr", name: "Panzonum-DSR", pill: "Gastroenterology", filter: "gi", search: "panzonum dsr pantoprazole domperidone", form: "Capsule", pack: "10 x 10 capsules", composition: "Pantoprazole gastro-resistant and domperidone prolonged-release capsules IP.", uses: "Acid-related disorders with a prokinetic component, as prescribed.", notes: "Domperidone has cardiac cautions. PPIs are not default lifelong therapy.", image: "panzonum-dsr.png", alt: "Panzonum-DSR pantoprazole and domperidone capsules carton and alu-alu blister." },
  { slug: "mbrraft", name: "MBRAFT Suspension", pill: "Antacid", filter: "gi", search: "mbrraft alginate bicarbonate antacid reflux", form: "Oral suspension", pack: "150 ml", composition: "Sodium alginate, sodium bicarbonate and calcium carbonate suspension. Sugar-free, paan-mint flavour.", uses: "Symptomatic relief of heartburn and reflux as labelled. Safe-in-pregnancy claims on pack still require clinician advice.", notes: "Photograph of the amber bottle with measuring cup.", image: "mbrraft.png", alt: "MBRAFT sodium alginate antacid suspension 150 ml bottle, sugar-free paan-mint." },
  { slug: "mblac", name: "MBLAC", pill: "Probiotic", filter: "gi", search: "mblac bacillus clausii probiotic", form: "Oral mini-bottles", pack: "12 mini bottles of 5 ml", composition: "Bacillus clausii spores suspension.", uses: "Oral probiotic suspension. For oral use only — do not inject.", notes: "Carton photographed with four mini-bottles.", image: "mblac.png", alt: "MBLAC Bacillus clausii spores suspension carton and oral mini-bottles." },
  { slug: "mbspas", name: "MBSPAS Drops", pill: "Paediatric", filter: "gi", search: "mbspas simethicone dill fennel drops colic", form: "Oral drops", pack: "30 ml with dropper", composition: "Simethicone emulsion, dill oil and fennel oil oral drops.", uses: "Paediatric anti-flatulent drops as directed by a physician. Dose by dropper only.", notes: "Bottle, carton and sealed dropper photographed together.", image: "mbspas.png", alt: "MBSPAS simethicone dill and fennel oil 30 ml paediatric drops, bottle, carton and dropper." },
  { slug: "abinj", name: "ABINJ", pill: "Pain", filter: "pain", search: "abinj diclofenac sodium injection nsaid", form: "Injection", pack: "10 x 1 ml", composition: "Diclofenac Sodium Injection I.P.", uses: "For intradeltoid, intragluteal or I.V. infusion as labelled. Hospital use.", notes: "NSAID injectable. Front carton isolated from a shrink-wrapped stack.", image: "abinj.png", alt: "ABINJ Diclofenac Sodium Injection IP 10 by 1 ml carton." },
  { slug: "nhcort", name: "NHCORT Injection", pill: "Corticosteroid", filter: "pain", search: "nhcort triamcinolone acetonide injection", form: "Injectable suspension", pack: "1 ml vial", composition: "Triamcinolone Acetonide Injection I.P. 40 mg/ml.", uses: "For I.M. use only as prescribed. Not for intravenous use per this label.", notes: "One carton isolated from a six-pack photograph.", image: "nhcort.png", alt: "NHCORT Triamcinolone Acetonide Injection IP 40 mg per ml, 1 ml carton." },
  { slug: "nuheal", name: "Nuheal Tablet", pill: "Pain", filter: "pain", search: "nuheal aceclofenac paracetamol serratiopeptidase", form: "Tablet", pack: "Strip of 10 tablets", composition: "Aceclofenac 100 mg + paracetamol 325 mg + serratiopeptidase 15 mg.", uses: "Short-term pain and inflammation as prescribed.", notes: "Pack photograph not yet supplied; composition from pharmacy listings.", image: null, alt: "" },
  { slug: "piranum-nh", name: "PIRANUM-NH", pill: "Neuro", filter: "neuro", search: "piranum piracetam injection 200", form: "IV injection", pack: "60 ml vial", composition: "Piracetam IP 200 mg per ml, water for injections q.s. For IV use only.", uses: "Nootropic injectable used as directed by a physician. Aseptic IV technique.", notes: "Carton and hanging vial photographed together.", image: "piranum-nh.png", alt: "PIRANUM-NH Piracetam Injection 200 mg per ml 60 ml vial and carton for IV use." },
  { slug: "meconum-injection", name: "MECONUM Injection", pill: "Neuro", filter: "neuro", search: "meconum methylcobalamin 1500 injection", form: "Injection", pack: "5 x 1 ml ampoules", composition: "Methylcobalamin Injection 1500 mcg.", uses: "For I.M. / I.V. use only in vitamin B12 / neuropathy protocols as prescribed.", notes: "Front carton isolated from warehouse stacks.", image: "meconum-injection.png", alt: "MECONUM Methylcobalamin Injection 1500 mcg 5 by 1 ml ampoule carton." },
  { slug: "calcinum", name: "Calcinum Suspension", pill: "Bone health", filter: "nutra", search: "calcinum calcium zinc vitamin d3 magnesium mango", form: "Oral suspension", pack: "200 ml", composition: "Calcium carbonate, zinc, vitamin D3 and magnesium suspension. Mango flavour.", uses: "Nutritional support for bone health as advised.", notes: "Nutraceutical presentation.", image: "calcinum.png", alt: "Calcinum 200 ml mango flavour calcium zinc vitamin D3 and magnesium suspension carton." },
  { slug: "d3-micro", name: "D3 Micro Nano Shots", pill: "Vitamin D", filter: "nutra", search: "d3 micro nano shots vitamin d3 mango", form: "Oral solution", pack: "4 x 5 ml", composition: "Vitamin D3 oral solution. Sugar-free, mango flavour. Ready-to-drink nano shots.", uses: "Vitamin D supplementation as advised by a clinician.", notes: "Sugar-free nano-shot format.", image: "d3-micro.png", alt: "D3 Micro Nano Shots Vitamin D3 oral solution sugar-free mango flavour 4 by 5 ml carton." },
  { slug: "grohep", name: "GROHEP", pill: "Liver care", filter: "nutra", search: "grohep silymarin lecithin glutathione liver", form: "Syrup", pack: "200 ml", composition: "Lecithin, silymarin, vitamin B6, glutathione, choline citrate, L-ornithine L-aspartate. Sugar-free nutraceutical.", uses: "Hepatic nutritional support as advised. Not a substitute for treating liver disease.", notes: "Bottle and carton photographed together.", image: "grohep.png", alt: "GROHEP 200 ml sugar-free liver nutraceutical syrup bottle and carton." },
  { slug: "nutrapeg", name: "Nutrapeg Powder", pill: "Family nutrition", filter: "women", search: "nutrapeg protein powder pregnancy biotin dha kesar", form: "Powder", pack: "200 g jar", composition: "Protein drink mix with biotin and DHA. Sugar-free. Kesar elaichi flavour. FSSAI labelled.", uses: "Nutritional drink for pregnant women, lactating mothers, growing children and elderly persons as labelled.", notes: "Foods division presentation.", image: "nutrapeg.png", alt: "Nutrapeg 200 gram kesar elaichi protein powder jar, sugar-free with biotin and DHA." },
  { slug: "ovapreg", name: "OVAPREG", pill: "Women’s health", filter: "women", search: "ovapreg fertility pregnancy", form: "Tablet and syrup", pack: "As marketed", composition: "Refer to the labelled composition of each presentation.", uses: "Supportive women’s health brand. Use in pregnancy only on medical advice.", notes: "Founding brand. Pack photograph not in this batch.", image: null, alt: "" },
  { slug: "platonorm-syrup", name: "Platonorm Syrup", pill: "Ayurveda", filter: "ayurveda", search: "platonorm papaya giloy tulsi platelet ayurvedic", form: "Syrup", pack: "200 ml", composition: "Ayurvedic proprietary medicine: Carica papaya leaf, giloy, tulsi, aloe vera, kiwi extracts and goat milk powder syrup. Pineapple flavour.", uses: "Traditional platelet and wellness support as per Ayurvedic labelling. Not a substitute for treating dengue or thrombocytopenia without a doctor.", notes: "Confirmed from pack photography. Distinct from any allopathic 40 mg tablet listing.", image: "platonorm-syrup.png", alt: "Platonorm Ayurvedic 200 ml pineapple syrup bottle and carton with papaya leaf and giloy." },
  { slug: "nch-dx", name: "NCH-DX Syrup", pill: "Cough and cold", filter: "respiratory", search: "nch-dx dextromethorphan chlorpheniramine phenylephrine cough", form: "Syrup", pack: "As labelled, with measuring cap", composition: "Each 5 ml: dextromethorphan HBr IP 15 mg, chlorpheniramine maleate IP 2 mg, phenylephrine HCl IP 5 mg. Sugar-free.", uses: "Cough and cold syrup as prescribed. Not for children except as the label and physician allow.", notes: "Schedule H. Photograph of the amber bottle.", image: "nch-dx.png", alt: "NCH-DX dextromethorphan chlorpheniramine phenylephrine sugar-free syrup bottle." },
  { slug: "panzonum-injection", name: "Panzonum Injection", pill: "Hospital", filter: "gi", search: "panzonum injection pantoprazole 40", form: "Injection", pack: "Vial", composition: "Pantoprazole 40 mg.", uses: "When the oral route is unsuitable, as prescribed.", notes: "Pack photograph not in this batch.", image: null, alt: "" },
  { slug: "rabinum-d", name: "Rabinum D", pill: "Gastroenterology", filter: "gi", search: "rabinum rabeprazole domperidone", form: "SR capsule", pack: "Strip of 10", composition: "Domperidone 30 mg + rabeprazole 20 mg.", uses: "GERD and related dyspepsia as prescribed.", notes: "Pack photograph not in this batch.", image: null, alt: "" },
  { slug: "numcef", name: "Numcef 200 mg", pill: "Antibiotic", filter: "infection", search: "numcef cefixime 200", form: "Tablet", pack: "Strip of 10", composition: "Cefixime 200 mg.", uses: "Oral cephalosporin as prescribed.", notes: "Pack photograph not in this batch.", image: null, alt: "" },
  { slug: "macvir", name: "Macvir 800 mg", pill: "Antiviral", filter: "infection", search: "macvir antiviral 800", form: "Tablet", pack: "As marketed", composition: "800 mg antiviral tablet. Confirm the labelled salt on the pack.", uses: "Viral infections only when prescribed.", notes: "Pack photograph not in this batch.", image: null, alt: "" },
  { slug: "meconum-lg", name: "MECONUM-LG", pill: "Nutraceutical", filter: "nutra", search: "meconum lg nutraceutical capsule", form: "Capsule", pack: "As marketed", composition: "Confirm vitamins and antioxidants on the pack insert.", uses: "Supportive nutritional use as advised.", notes: "Distinct from MECONUM methylcobalamin injection.", image: null, alt: "" },
  { slug: "numal-forte", name: "Numal Forte", pill: "Infection", filter: "infection", search: "numal forte suspension", form: "Oral suspension", pack: "30 ml (trade listing)", composition: "Confirm the registered composition on the bottle.", uses: "Oral liquid in the infection range as prescribed.", notes: "Pack photograph not in this batch.", image: null, alt: "" }
];

const SVG = '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="14" y="8" width="20" height="32" rx="3"/><path d="M14 18h20"/></svg>';

function packListing(p) {
  if (p.image) {
    return `<img src="assets/products/${p.image}" width="600" height="600" alt="">`;
  }
  return SVG;
}

function packDetail(p) {
  if (!p.image) return "";
  return `<div class="product-hero"><img src="../assets/products/${p.image}" width="800" height="800" alt="${p.alt}"></div>`;
}

function card(p) {
  const blurb = p.uses.split(".")[0] + ".";
  return `          <a class="product-card" data-product="${p.search}" data-category="${p.filter}" href="products/${p.slug}.html">
            <div class="product-pack">${packListing(p)}</div>
            <div class="product-body"><span class="pill">${p.pill}</span><h3>${p.name}</h3><p class="muted">${blurb}</p></div>
          </a>`;
}

const shell = (p) => `<!DOCTYPE html>
<html lang="en-IN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${p.name} | Numac Healthcare</title>
  <meta name="description" content="${p.name} from Numac Healthcare. ${p.pill}. ${p.composition}">
  <link rel="icon" href="../assets/favicon.svg" type="image/svg+xml">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500&family=Source+Sans+3:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="../css/styles.css">
</head>
<body>
  <a class="skip-link" href="#main">Skip to main content</a>
  <header class="site-header">
    <div class="wrap-wide header-inner">
      <a class="brand" href="../index.html">
        <img src="../assets/logo.png" width="40" height="40" alt="">
        <span class="brand-text"><span class="brand-name">Numac</span><span class="brand-tag">Healthcare Pvt. Ltd.</span></span>
      </a>
      <nav class="site-nav" id="site-nav" aria-label="Primary">
        <ul>
          <li><a href="../index.html">Home</a></li>
          <li class="has-sub">
            <button type="button" class="nav-btn" aria-expanded="false" aria-haspopup="true">About</button>
            <div class="submenu">
              <a href="../about.html">Company</a>
              <a href="../about.html#mission">Mission and vision</a>
              <a href="../csr.html">Social responsibility</a>
              <a href="../quality.html">Quality</a>
            </div>
          </li>
          <li><a href="../products.html" aria-current="page">Products</a></li>
          <li><a href="../manufacturers.html">Manufacturers</a></li>
          <li><a href="../careers.html">Careers</a></li>
          <li><a class="nav-cta" href="../contact.html">Contact</a></li>
        </ul>
      </nav>
      <div class="header-tools">
        <button type="button" class="tool-btn" id="contrast-toggle" aria-pressed="false">High contrast</button>
        <button type="button" class="tool-btn" id="text-toggle" aria-pressed="false">Larger text</button>
        <button type="button" class="nav-toggle" aria-expanded="false" aria-controls="site-nav">
          <span class="visually-hidden">Open menu</span>
          <span class="nav-toggle-bars" aria-hidden="true"></span>
        </button>
      </div>
    </div>
  </header>
  <main id="main">
    <header class="page-hero">
      <div class="wrap-wide">
        <nav class="breadcrumbs" aria-label="Breadcrumb">
          <ol>
            <li><a href="../index.html">Home</a></li>
            <li><a href="../products.html">Products</a></li>
            <li>${p.name}</li>
          </ol>
        </nav>
        <p class="kicker">${p.pill}</p>
        <h1>${p.name}</h1>
        <p class="lede">${p.notes}</p>
      </div>
    </header>
    <section class="section" aria-labelledby="detail-title">
      <div class="wrap-wide split">
        <div>
          ${packDetail(p)}
          <h2 id="detail-title">Product information</h2>
          <dl class="pack-meta">
            <div><dt>Presentation</dt><dd>${p.form}</dd></div>
            <div><dt>Pack</dt><dd>${p.pack}</dd></div>
            <div><dt>Composition</dt><dd>${p.composition}</dd></div>
            <div><dt>Marketer</dt><dd>Numac Healthcare Pvt. Ltd.</dd></div>
          </dl>
          <h3>Clinical context</h3>
          <p>${p.uses}</p>
          <p><a class="btn btn-solid" href="../contact.html#hcp">Request literature</a>
          <a class="btn btn-outline" href="../products.html">Back to catalogue</a></p>
        </div>
        <aside class="notice" role="note">
          <p><strong>Prescription and safety.</strong> This page is educational. It is not a diagnosis or a dose calculator. The pack insert and a registered medical practitioner overrule this website.</p>
          <p>To report a suspected adverse reaction, see <a href="../quality.html#pv">pharmacovigilance</a>.</p>
        </aside>
      </div>
    </section>
  </main>
  <footer class="site-footer">
    <div class="wrap-wide">
      <div class="footer-grid">
        <div>
          <h2>Numac Healthcare</h2>
          <p>Malleshwaram, Bengaluru 560003</p>
          <p><a href="mailto:numachealthcare@yahoo.com">numachealthcare@yahoo.com</a></p>
        </div>
        <div>
          <h2>Explore</h2>
          <ul>
            <li><a href="../about.html">About us</a></li>
            <li><a href="../products.html">Products</a></li>
            <li><a href="../manufacturers.html">Manufacturers</a></li>
            <li><a href="../careers.html">Careers</a></li>
          </ul>
        </div>
        <div>
          <h2>Company</h2>
          <ul>
            <li><a href="../csr.html">CSR</a></li>
            <li><a href="../contact.html">Contact</a></li>
            <li><a href="../accessibility.html">Accessibility</a></li>
            <li><a href="../privacy.html">Privacy</a></li>
          </ul>
        </div>
        <div>
          <h2>Professionals</h2>
          <ul>
            <li><a href="../quality.html#pv">Adverse event</a></li>
          </ul>
        </div>
      </div>
      <p class="disclaimer">Always read the label. Manufactured at qualified third-party sites for Numac Healthcare.</p>
      <div class="footer-meta">
        <p>© 2026 Numac Healthcare Private Limited.</p>
        <p>WCAG 2.2 AA-oriented</p>
      </div>
    </div>
  </footer>
  <script src="../js/main.js" defer></script>
</body>
</html>
`;

const root = path.join(__dirname, "..");
const dir = path.join(root, "products");
fs.mkdirSync(dir, { recursive: true });
for (const p of products) {
  fs.writeFileSync(path.join(dir, p.slug + ".html"), shell(p));
}

const catalogue = products.filter((p) => p.image);
const listing = path.join(root, "products.html");
let html = fs.readFileSync(listing, "utf8");
html = html.replace(
  /<p class="live" id="filter-status"[^>]*>[\s\S]*?<\/p>/,
  `<p class="live" id="filter-status" aria-live="polite">${catalogue.length} products shown.</p>`
);
html = html.replace(
  /<div class="product-grid">[\s\S]*?<\/div>\r?\n\r?\n        <aside/,
  `<div class="product-grid">\n${catalogue.map(card).join("\n")}\n        </div>\n\n        <aside`
);
fs.writeFileSync(listing, html);
console.log("Wrote", products.length, "product pages and", catalogue.length, "catalogue cards");
