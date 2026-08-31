(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Sticky header shadow ---------- */
  var header = document.getElementById("siteHeader");
  function onScrollHeader() {
    if (window.scrollY > 8) header.classList.add("is-scrolled");
    else header.classList.remove("is-scrolled");
  }
  document.addEventListener("scroll", onScrollHeader, { passive: true });
  onScrollHeader();

  /* ---------- Mobile menu ---------- */
  var toggle = document.getElementById("navToggle");
  var menu = document.getElementById("mobileMenu");
  function closeMenu() {
    toggle.setAttribute("aria-expanded", "false");
    menu.classList.remove("is-open");
    document.body.style.overflow = "";
  }
  function openMenu() {
    toggle.setAttribute("aria-expanded", "true");
    menu.classList.add("is-open");
    document.body.style.overflow = "hidden";
  }
  toggle.addEventListener("click", function () {
    var isOpen = toggle.getAttribute("aria-expanded") === "true";
    if (isOpen) closeMenu(); else openMenu();
  });
  menu.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", closeMenu);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeMenu();
  });

  /* ---------- Scroll reveal (single, restrained pattern) ---------- */
  if (!reduceMotion && "IntersectionObserver" in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    document.querySelectorAll(".reveal").forEach(function (el) {
      observer.observe(el);
    });
  } else {
    document.querySelectorAll(".reveal").forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  /* ---------- Hero: one subtle, deliberate parallax moment ---------- */
  var heroMedia = document.getElementById("heroMedia");
  if (heroMedia && !reduceMotion) {
    var heroImg = heroMedia.querySelector("img");
    var ticking = false;
    function updateParallax() {
      var rect = heroMedia.getBoundingClientRect();
      var progress = Math.min(Math.max((0 - rect.top) / (rect.height || 1), 0), 1);
      heroImg.style.transform = "translateY(" + (progress * 30) + "px) scale(1.06)";
      ticking = false;
    }
    document.addEventListener(
      "scroll",
      function () {
        if (!ticking) {
          window.requestAnimationFrame(updateParallax);
          ticking = true;
        }
      },
      { passive: true }
    );
    updateParallax();
  }

  /* ---------- Footer year ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Contact form (Web3Forms) ---------- */
  var form = document.getElementById("contactForm");
  var status = document.getElementById("formStatus");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var key = document.getElementById("web3formsKey").value;
      if (!key || key.indexOf("REPLACE_WITH") === 0) {
        status.dataset.state = "error";
        status.textContent =
          "The form isn't connected to an email endpoint yet — see README.md (\"Contact form setup\") to add a free Web3Forms access key. Meanwhile, email hello@digitalnomadsistria.com directly.";
        return;
      }
      status.dataset.state = "";
      status.textContent = "Sending…";
      var submitBtn = form.querySelector("button[type=submit]");
      submitBtn.disabled = true;

      fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new FormData(form),
      })
        .then(function (res) { return res.json(); })
        .then(function (data) {
          submitBtn.disabled = false;
          if (data.success) {
            status.dataset.state = "success";
            status.textContent = "Message sent — thank you. We'll reply from a person, usually within a day or two.";
            form.reset();
          } else {
            status.dataset.state = "error";
            status.textContent =
              "Something went wrong sending that. Please try again, or email hello@digitalnomadsistria.com directly.";
          }
        })
        .catch(function () {
          submitBtn.disabled = false;
          status.dataset.state = "error";
          status.textContent =
            "Couldn't reach the form service. Please email hello@digitalnomadsistria.com directly.";
        });
    });
  }
})();
