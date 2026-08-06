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
});
