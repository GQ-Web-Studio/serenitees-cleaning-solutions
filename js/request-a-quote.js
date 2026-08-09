document.addEventListener("DOMContentLoaded", () => {
  const quoteForm = document.querySelector("[data-quote-form]");
  const serviceSelect = quoteForm?.querySelector("[data-service-select]");
  const residentialFields = quoteForm?.querySelector("[data-residential-fields]");
  const commercialFields = quoteForm?.querySelector("[data-commercial-fields]");

  if (!quoteForm || !serviceSelect || !residentialFields || !commercialFields) return;

  const toggleConditionalFields = (group, shouldShow) => {
    group.hidden = !shouldShow;

    group.querySelectorAll("input, select, textarea").forEach((field) => {
      field.disabled = !shouldShow;
      field.required = shouldShow && field.dataset.requiredWhenVisible === "true";
    });
  };

  const updateServiceFields = () => {
    toggleConditionalFields(residentialFields, serviceSelect.value === "residential");
    toggleConditionalFields(commercialFields, serviceSelect.value === "commercial");
  };

  serviceSelect.addEventListener("change", updateServiceFields);
  updateServiceFields();
});
