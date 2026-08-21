document.documentElement.classList.add("has-reveal-motion");

document.addEventListener("DOMContentLoaded", () => {
  const productionHosts = new Set(["sereniteescleaning.ca", "www.sereniteescleaning.ca"]);
  const isFilePreview = window.location.protocol === "file:";
  const currentHostname = window.location.hostname.toLowerCase();
  const isProduction = productionHosts.has(currentHostname);
  const isGitHubPages = currentHostname.endsWith(".github.io");

  if (!isProduction) {
    const normalizedPagePath = decodeURIComponent(window.location.pathname).replace(/\\/g, "/");
    const isHtmlFile = isFilePreview && /\/html\/[^/]+\.html$/i.test(normalizedPagePath);
    const filePagePrefix = isHtmlFile ? "" : "html/";
    const githubProjectName = isGitHubPages ? normalizedPagePath.split("/").filter(Boolean)[0] : "";
    const githubProjectBase = githubProjectName ? `/${githubProjectName}` : "";
    const previewRoutes = new Map(isFilePreview ? [
      ["/", isHtmlFile ? "../index.html" : "index.html"],
      ["/about", `${filePagePrefix}about.html`],
      ["/residential-cleaning", `${filePagePrefix}residential-cleaning.html`],
      ["/commercial-cleaning", `${filePagePrefix}commercial-cleaning.html`],
      ["/contact", `${filePagePrefix}contact.html`],
      ["/request-a-quote", `${filePagePrefix}request-a-quote.html`],
      ["/privacy-policy", `${filePagePrefix}privacy-policy.html`]
    ] : isGitHubPages ? [
      ["/", `${githubProjectBase}/`],
      ["/about", `${githubProjectBase}/html/about.html`],
      ["/residential-cleaning", `${githubProjectBase}/html/residential-cleaning.html`],
      ["/commercial-cleaning", `${githubProjectBase}/html/commercial-cleaning.html`],
      ["/contact", `${githubProjectBase}/html/contact.html`],
      ["/request-a-quote", `${githubProjectBase}/html/request-a-quote.html`],
      ["/privacy-policy", `${githubProjectBase}/html/privacy-policy.html`]
    ] : [
      ["/", "/"],
      ["/about", "/html/about.html"],
      ["/residential-cleaning", "/html/residential-cleaning.html"],
      ["/commercial-cleaning", "/html/commercial-cleaning.html"],
      ["/contact", "/html/contact.html"],
      ["/request-a-quote", "/html/request-a-quote.html"],
      ["/privacy-policy", "/html/privacy-policy.html"]
    ]);

    document.querySelectorAll('a[href^="/"]').forEach((link) => {
      const destination = new URL(link.getAttribute("href"), "https://sereniteescleaning.ca");
      const previewPath = previewRoutes.get(destination.pathname);

      if (!previewPath) return;

      link.setAttribute("href", `${previewPath}${destination.search}${destination.hash}`);
    });
  }

  const header = document.querySelector("[data-site-header]");

  if (!header) return;

  const menuToggle = header.querySelector("[data-menu-toggle]");
  const mobileMenu = header.querySelector("[data-mobile-menu]");
  const servicesMenus = header.querySelectorAll("[data-services-menu]");
  const desktopMedia = window.matchMedia("(min-width: 841px)");
  const reducedMotionMedia = window.matchMedia("(prefers-reduced-motion: reduce)");

  const setServicesMenuState = (menu, isOpen) => {
    const toggle = menu.querySelector("[data-services-toggle]");
    const submenu = menu.querySelector("[data-services-submenu]");

    if (!toggle || !submenu) return;

    menu.classList.toggle("is-open", isOpen);
    toggle.setAttribute("aria-expanded", String(isOpen));
    submenu.hidden = !isOpen;
  };

  const closeServicesMenus = (except = null) => {
    servicesMenus.forEach((menu) => {
      if (menu !== except) setServicesMenuState(menu, false);
    });
  };

  let headerFrame = 0;

  const updateScrolledState = () => {
    headerFrame = 0;
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  };

  const queueScrolledStateUpdate = () => {
    if (headerFrame) return;
    headerFrame = window.requestAnimationFrame(updateScrolledState);
  };

  const closeMenu = ({ returnFocus = false } = {}) => {
    if (!menuToggle || !mobileMenu) return;

    header.classList.remove("is-menu-open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation menu");
    mobileMenu.setAttribute("aria-hidden", "true");
    mobileMenu.setAttribute("inert", "");
    closeServicesMenus();

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
  window.addEventListener("scroll", queueScrolledStateUpdate, { passive: true });

  const syncRestoredScrollState = () => {
    window.requestAnimationFrame(updateScrolledState);
  };

  window.addEventListener("load", syncRestoredScrollState, { once: true });
  window.addEventListener("pageshow", syncRestoredScrollState);
  window.addEventListener("hashchange", syncRestoredScrollState);

  servicesMenus.forEach((menu) => {
    const toggle = menu.querySelector("[data-services-toggle]");

    toggle?.addEventListener("click", () => {
      const willOpen = toggle.getAttribute("aria-expanded") !== "true";
      closeServicesMenus(menu);
      setServicesMenuState(menu, willOpen);
    });

    menu.addEventListener("focusout", (event) => {
      if (!menu.contains(event.relatedTarget)) setServicesMenuState(menu, false);
    });
  });

  const homeProgress = document.querySelector("[data-home-progress]");

  if (homeProgress) {
    let progressFrame = 0;

    const updateHomeProgress = () => {
      progressFrame = 0;
      const scrollableDistance = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollableDistance > 0
        ? Math.min(1, Math.max(0, window.scrollY / scrollableDistance))
        : 0;

      homeProgress.style.transform = `scaleX(${progress.toFixed(4)})`;
    };

    const queueHomeProgressUpdate = () => {
      if (progressFrame) return;
      progressFrame = window.requestAnimationFrame(updateHomeProgress);
    };

    window.addEventListener("scroll", queueHomeProgressUpdate, { passive: true });
    window.addEventListener("resize", queueHomeProgressUpdate);
    updateHomeProgress();
  }

  const inPageScrollLinks = document.querySelectorAll('a[href^="#"]:not([href="#"]):not(.skip-link)');
  let sectionScrollFrame = 0;

  const scrollToSection = (targetSection) => {
    if (reducedMotionMedia.matches) {
      targetSection.scrollIntoView({ behavior: "auto", block: "start" });
      return;
    }

    if (sectionScrollFrame) window.cancelAnimationFrame(sectionScrollFrame);

    const startY = window.scrollY;
    const scrollMarginTop = Number.parseFloat(window.getComputedStyle(targetSection).scrollMarginTop) || 0;
    const targetY = startY + targetSection.getBoundingClientRect().top - scrollMarginTop;
    const distance = targetY - startY;
    const duration = Math.min(1000, Math.max(560, Math.abs(distance) * 0.16));
    let startTime = 0;

    const animateScroll = (timestamp) => {
      if (!startTime) startTime = timestamp;

      const progress = Math.min(1, (timestamp - startTime) / duration);
      const easedProgress = progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      window.scrollTo(0, startY + (distance * easedProgress));

      if (progress < 1) {
        sectionScrollFrame = window.requestAnimationFrame(animateScroll);
      } else {
        sectionScrollFrame = 0;
      }
    };

    sectionScrollFrame = window.requestAnimationFrame(animateScroll);
  };

  inPageScrollLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const targetSelector = link.getAttribute("href");
      const targetSection = targetSelector ? document.querySelector(targetSelector) : null;

      if (!targetSection) return;

      event.preventDefault();
      closeMenu();
      window.requestAnimationFrame(() => {
        scrollToSection(targetSection);
      });
    });
  });

  menuToggle?.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    isOpen ? closeMenu() : openMenu();
  });

  mobileMenu?.querySelectorAll("a[href]").forEach((link) => {
    link.addEventListener("click", (event) => {
      const destination = new URL(link.href, window.location.href);
      const isSameDocument = destination.origin === window.location.origin
        && destination.pathname === window.location.pathname
        && destination.search === window.location.search;
      const targetSection = isSameDocument && destination.hash
        ? document.querySelector(destination.hash)
        : null;

      // Page-to-page links must remain active until the browser navigates.
      if (!targetSection) return;

      event.preventDefault();
      closeMenu();
      window.requestAnimationFrame(() => scrollToSection(targetSection));
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && header.classList.contains("is-menu-open")) {
      closeMenu({ returnFocus: true });
    } else if (event.key === "Escape") {
      closeServicesMenus();
    }
  });

  document.addEventListener("click", (event) => {
    servicesMenus.forEach((menu) => {
      if (!menu.contains(event.target)) setServicesMenuState(menu, false);
    });

    if (header.classList.contains("is-menu-open") && !header.contains(event.target)) {
      closeMenu();
    }
  });

  const handleBreakpointChange = (event) => {
    if (event.matches) closeMenu();
  };

  desktopMedia.addEventListener?.("change", handleBreakpointChange);

  const revealItems = document.querySelectorAll("[data-reveal-item]");

  if (revealItems.length) {
    if (!("IntersectionObserver" in window)) {
      revealItems.forEach((item) => item.classList.add("is-revealed"));
    } else {
      const revealOnce = (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          entry.target.classList.add("is-revealed");
          observer.unobserve(entry.target);
        });
      };

      const revealObserver = new IntersectionObserver(revealOnce, {
        threshold: 0.04,
        rootMargin: "0px 0px -4% 0px"
      });

      revealItems.forEach((item) => revealObserver.observe(item));

      const revealItemsAlreadyInView = () => {
        revealItems.forEach((item) => {
          if (item.classList.contains("is-revealed")) return;

          const itemRect = item.getBoundingClientRect();
          const isInView = itemRect.bottom > 0 && itemRect.top < window.innerHeight;

          if (!isInView) return;

          item.classList.add("is-revealed");
          revealObserver.unobserve(item);
        });
      };

      const queueInitialRevealCheck = () => {
        window.requestAnimationFrame(() => {
          revealItemsAlreadyInView();
          window.requestAnimationFrame(revealItemsAlreadyInView);
        });
      };

      queueInitialRevealCheck();
      window.addEventListener("load", queueInitialRevealCheck, { once: true });
      window.addEventListener("pageshow", queueInitialRevealCheck);
      window.addEventListener("hashchange", queueInitialRevealCheck);
    }
  }

  const deferredVideos = document.querySelectorAll("[data-deferred-video]");

  if (deferredVideos.length) {
    const playDeferredVideo = (video) => {
      if (document.hidden) return;

      if (reducedMotionMedia.matches) {
        if (video.readyState === 0) video.load();
        return;
      }
      const playback = video.play();
      playback?.catch(() => {});
    };

    if (!("IntersectionObserver" in window)) {
      deferredVideos.forEach(playDeferredVideo);
    } else {
      const videoObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          const video = entry.target;

          if (entry.isIntersecting) {
            playDeferredVideo(video);
          } else {
            video.pause();
          }
        });
      }, {
        threshold: 0.01,
        rootMargin: "100px 0px"
      });

      deferredVideos.forEach((video) => videoObserver.observe(video));

      document.addEventListener("visibilitychange", () => {
        deferredVideos.forEach((video) => {
          if (document.hidden) {
            video.pause();
            return;
          }

          const videoRect = video.getBoundingClientRect();
          const isNearViewport = videoRect.bottom > -100
            && videoRect.top < window.innerHeight + 100;

          if (isNearViewport) playDeferredVideo(video);
        });
      });
    }
  }
  const processStrip = document.querySelector(".process-strip");
  const processBroom = processStrip?.querySelector("[data-process-broom]");
  const processBroomModel = processBroom?.querySelector("[data-process-broom-model]");
  const mobileBroomMedia = window.matchMedia("(max-width: 760px)");

  if (processStrip && processBroomModel && !window.customElements?.get("model-viewer")) {
    const modelViewerLibrary = processBroomModel.dataset.modelViewerLibrary;

    const loadModelViewer = () => {
      if (!modelViewerLibrary || window.customElements?.get("model-viewer")) return;
      if (document.querySelector("script[data-model-viewer-runtime]")) return;

      const modelViewerScript = document.createElement("script");
      modelViewerScript.type = "module";
      modelViewerScript.src = modelViewerLibrary;
      modelViewerScript.dataset.modelViewerRuntime = "";
      document.head.append(modelViewerScript);
    };

    if (!("IntersectionObserver" in window)) {
      loadModelViewer();
    } else {
      const modelViewerObserver = new IntersectionObserver((entries, observer) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        loadModelViewer();
      }, {
        rootMargin: "1000px 0px",
        threshold: 0
      });

      modelViewerObserver.observe(processStrip);
    }
  }
  if (processStrip && processBroom && processBroomModel) {
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

      if (reducedMotionMedia.matches) {
        processBroom.style.setProperty("--broom-drop", "0px");
        processBroomModel.autoRotate = false;
        return;
      }

      processBroomModel.autoRotate = true;
      queueProcessBroomUpdate();
    };

    if (processBroomModel.loaded) {
      showLoadedBroom();
    } else {
      processBroomModel.addEventListener("load", showLoadedBroom, { once: true });
      processBroomModel.addEventListener("error", () => {
        processBroom.classList.remove("is-loaded");
      }, { once: true });
    }

    if (!reducedMotionMedia.matches) {
      window.addEventListener("scroll", queueProcessBroomUpdate, { passive: true });
      window.addEventListener("resize", queueProcessBroomUpdate);
    }
    mobileBroomMedia.addEventListener?.("change", updateProcessBroomFraming);
    updateProcessBroomFraming();
    if (!reducedMotionMedia.matches) updateProcessBroom();
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
