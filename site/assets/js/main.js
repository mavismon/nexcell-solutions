(() => {
  "use strict";

  const body = document.body;

  /* ---------- Mobile drawer ---------- */
  const toggle = document.querySelector(".menu-toggle");
  const drawer = document.getElementById("mobile-menu");
  const scrim = document.querySelector(".drawer-scrim");

  if (toggle && drawer) {
    const focusables = () => drawer.querySelectorAll("a, button");

    const setMenu = (open) => {
      body.classList.toggle("menu-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      drawer.setAttribute("aria-hidden", String(!open));
      if (open) setTimeout(() => focusables()[0]?.focus(), 60);
      else toggle.focus({ preventScroll: true });
    };

    toggle.addEventListener("click", () => setMenu(!body.classList.contains("menu-open")));
    scrim?.addEventListener("click", () => setMenu(false));
    drawer.querySelector(".drawer__close")?.addEventListener("click", () => setMenu(false));
    drawer.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));

    document.addEventListener("keydown", (e) => {
      if (!body.classList.contains("menu-open")) return;
      if (e.key === "Escape") setMenu(false);
      if (e.key === "Tab") {
        const els = focusables();
        const first = els[0];
        const last = els[els.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });

    window.matchMedia("(min-width: 900px)").addEventListener("change", (mq) => {
      if (mq.matches && body.classList.contains("menu-open")) setMenu(false);
    });
  }

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll(".faq-item").forEach((item) => {
    const btn = item.querySelector(".faq-q");
    btn.setAttribute("aria-expanded", "false");
    btn.addEventListener("click", () => {
      const open = item.classList.toggle("is-open");
      btn.setAttribute("aria-expanded", String(open));
    });
  });

  /* ---------- Reveal on scroll ---------- */
  const revealEls = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window && revealEls.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  /* ---------- Contact form ----------
     No backend yet: validates, then opens the visitor's email client
     with the enquiry pre-filled to contact@nexcellsolutions.com. */
  const form = document.getElementById("contact-form");
  if (form) {
    const status = form.querySelector(".form__status");

    const showError = (field, message) => {
      const input = form.elements[field];
      const error = form.querySelector(`#${field}-error`);
      input.setAttribute("aria-invalid", message ? "true" : "false");
      if (error) error.textContent = message || "";
    };

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(form));
      let firstInvalid = null;

      const checks = {
        name: data.name.trim() ? "" : "Tell us your name.",
        email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim()) ? "" : "Enter a valid email address.",
        message: data.message.trim().length >= 10 ? "" : "A sentence or two about what's slow helps us reply properly.",
      };
      Object.entries(checks).forEach(([field, msg]) => {
        showError(field, msg);
        if (msg && !firstInvalid) firstInvalid = form.elements[field];
      });
      if (firstInvalid) { firstInvalid.focus(); return; }

      const subject = `Enquiry from ${data.name.trim()}${data.company.trim() ? ` (${data.company.trim()})` : ""}`;
      const text = `${data.message.trim()}\n\n— ${data.name.trim()}\n${data.email.trim()}${data.company.trim() ? `\n${data.company.trim()}` : ""}`;
      window.location.href = `mailto:contact@nexcellsolutions.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
      status.textContent = "Your email app should open with your message ready to send. If it doesn't, email contact@nexcellsolutions.com.";
    });
  }

  /* ---------- Let other scripts prefill the form (used by the agent) ---------- */
  window.NexCell = window.NexCell || {};
  window.NexCell.prefillContact = (fields = {}) => {
    if (!form) return false;
    Object.entries(fields).forEach(([k, v]) => { if (form.elements[k] && v) form.elements[k].value = v; });
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
    setTimeout(() => form.elements.name?.focus({ preventScroll: true }), 500);
    return true;
  };

  /* ---------- Footer year ---------- */
  document.querySelectorAll("[data-year]").forEach((el) => { el.textContent = new Date().getFullYear(); });
})();
