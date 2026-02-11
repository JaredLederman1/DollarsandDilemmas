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

  /* ---------- Curriculum card expand ---------- */
  const expandableCards = $$(".curriculum-card[data-expandable]");

  expandableCards.forEach((card) => {
    card.addEventListener("click", () => {
      const isExpanded = card.classList.contains("expanded");

      // Close all cards first
      expandableCards.forEach((other) => {
        other.classList.remove("expanded");
        // Reset max-height on the expand body so it collapses
        const body = other.querySelector(".card-expand");
        if (body) body.style.maxHeight = "0";
      });

      // Toggle current card
      if (!isExpanded) {
        card.classList.add("expanded");
        const body = card.querySelector(".card-expand");
        if (body) body.style.maxHeight = body.scrollHeight + "px";
      }
    });
  });

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

  /* ---------- Contact form (Formspree AJAX integration) ---------- */
  const contactForm = $("form.contact-form");
  const successMsg = $("#form-success");
  
  if (contactForm) {
    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault(); // Prevent default form submission
      
      const nameField = $("input[name='name']", contactForm);
      const emailField = $("input[name='email']", contactForm);
      const msgField = $("textarea[name='message']", contactForm);
      const submitBtn = $("button[type='submit']", contactForm);
      
      // Helper to show errors
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
      
      const clearErrors = () => {
        const errorTexts = contactForm.querySelectorAll(".error-text");
        errorTexts.forEach(el => el.remove());
        const errorFields = contactForm.querySelectorAll(".field-error");
        errorFields.forEach(field => field.classList.remove("field-error"));
      };
      
      // Clear previous errors
      clearErrors();
      
      // Basic validation
      let valid = true;
      if (!nameField?.value.trim()) {
        valid = false;
        setError(nameField, "Please enter your name.");
      }
      if (!emailField?.value.trim()) {
        valid = false;
        setError(emailField, "Please enter your email.");
      }
      if (!msgField?.value.trim()) {
        valid = false;
        setError(msgField, "Please enter a message.");
      }
      
      if (!valid) return;
      
      // Disable button and show loading state
      const originalText = submitBtn?.textContent;
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Sending…";
      }
      
      try {
        // Create FormData for Formspree
        const formData = new FormData(contactForm);
        
        // Submit to Formspree via AJAX
        const res = await fetch(contactForm.action, {
          method: "POST",
          body: formData,
          headers: {
            "Accept": "application/json"
          }
        });
        
        if (res.ok) {
          // Success - hide form and show success message
          contactForm.style.display = "none";
          if (successMsg) {
            successMsg.style.display = "block";
            successMsg.classList.add("visible");
          }
        } else {
          // Error response from Formspree
          const errorData = await res.json().catch(() => ({}));
          setError(msgField, errorData.error || "Failed to send message. Please try again.");
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
          }
        }
      } catch (err) {
        // Network or other error
        setError(msgField, "Failed to send message. Please try again or email us directly at jared@dollarsanddilemmas.com");
        console.error("Form submission error:", err);
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
