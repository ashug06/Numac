(function () {
  "use strict";

  var root = document.documentElement;
  var contrastKey = "numac-contrast";
  var textKey = "numac-text";
  var navBreakpoint = 1024;

  function setPressed(btn, on) {
    if (btn) btn.setAttribute("aria-pressed", on ? "true" : "false");
  }

  function applyPrefs() {
    var contrast = localStorage.getItem(contrastKey) === "high";
    var large = localStorage.getItem(textKey) === "large";
    if (contrast) root.setAttribute("data-contrast", "high");
    else root.removeAttribute("data-contrast");
    if (large) root.setAttribute("data-text", "large");
    else root.removeAttribute("data-text");
    setPressed(document.getElementById("contrast-toggle"), contrast);
    setPressed(document.getElementById("text-toggle"), large);
  }

  applyPrefs();

  var contrastBtn = document.getElementById("contrast-toggle");
  var textBtn = document.getElementById("text-toggle");
  if (contrastBtn) {
    contrastBtn.addEventListener("click", function () {
      var on = localStorage.getItem(contrastKey) !== "high";
      localStorage.setItem(contrastKey, on ? "high" : "default");
      applyPrefs();
    });
  }
  if (textBtn) {
    textBtn.addEventListener("click", function () {
      var on = localStorage.getItem(textKey) !== "large";
      localStorage.setItem(textKey, on ? "large" : "default");
      applyPrefs();
    });
  }

  var header = document.querySelector(".site-header");
  function onScroll() {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");
  var backdrop = document.querySelector(".nav-backdrop");
  var lastFocus = null;
  if (!backdrop) {
    backdrop = document.createElement("div");
    backdrop.className = "nav-backdrop";
    backdrop.setAttribute("hidden", "");
    document.body.appendChild(backdrop);
  }

  function focusables() {
    var list = [];
    if (toggle) list.push(toggle);
    if (nav) {
      nav.querySelectorAll("a, button").forEach(function (el) {
        list.push(el);
      });
    }
    return list;
  }

  function setNav(open) {
    if (!toggle || !nav) return;
    var isOpen = toggle.getAttribute("aria-expanded") === "true";
    if (!open && !isOpen) return;
    toggle.setAttribute("aria-expanded", String(open));
    nav.classList.toggle("is-open", open);
    backdrop.classList.toggle("is-open", open);
    if (open) backdrop.removeAttribute("hidden");
    else backdrop.setAttribute("hidden", "");
    document.body.style.overflow = open ? "hidden" : "";
    var label = toggle.querySelector(".visually-hidden");
    if (label) label.textContent = open ? "Close menu" : "Open menu";
    if (open) {
      lastFocus = document.activeElement;
    } else if (lastFocus && typeof lastFocus.focus === "function") {
      lastFocus.focus();
    }
  }

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      setNav(toggle.getAttribute("aria-expanded") !== "true");
    });
    backdrop.addEventListener("click", function () {
      setNav(false);
    });
  }

  window.addEventListener("resize", function () {
    if (window.innerWidth > navBreakpoint) setNav(false);
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      setNav(false);
      return;
    }
    if (event.key !== "Tab" || !nav || !nav.classList.contains("is-open")) return;
    var list = focusables();
    if (!list.length) return;
    var first = list[0];
    var last = list[list.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  var filterForm = document.getElementById("product-filters");
  var searchInput = document.getElementById("product-search");
  var cards = document.querySelectorAll("#product-grid [data-product], .product-grid [data-product]");
  var live = document.getElementById("filter-status");
  var pager = document.getElementById("catalogue-pager");
  var PAGE_SIZE = 12;
  var currentPage = 1;

  function matchingCards() {
    var category = "all";
    if (filterForm) {
      var checked = filterForm.querySelector('input[name="category"]:checked');
      if (checked) category = checked.value;
    }
    var query = searchInput ? searchInput.value.trim().toLowerCase() : "";
    var matched = [];
    cards.forEach(function (card) {
      var matchCat = category === "all" || card.getAttribute("data-category") === category;
      var hay = (card.getAttribute("data-product") + " " + card.textContent).toLowerCase();
      var matchQuery = !query || hay.indexOf(query) !== -1;
      if (matchCat && matchQuery) matched.push(card);
    });
    return matched;
  }

  function renderPager(total, pages) {
    if (!pager) return;
    if (pages <= 1) {
      pager.hidden = true;
      pager.innerHTML = "";
      return;
    }
    pager.hidden = false;
    var html = "";
    var i;
    html += '<button type="button" class="pager-btn" data-page="prev"' + (currentPage === 1 ? " disabled" : "") + ">Previous</button>";
    for (i = 1; i <= pages; i += 1) {
      html += '<button type="button" class="pager-btn' + (i === currentPage ? " is-current" : "") + '" data-page="' + i + '" aria-label="Page ' + i + '"' + (i === currentPage ? ' aria-current="page"' : "") + ">" + i + "</button>";
    }
    html += '<button type="button" class="pager-btn" data-page="next"' + (currentPage === pages ? " disabled" : "") + ">Next</button>";
    pager.innerHTML = html;
  }

  function filterProducts() {
    if (!cards.length) return;
    var matched = matchingCards();
    var pages = Math.max(1, Math.ceil(matched.length / PAGE_SIZE));
    if (currentPage > pages) currentPage = 1;
    var start = (currentPage - 1) * PAGE_SIZE;
    var visible = matched.slice(start, start + PAGE_SIZE);
    cards.forEach(function (card) {
      card.hidden = visible.indexOf(card) === -1;
    });
    if (live) {
      var rangeStart = matched.length ? start + 1 : 0;
      var rangeEnd = start + visible.length;
      live.textContent =
        matched.length === 0
          ? "No products match this search."
          : matched.length +
            " product" +
            (matched.length === 1 ? "" : "s") +
            " shown" +
            (pages > 1 ? " (" + rangeStart + "–" + rangeEnd + ")" : "") +
            ".";
    }
    renderPager(matched.length, pages);
  }

  if (filterForm) {
    filterForm.addEventListener("change", function () {
      currentPage = 1;
      filterProducts();
    });
  }
  if (searchInput) {
    searchInput.addEventListener("input", function () {
      currentPage = 1;
      filterProducts();
    });
  }
  if (pager) {
    pager.addEventListener("click", function (event) {
      var btn = event.target.closest("[data-page]");
      if (!btn || btn.disabled) return;
      var value = btn.getAttribute("data-page");
      var matched = matchingCards();
      var pages = Math.max(1, Math.ceil(matched.length / PAGE_SIZE));
      if (value === "prev") currentPage = Math.max(1, currentPage - 1);
      else if (value === "next") currentPage = Math.min(pages, currentPage + 1);
      else currentPage = Number(value) || 1;
      filterProducts();
      var grid = document.getElementById("product-grid");
      if (grid) grid.scrollIntoView({ block: "start" });
    });
  }
  filterProducts();

  function collectWeb3Payload(form) {
    var payload = {
      access_key: window.NUMAC_WEB3FORMS_ACCESS_KEY || "",
      subject: form.getAttribute("data-subject") || "Website enquiry"
    };
    form.querySelectorAll("input, select, textarea").forEach(function (field) {
      if (!field.name || field.type === "file") return;
      if (field.name === "website" || field.name === "access_key") return;
      payload[field.name] = field.value;
    });
    if (payload.name) payload.from_name = payload.name;
    if (payload.email) payload.replyto = payload.email;
    return payload;
  }

  document.querySelectorAll("form.js-validate").forEach(function (form) {
    form.setAttribute("data-started", String(Date.now()));
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var valid = true;
      var firstInvalid = null;
      form.querySelectorAll("[required]").forEach(function (field) {
        var row = field.closest(".form-row");
        var ok = field.type === "checkbox" ? field.checked : field.value.trim().length > 0;
        if (field.type === "email") {
          ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value.trim());
        }
        if (field.type === "tel" && field.hasAttribute("required")) {
          ok = field.value.replace(/\D/g, "").length >= 10;
        }
        if (row) row.classList.toggle("is-invalid", !ok);
        field.setAttribute("aria-invalid", ok ? "false" : "true");
        if (!ok) {
          valid = false;
          if (!firstInvalid) firstInvalid = field;
        }
      });
      var status = form.querySelector(".form-status");
      var submitBtn = form.querySelector('[type="submit"]');
      if (!valid) {
        if (status) {
          status.hidden = false;
          status.className = "form-status error";
          status.textContent = "Please correct the highlighted fields and submit again.";
        }
        if (firstInvalid) firstInvalid.focus();
        return;
      }
      if (submitBtn) submitBtn.disabled = true;
      if (status) {
        status.hidden = false;
        status.className = "form-status";
        status.textContent = "Sending enquiry…";
      }
      var honeypot = form.querySelector('input[name="website"]');
      if (honeypot && honeypot.value.trim()) {
        if (status) {
          status.className = "form-status error";
          status.textContent = "The enquiry could not be delivered. Please email numachealthcare@yahoo.com.";
        }
        if (submitBtn) submitBtn.disabled = false;
        return;
      }
      var started = Number(form.getAttribute("data-started"));
      if (started && Date.now() - started < 1500) {
        if (status) {
          status.className = "form-status error";
          status.textContent = "Please wait a moment and submit again.";
        }
        if (submitBtn) submitBtn.disabled = false;
        return;
      }
      var payload = collectWeb3Payload(form);
      if (!payload.access_key) {
        if (status) {
          status.className = "form-status error";
          status.textContent = "The enquiry could not be delivered. Please email numachealthcare@yahoo.com.";
        }
        if (submitBtn) submitBtn.disabled = false;
        return;
      }
      fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload)
      })
        .then(function (res) {
          return res.json().then(function (json) {
            return { ok: res.ok, json: json };
          });
        })
        .then(function (result) {
          if (result.ok && result.json && result.json.success === true) {
            if (status) {
              status.className = "form-status success";
              status.textContent =
                "Your enquiry has been sent to Numac Healthcare. If you meant to attach a CV, email it separately to numachealthcare@yahoo.com.";
            }
            form.reset();
            form.setAttribute("data-started", String(Date.now()));
            form.querySelectorAll(".form-row.is-invalid").forEach(function (row) {
              row.classList.remove("is-invalid");
            });
            return;
          }
          if (status) {
            status.className = "form-status error";
            var providerMsg = result.json && (result.json.message || (result.json.body && result.json.body.message));
            status.textContent =
              providerMsg ||
              "The enquiry could not be delivered. Please email numachealthcare@yahoo.com.";
          }
        })
        .catch(function () {
          if (status) {
            status.className = "form-status error";
            status.textContent = "The enquiry could not be delivered. Please email numachealthcare@yahoo.com.";
          }
        })
        .finally(function () {
          if (submitBtn) submitBtn.disabled = false;
        });
    });
  });
})();
