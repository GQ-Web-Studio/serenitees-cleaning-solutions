document.documentElement.classList.add("has-reveal-motion");

document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector("[data-site-header]");

  if (!header) return;

  const menuToggle = header.querySelector("[data-menu-toggle]");
  const mobileMenu = header.querySelector("[data-mobile-menu]");
  const desktopMedia = window.matchMedia("(min-width: 841px)");

  const updateScrolledState = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  };

  const closeMenu = ({ returnFocus = false } = {}) => {
    if (!menuToggle || !mobileMenu) return;

    header.classList.remove("is-menu-open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation menu");
    mobileMenu.setAttribute("aria-hidden", "true");
    mobileMenu.setAttribute("inert", "");

    if (returnFocus) menuToggle.focus();
  };

  const openMenu = () => {
    if (!menuToggle || !mobileMenu) return;

    header.classList.add("is-menu-open");
    menuToggle.setAttribute("aria-expanded", "true");
    menuToggle.setAttribute("aria-label", "Close navigation menu");
    mobileMenu.setAttribute("aria-hidden", "false");
    mobileMenu.removeAttribute("inert");
    mobileMenu.querySelector("a")?.focus();
  };

  updateScrolledState();
  window.addEventListener("scroll", updateScrolledState, { passive: true });

  menuToggle?.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    isOpen ? closeMenu() : openMenu();
  });

  mobileMenu?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => closeMenu());
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && header.classList.contains("is-menu-open")) {
      closeMenu({ returnFocus: true });
    }
  });

  document.addEventListener("click", (event) => {
    if (header.classList.contains("is-menu-open") && !header.contains(event.target)) {
      closeMenu();
    }
  });

  const handleBreakpointChange = (event) => {
    if (event.matches) closeMenu();
  };

  desktopMedia.addEventListener?.("change", handleBreakpointChange);

  const revealGroups = document.querySelectorAll("[data-reveal-group]");
  const individualRevealItems = document.querySelectorAll("[data-reveal-individually] [data-reveal-item]");
  const individualRevealTitles = document.querySelectorAll(
    "[data-reveal-individually] .cleaning-services__title[data-reveal-item], " +
    "[data-reveal-individually] .areas-served__title[data-reveal-item], " +
    "[data-reveal-individually] .areas-served__intro[data-reveal-item], " +
    "[data-reveal-individually] .residential-faq__title[data-reveal-item]"
  );
  const individualRevealCards = document.querySelectorAll(
    "[data-reveal-individually] .cleaning-service-card[data-reveal-item], " +
    "[data-reveal-individually] .areas-served__card[data-reveal-item], " +
    "[data-reveal-individually] .residential-faq-item[data-reveal-item]"
  );

  if (revealGroups.length || individualRevealItems.length) {
    if (!("IntersectionObserver" in window)) {
      revealGroups.forEach((group) => group.classList.add("is-revealed"));
      individualRevealItems.forEach((item) => item.classList.add("is-revealed"));
    } else {
      const revealOnce = (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          entry.target.classList.add("is-revealed");
          observer.unobserve(entry.target);
        });
      };

      const revealObserver = new IntersectionObserver(revealOnce, {
        threshold: 0.16,
        rootMargin: "0px 0px -4% 0px"
      });

      const individualTitleObserver = new IntersectionObserver(revealOnce, {
        threshold: 0.3,
        rootMargin: "0px 0px -8% 0px"
      });

      const createIndividualCardObserver = () => new IntersectionObserver(revealOnce, {
        threshold: 0.01,
        rootMargin: desktopMedia.matches
          ? "0px 0px -20% 0px"
          : "0px 0px -16% 0px"
      });

      let individualCardObserver = createIndividualCardObserver();

      revealGroups.forEach((group) => revealObserver.observe(group));
      individualRevealTitles.forEach((title) => individualTitleObserver.observe(title));
      individualRevealCards.forEach((card) => {
        const cardImage = card.querySelector(".cleaning-service-card__image, .areas-served__image");
        const observeCard = () => individualCardObserver.observe(card);

        if (!cardImage || cardImage.complete) {
          observeCard();
          return;
        }

        cardImage.addEventListener("load", observeCard, { once: true });
        cardImage.addEventListener("error", observeCard, { once: true });
      });

      desktopMedia.addEventListener?.("change", () => {
        individualCardObserver.disconnect();
        individualCardObserver = createIndividualCardObserver();

        individualRevealCards.forEach((card) => {
          if (card.classList.contains("is-revealed")) return;

          const cardImage = card.querySelector(".cleaning-service-card__image, .areas-served__image");
          if (!cardImage || cardImage.complete) individualCardObserver.observe(card);
        });
      });
    }
  }

  const processStrip = document.querySelector(".process-strip");
  const processBroom = document.querySelector("[data-process-broom]");
  const processBroomModel = document.querySelector("[data-process-broom-model]");
  const reducedMotionMedia = window.matchMedia("(prefers-reduced-motion: reduce)");
  const mobileBroomMedia = window.matchMedia("(max-width: 760px)");

  if (processStrip && processBroom && processBroomModel && !reducedMotionMedia.matches) {
    let broomFrame = 0;

    const updateProcessBroomFraming = () => {
      processBroomModel.setAttribute(
        "camera-orbit",
        mobileBroomMedia.matches ? "25deg 75deg 75%" : "25deg 75deg 30%",
      );
      processBroomModel.jumpCameraToGoal?.();
    };

    const updateProcessBroom = () => {
      broomFrame = 0;

      const stripRect = processStrip.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const animationStart = viewportHeight * 0.94;
      const animationDistance = (viewportHeight * 0.8) + stripRect.height;
      const progress = Math.min(1, Math.max(0, (animationStart - stripRect.top) / animationDistance));
      const dropDistance = stripRect.height;

      processBroom.style.setProperty("--broom-drop", `${(progress * dropDistance).toFixed(2)}px`);
    };

    const queueProcessBroomUpdate = () => {
      if (broomFrame) return;
      broomFrame = window.requestAnimationFrame(updateProcessBroom);
    };

    const showLoadedBroom = () => {
      processBroom.classList.add("is-loaded");
      queueProcessBroomUpdate();
    };

    if (processBroomModel.loaded) {
      showLoadedBroom();
    } else {
      processBroomModel.addEventListener("load", showLoadedBroom, { once: true });
    }

    window.addEventListener("scroll", queueProcessBroomUpdate, { passive: true });
    window.addEventListener("resize", queueProcessBroomUpdate);
    mobileBroomMedia.addEventListener?.("change", updateProcessBroomFraming);
    updateProcessBroomFraming();
    updateProcessBroom();
  }

  document.querySelectorAll("[data-faq-section]").forEach((faqSection) => {
    faqSection.querySelectorAll("[data-faq-toggle]").forEach((toggle) => {
      const answerId = toggle.getAttribute("aria-controls");
      const answer = answerId ? document.getElementById(answerId) : null;
      const item = toggle.closest(".residential-faq-item");

      if (!answer || !item) return;
      let heightFrame = 0;

      const finishAnswerTransition = () => {
        if (toggle.getAttribute("aria-expanded") === "true") {
          answer.style.height = "auto";
        }
      };

      answer.addEventListener("transitionend", (event) => {
        if (event.propertyName === "height") finishAnswerTransition();
      });

      toggle.addEventListener("click", () => {
        const shouldOpen = toggle.getAttribute("aria-expanded") !== "true";

        if (heightFrame) {
          window.cancelAnimationFrame(heightFrame);
          heightFrame = 0;
        }

        toggle.setAttribute("aria-expanded", String(shouldOpen));
        answer.setAttribute("aria-hidden", String(!shouldOpen));
        item.classList.toggle("is-open", shouldOpen);

        if (reducedMotionMedia.matches) {
          answer.style.height = shouldOpen ? "auto" : "0px";
          return;
        }

        if (shouldOpen) {
          answer.style.height = `${answer.scrollHeight}px`;
          return;
        }

        answer.style.height = `${answer.scrollHeight}px`;
        heightFrame = window.requestAnimationFrame(() => {
          heightFrame = 0;
          answer.style.height = "0px";
        });
      });
    });
  });

});
