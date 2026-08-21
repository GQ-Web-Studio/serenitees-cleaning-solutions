document.addEventListener("DOMContentLoaded", () => {

  const quoteProgress = document.querySelector("[data-quote-progress]");

  if (quoteProgress) {
    let progressFrame = 0;

    const updateQuoteProgress = () => {
      progressFrame = 0;
      const scrollableDistance = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollableDistance > 0
        ? Math.min(1, Math.max(0, window.scrollY / scrollableDistance))
        : 0;

      quoteProgress.style.transform = `scaleX(${progress.toFixed(4)})`;
    };

    const queueQuoteProgressUpdate = () => {
      if (progressFrame) return;
      progressFrame = window.requestAnimationFrame(updateQuoteProgress);
    };

    window.addEventListener("scroll", queueQuoteProgressUpdate, { passive: true });
    window.addEventListener("resize", queueQuoteProgressUpdate);
    updateQuoteProgress();
  }

  const quoteForm = document.querySelector("[data-quote-form]");
  const serviceSelect = quoteForm?.querySelector("[data-service-select]");
  const contactMethod = quoteForm?.querySelector("[data-contact-method]");
  const emailField = quoteForm?.querySelector('[data-contact-field="email"]');
  const phoneField = quoteForm?.querySelector('[data-contact-field="phone"]');
  const emailRequirement = quoteForm?.querySelector("[data-email-requirement]");
  const phoneRequirement = quoteForm?.querySelector("[data-phone-requirement]");
  const residentialFields = quoteForm?.querySelector("[data-residential-fields]");
  const commercialFields = quoteForm?.querySelector("[data-commercial-fields]");
  const photoField = quoteForm?.querySelector("#quote-photos");
  const submitButton = quoteForm?.querySelector("[data-quote-submit]");
  const formStatus = quoteForm?.querySelector("[data-quote-status]");

  if (
    !quoteForm ||
    !serviceSelect ||
    !contactMethod ||
    !emailField ||
    !phoneField ||
    !residentialFields ||
    !commercialFields ||
    !submitButton ||
    !formStatus
  ) return;

  const toggleConditionalFields = (group, shouldShow) => {
    group.hidden = !shouldShow;

    group.querySelectorAll("input, select, textarea").forEach((field) => {
      field.disabled = !shouldShow;
      field.required = shouldShow && field.dataset.requiredWhenVisible === "true";
    });
  };

  const updateServiceFields = () => {
    const isResidentialProperty = serviceSelect.value === "residential" || serviceSelect.value === "airbnb";

    toggleConditionalFields(residentialFields, isResidentialProperty);
    toggleConditionalFields(commercialFields, serviceSelect.value === "commercial");
  };

  const updateContactRequirements = () => {
    const prefersEmail = contactMethod.value === "email";
    const prefersPhone = contactMethod.value === "phone";

    emailField.required = prefersEmail;
    phoneField.required = prefersPhone;
    emailField.setCustomValidity("");
    phoneField.setCustomValidity("");

    if (emailRequirement) emailRequirement.textContent = prefersEmail ? "Required" : "Optional";
    if (phoneRequirement) phoneRequirement.textContent = prefersPhone ? "Required" : "Optional";
  };

  const showStatus = (message, state) => {
    formStatus.hidden = false;
    formStatus.textContent = message;
    formStatus.dataset.state = state;
  };

  const selectedService = new URLSearchParams(window.location.search).get("service");

  if (["residential", "airbnb", "commercial"].includes(selectedService)) {
    serviceSelect.value = selectedService;
  }

  serviceSelect.addEventListener("change", updateServiceFields);
  contactMethod.addEventListener("change", updateContactRequirements);
  emailField.addEventListener("input", () => emailField.setCustomValidity(""));
  phoneField.addEventListener("input", () => phoneField.setCustomValidity(""));

  quoteForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (submitButton.disabled) return;

    updateContactRequirements();

    const preferredField = contactMethod.value === "email" ? emailField : phoneField;

    if (!preferredField.value.trim()) {
      preferredField.setCustomValidity(`Enter the ${contactMethod.value} address or number you selected.`);
    }

    if (photoField?.files?.length) {
      const totalPhotoSize = Array.from(photoField.files).reduce((total, file) => total + file.size, 0);

      if (totalPhotoSize > 10 * 1024 * 1024) {
        photoField.setCustomValidity("The combined photo upload must be 10 MB or less.");
      } else {
        photoField.setCustomValidity("");
      }
    } else if (photoField) {
      photoField.setCustomValidity("");
    }

    if (!quoteForm.checkValidity()) {
      quoteForm.reportValidity();
      return;
    }

    submitButton.disabled = true;
    submitButton.textContent = "Sending Request...";
    quoteForm.setAttribute("aria-busy", "true");
    showStatus("Sending your quote request securely.", "loading");

    const formData = new FormData(quoteForm);
    formData.append("page_url", window.location.href);
    const ajaxEndpoint = quoteForm.action.replace("formsubmit.co/", "formsubmit.co/ajax/");
    const requestController = new AbortController();
    const requestTimeout = window.setTimeout(() => requestController.abort(), 20000);

    try {
      const response = await fetch(ajaxEndpoint, {
        method: "POST",
        body: formData,
        headers: { Accept: "application/json" },
        signal: requestController.signal
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok || result.success === false || result.success === "false") {
        throw new Error("Quote request submission failed.");
      }

      quoteForm.reset();
      updateServiceFields();
      updateContactRequirements();
      showStatus("Thank you. Your quote request has been sent. Serenitees will review your details and contact you to discuss the next steps.", "success");
    } catch {
      showStatus("We could not send your request right now. Please try again or email sereniteescleaning@gmail.com.", "error");
    } finally {
      window.clearTimeout(requestTimeout);
      quoteForm.removeAttribute("aria-busy");
      submitButton.disabled = false;
      submitButton.textContent = "Request a Quote";
    }
  });

  updateServiceFields();
  updateContactRequirements();
});
