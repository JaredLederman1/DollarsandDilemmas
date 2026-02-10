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

  /* ---------- Contact form (client-side validation + async submit) ---------- */
  const contactForm = $("form[data-contact-form]");
  const successMsg = $("#form-success");

  if (contactForm) {
    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const nameField = $("input[name='name']", contactForm);
      const emailField = $("input[name='email']", contactForm);
      const msgField = $("textarea[name='message']", contactForm);
      let valid = true;

      // Helpers
      const clearError = (field) => {
        if (!field) return;
        field.classList.remove("field-error");
        const errEl = field.closest(".field")?.querySelector(".error-text");
        if (errEl) errEl.remove();
      };

      const setError = (field, msg) => {
        if (!field) return;
        field.classList.add("field-error");
        const wrapper = field.closest(".field");
        if (!wrapper) return;
        let errEl = wrapper.querySelector(".error-text");
        if (!errEl) {
          errEl = document.createElement("span");
          errEl.className = "error-text";
          wrapper.appendChild(errEl);
        }
        errEl.textContent = msg;
      };

      // Clear previous
      [nameField, emailField, msgField].forEach(clearError);

      // Validate
      if (!nameField?.value.trim()) {
        valid = false;
        setError(nameField, "Please enter your name.");
      }

      const emailVal = emailField?.value.trim() || "";
      const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailVal) {
        valid = false;
        setError(emailField, "Please enter your email.");
      } else if (!emailRe.test(emailVal)) {
        valid = false;
        setError(emailField, "Please enter a valid email address.");
      }

      if (!msgField?.value.trim()) {
        valid = false;
        setError(msgField, "Please enter a message.");
      }

      if (!valid) return;

      // Submit
      const submitBtn = $("button[type='submit']", contactForm);
      const originalText = submitBtn?.textContent;
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Sending…";
      }

      try {
        // Add timeout to prevent hanging
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

        // Use FormData for Formspree (standard form submission)
        const formData = new FormData();
        formData.append("name", nameField.value.trim());
        formData.append("email", emailField.value.trim());
        formData.append("message", msgField.value.trim());
        // Add _replyto for Formspree to set reply-to header
        formData.append("_replyto", emailField.value.trim());

        const res = await fetch(contactForm.action, {
          method: "POST",
          body: formData,
          headers: {
            "Accept": "application/json"
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (res.ok) {
          contactForm.style.display = "none";
          if (successMsg) successMsg.classList.add("visible");
        } else {
          let errorMsg = "Server error";
          try {
            const errorData = await res.json();
            errorMsg = errorData.error || errorMsg;
          } catch {
            errorMsg = `Server returned ${res.status} ${res.statusText}`;
          }
          throw new Error(errorMsg);
        }
      } catch (err) {
        // Show error message to user
        let errorMessage = "Failed to send message. ";
        if (err.name === "AbortError") {
          errorMessage = "Request timed out. ";
        } else if (err.message && err.message.includes("Failed to fetch")) {
          errorMessage = "Unable to connect to server. ";
        } else if (err.message) {
          errorMessage = err.message + " ";
        }
        errorMessage += "Please email us directly at jared@dollarsanddilemmas.com";
        setError(msgField, errorMessage);
        console.error("Form submission error:", err);
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
        }
      }
    });
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
