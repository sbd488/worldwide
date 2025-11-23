// Form validation and handling module

/**
 * Validate form field
 * @param {HTMLElement} field - Form field to validate
 * @returns {boolean} Is valid
 */
export function validateField(field) {
  const errorElement = document.getElementById(`${field.id}-error`)
  let isValid = true
  let errorMessage = ""

  // Clear previous error state
  field.classList.remove("error")
  if (errorElement) {
    errorElement.classList.remove("show")
    errorElement.textContent = ""
  }

  // Check if required field is empty
  if (field.hasAttribute("required") && !field.value.trim()) {
    isValid = false
    errorMessage = "This field is required"
  }

  // Validate keyword length
  if (field.id === "keyword" && field.value.trim()) {
    const minLength = Number.parseInt(field.getAttribute("minlength"))
    const maxLength = Number.parseInt(field.getAttribute("maxlength"))

    if (field.value.trim().length < minLength) {
      isValid = false
      errorMessage = `Keyword must be at least ${minLength} characters`
    } else if (field.value.trim().length > maxLength) {
      isValid = false
      errorMessage = `Keyword must be less than ${maxLength} characters`
    }
  }

  // Show error if invalid
  if (!isValid && errorElement) {
    field.classList.add("error")
    errorElement.textContent = errorMessage
    errorElement.classList.add("show")
    field.setAttribute("aria-invalid", "true")
  } else {
    field.setAttribute("aria-invalid", "false")
  }

  return isValid
}

/**
 * Validate entire form
 * @param {HTMLFormElement} form - Form to validate
 * @returns {boolean} Is form valid
 */
export function validateForm(form) {
  const fields = form.querySelectorAll("input[required], select[required]")
  let isValid = true

  fields.forEach((field) => {
    if (!validateField(field)) {
      isValid = false
    }
  })

  return isValid
}

/**
 * Get form data as object
 * @param {HTMLFormElement} form - Form element
 * @returns {Object} Form data
 */
export function getFormData(form) {
  const formData = new FormData(form)
  const data = {}

  for (const [key, value] of formData.entries()) {
    data[key] = value.trim()
  }

  return data
}

/**
 * Reset form and clear errors
 * @param {HTMLFormElement} form - Form to reset
 */
export function resetForm(form) {
  form.reset()

  const errorElements = form.querySelectorAll(".field-error")
  errorElements.forEach((error) => {
    error.classList.remove("show")
    error.textContent = ""
  })

  const fields = form.querySelectorAll("input, select, textarea")
  fields.forEach((field) => {
    field.classList.remove("error")
    field.setAttribute("aria-invalid", "false")
  })
}

/**
 * Set button loading state
 * @param {HTMLButtonElement} button - Button element
 * @param {boolean} isLoading - Loading state
 */
export function setButtonLoading(button, isLoading) {
  if (isLoading) {
    button.disabled = true
    button.classList.add("loading")
    button.setAttribute("aria-busy", "true")
  } else {
    button.disabled = false
    button.classList.remove("loading")
    button.setAttribute("aria-busy", "false")
  }
}
