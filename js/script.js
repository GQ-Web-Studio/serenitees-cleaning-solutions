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

  if (revealGroups.length) {
    if (!("IntersectionObserver" in window)) {
      revealGroups.forEach((group) => group.classList.add("is-revealed"));
    } else {
      const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          entry.target.classList.add("is-revealed");
          observer.unobserve(entry.target);
        });
      }, {
        threshold: 0.16,
        rootMargin: "0px 0px -4% 0px"
      });

      revealGroups.forEach((group) => revealObserver.observe(group));
    }
  }
});
