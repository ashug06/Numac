(function () {
  "use strict";

  var root = document.documentElement;
  var contrastKey = "numac-contrast";
  var textKey = "numac-text";

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

  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      nav.classList.toggle("is-open", !open);
    });
  }

  document.querySelectorAll(".has-sub > .nav-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var parent = btn.parentElement;
      var expanded = btn.getAttribute("aria-expanded") === "true";
      document.querySelectorAll(".has-sub").forEach(function (item) {
        item.classList.remove("is-open");
        var b = item.querySelector(".nav-btn");
        if (b) b.setAttribute("aria-expanded", "false");
      });
      if (!expanded) {
        parent.classList.add("is-open");
        btn.setAttribute("aria-expanded", "true");
      }
    });
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      document.querySelectorAll(".has-sub").forEach(function (item) {
        item.classList.remove("is-open");
        var b = item.querySelector(".nav-btn");
        if (b) b.setAttribute("aria-expanded", "false");
      });
      if (toggle && nav && toggle.getAttribute("aria-expanded") === "true") {
        toggle.setAttribute("aria-expanded", "false");
        nav.classList.remove("is-open");
        toggle.focus();
      }
    }
  });

  var filterForm = document.getElementById("product-filters");
  var searchInput = document.getElementById("product-search");
  var cards = document.querySelectorAll("[data-product]");
  var live = document.getElementById("filter-status");

  function filterProducts() {
    if (!cards.length) return;
    var category = "all";
    if (filterForm) {
      var checked = filterForm.querySelector('input[name="category"]:checked');
      if (checked) category = checked.value;
    }
    var query = searchInput ? searchInput.value.trim().toLowerCase() : "";
    var shown = 0;
    cards.forEach(function (card) {
      var matchCat = category === "all" || card.getAttribute("data-category") === category;
      var hay = (card.getAttribute("data-product") + " " + card.textContent).toLowerCase();
      var matchQuery = !query || hay.indexOf(query) !== -1;
      var show = matchCat && matchQuery;
      card.hidden = !show;
      if (show) shown += 1;
    });
    if (live) {
      live.textContent = shown + " product" + (shown === 1 ? "" : "s") + " shown.";
    }
  }

  if (filterForm) {
    filterForm.addEventListener("change", filterProducts);
  }
  if (searchInput) {
    searchInput.addEventListener("input", filterProducts);
  }

  document.querySelectorAll("form.js-validate").forEach(function (form) {
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
        if (row) row.classList.toggle("is-invalid", !ok);
        field.setAttribute("aria-invalid", ok ? "false" : "true");
        if (!ok) {
          valid = false;
          if (!firstInvalid) firstInvalid = field;
        }
      });
      var status = form.querySelector(".form-status");
      if (!valid) {
        if (status) {
          status.hidden = false;
          status.className = "form-status error";
          status.textContent = "Please correct the highlighted fields and submit again.";
        }
        if (firstInvalid) firstInvalid.focus();
        return;
      }
      if (status) {
        status.hidden = false;
        status.className = "form-status success";
        status.textContent =
          "Thank you. Your message has been recorded on this device. Our team will follow up using the contact details you provided. For urgent medical advice, consult a registered medical practitioner.";
      }
      form.reset();
      form.querySelectorAll(".form-row.is-invalid").forEach(function (row) {
        row.classList.remove("is-invalid");
      });
    });
  });
})();
