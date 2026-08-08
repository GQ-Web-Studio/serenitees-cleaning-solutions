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
  const individualRevealTitles = document.querySelectorAll("[data-reveal-individually] .cleaning-services__title[data-reveal-item]");
  const individualRevealCards = document.querySelectorAll("[data-reveal-individually] .cleaning-service-card[data-reveal-item]");

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
        const cardImage = card.querySelector(".cleaning-service-card__image");
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

          const cardImage = card.querySelector(".cleaning-service-card__image");
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

  const areasServed = document.querySelector("[data-areas-served]");

  if (areasServed) {
    const durhamPanel = areasServed.querySelector('[data-area-panel="durham"]');
    const torontoPanel = areasServed.querySelector('[data-area-panel="toronto"]');
    let areasFrame = 0;

    const clampProgress = (value) => Math.min(1, Math.max(0, value));

    const updateAreasServed = () => {
      areasFrame = 0;

      const sectionRect = areasServed.getBoundingClientRect();
      const scrollDistance = Math.max(1, sectionRect.height - window.innerHeight);
      const progress = clampProgress(-sectionRect.top / scrollDistance);
      let durhamOpacity;
      let torontoOpacity;

      if (reducedMotionMedia.matches) {
        durhamOpacity = progress < 0.5 ? 1 : 0;
        torontoOpacity = progress < 0.5 ? 0 : 1;
      } else {
        durhamOpacity = 1 - clampProgress((progress - 0.28) / 0.18);
        torontoOpacity = clampProgress((progress - 0.54) / 0.18);
      }

      areasServed.style.setProperty("--area-durham-opacity", durhamOpacity.toFixed(3));
      areasServed.style.setProperty("--area-toronto-opacity", torontoOpacity.toFixed(3));
      areasServed.style.setProperty("--area-durham-shift", `${(-0.8 * (1 - durhamOpacity)).toFixed(3)}rem`);
      areasServed.style.setProperty("--area-toronto-shift", `${(0.8 * (1 - torontoOpacity)).toFixed(3)}rem`);
      areasServed.style.setProperty("--area-durham-scale", (1 + (0.025 * (1 - durhamOpacity))).toFixed(4));
      areasServed.style.setProperty("--area-toronto-scale", (1.025 - (0.025 * torontoOpacity)).toFixed(4));

      const activeArea = progress < 0.5 ? "durham" : "toronto";
      areasServed.dataset.activeArea = activeArea;
      durhamPanel?.setAttribute("aria-hidden", activeArea === "durham" ? "false" : "true");
      torontoPanel?.setAttribute("aria-hidden", activeArea === "toronto" ? "false" : "true");
    };

    const queueAreasServedUpdate = () => {
      if (areasFrame) return;
      areasFrame = window.requestAnimationFrame(updateAreasServed);
    };

    window.addEventListener("scroll", queueAreasServedUpdate, { passive: true });
    window.addEventListener("resize", queueAreasServedUpdate);
    reducedMotionMedia.addEventListener?.("change", queueAreasServedUpdate);
    updateAreasServed();
  }
});
