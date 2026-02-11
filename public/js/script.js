/* ===========================================
   Dollars & Dilemmas — Main Script
   =========================================== */
document.addEventListener("DOMContentLoaded", () => {
  /* ---------- Utilities ---------- */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  /* ---------- Year ---------- */
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear().toString();

  /* ---------- Sticky header ---------- */
  const header = $(".site-header");
  const onScroll = () => {
    if (!header) return;
    header.classList.toggle("scrolled", window.scrollY > 20);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile nav toggle ---------- */
  const navToggle = $(".nav-toggle");
  const navList = $("#nav-menu");

  if (navToggle && navList) {
    navToggle.addEventListener("click", () => {
      const isOpen = navList.classList.toggle("open");
      navToggle.classList.toggle("open", isOpen);
      navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    // Close on link click
    navList.addEventListener("click", (e) => {
      if (e.target.closest("a")) {
        navList.classList.remove("open");
        navToggle.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---------- Scroll reveal (IntersectionObserver) ---------- */
  const revealEls = $$("[data-animate], [data-stagger]");

  if ("IntersectionObserver" in window && revealEls.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.1 }
    );
    revealEls.forEach((el) => observer.observe(el));
  } else {
    // Fallback: show everything
    revealEls.forEach((el) => el.classList.add("in-view"));
  }

  /* ---------- Testimonial carousel ---------- */
  const testimonialCards = $$(".testimonial-card");
  const testimonialDots = $$(".testimonial-dot");
  let activeSlide = 0;
  let carouselTimer;

  const showSlide = (index) => {
    if (!testimonialCards.length) return;
    activeSlide = ((index % testimonialCards.length) + testimonialCards.length) % testimonialCards.length;
    testimonialCards.forEach((c, i) => c.classList.toggle("active", i === activeSlide));
    testimonialDots.forEach((d, i) => d.classList.toggle("active", i === activeSlide));
  };

  const startAutoplay = () => {
    if (!testimonialCards.length) return;
    clearInterval(carouselTimer);
    carouselTimer = setInterval(() => showSlide(activeSlide + 1), 6000);
  };

  if (testimonialDots.length) {
    testimonialDots.forEach((dot) => {
      dot.addEventListener("click", () => {
        showSlide(parseInt(dot.dataset.index, 10));
        startAutoplay(); // Reset timer on manual click
      });
    });
    startAutoplay();
  }

  /* ---------- Contact form (Formspree integration) ---------- */
  const contactForm = $("form.contact-form");
  const successMsg = $("#form-success");
  
  if (contactForm) {
    // Handle Formspree success/error responses
    contactForm.addEventListener("submit", (e) => {
      const submitBtn = $("button[type='submit']", contactForm);
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Sending…";
      }
    });

    // Check for Formspree success message in URL (after redirect)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("success") === "true") {
      contactForm.style.display = "none";
      if (successMsg) {
        successMsg.style.display = "block";
        successMsg.classList.add("visible");
      }
    }
  }

  /* ---------- Smooth scroll for anchor links ---------- */
  $$('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const id = link.getAttribute("href");
      if (!id || id === "#") return;
      const target = $(id);
      if (!target) return;
      e.preventDefault();
      // Scroll to the very top for #top, otherwise offset by header height
      const scrollTop = id === "#top" ? 0 : target.offsetTop - (header ? header.offsetHeight + 16 : 16);
      window.scrollTo({
        top: scrollTop,
        behavior: "smooth",
      });
      // Update URL without jump
      history.pushState(null, "", id);
    });
  });
});
