
"use strict";

// Available pet care services and their descriptions.
const services = {
    "dog-walking": {
        name: "Dog Walking",
        description:
            "Give your dog exercise, outdoor activity, and safe walks suited to their needs."
    },
    "pet-sitting": {
        name: "Pet Sitting",
        description:
            "Help your pet feel comfortable at home with companionship and care while you are away."
    },
    "feeding": {
        name: "Feeding and Check-Ins",
        description:
            "Maintain your pet's feeding routine, refresh their water, and check on their well-being."
    },
    "other": {
        name: "Other Care Needs",
        description:
            "Tell us about your pet's unique needs so we can discuss the care you are looking for."
    }
};

// Browser storage keys.
const storageKeys = {
    service: "happyPawsService",
    petName: "happyPawsPetName",
    petType: "happyPawsPetType"
};

// Validation rules for the contact form.
const validationRules = {
    "full-name": {
        required: true,
        message: "Please enter your full name."
    },
    email: {
        required: true,
        message: "Please enter a valid email address."
    },
    "pet-name": {
        required: true,
        message: "Please enter your pet's name."
    },
    "pet-type": {
        required: true,
        message: "Please select your pet's type."
    },
    service: {
        required: true,
        message: "Please select a service."
    },
    details: {
        required: true,
        message: "Please tell us about your pet's care needs."
    }
};

// Find an element by its ID.
function getElement(id) {
    return document.getElementById(id);
}

// Create or update a field's validation message.
function showError(field, message) {
    const errorElement = getElement(field.id + "-error");

    if (errorElement) {
        errorElement.textContent = message;
    }

    field.setAttribute("aria-invalid", message ? "true" : "false");
}

// Check an individual field.
function validateField(field) {
    const rules = validationRules[field.id];

    if (!rules) {
        return true;
    }

    const value = field.value.trim();
    let message = "";

    if (rules.required && !value) {
        message = rules.message;
    } else if (
        field.id === "email" &&
        value &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
    ) {
        message = "Please enter an email in a format like name@example.com.";
    } else if (
        (field.id === "full-name" || field.id === "pet-name") &&
        value.length > 0 &&
        value.length < 2
    ) {
        message = "Please enter at least 2 characters.";
    } else if (
        field.id === "details" &&
        value.length > 0 &&
        value.length < 10
    ) {
        message = "Please provide at least 10 characters of detail.";
    }

    showError(field, message);
    return message === "";
}

// Validate all fields before proceeding.
function validateForm(form) {
    let isValid = true;
    let firstInvalidField = null;

    Object.keys(validationRules).forEach(function (id) {
        const field = getElement(id);

        if (field && !validateField(field)) {
            isValid = false;

            if (!firstInvalidField) {
                firstInvalidField = field;
            }
        }
    });

    if (firstInvalidField) {
        firstInvalidField.focus();
    }

    return isValid;
}

// Update the service description when the selection changes.
function updateServiceDescription() {
    const serviceSelect = getElement("service");
    const descriptionElement = getElement("service-description");

    if (!serviceSelect || !descriptionElement) {
        return;
    }

    const selectedService = services[serviceSelect.value];

    descriptionElement.textContent = selectedService
        ? selectedService.description
        : "Choose a service to see more information.";
}

// Save useful preferences in the browser.
function savePreferences() {
    const service = getElement("service");
    const petName = getElement("pet-name");
    const petType = getElement("pet-type");

    try {
        if (service && service.value) {
            localStorage.setItem(storageKeys.service, service.value);
        }

        if (petName && petName.value.trim()) {
            localStorage.setItem(
                storageKeys.petName,
                petName.value.trim()
            );
        }

        if (petType && petType.value) {
            localStorage.setItem(storageKeys.petType, petType.value);
        }
    } catch (error) {
        console.warn("Browser preferences could not be saved.", error);
    }
}

// Restore saved preferences when the page opens.
function loadPreferences() {
    const service = getElement("service");
    const petName = getElement("pet-name");
    const petType = getElement("pet-type");

    try {
        const savedService = localStorage.getItem(storageKeys.service);
        const savedPetName = localStorage.getItem(storageKeys.petName);
        const savedPetType = localStorage.getItem(storageKeys.petType);

        if (service && savedService && services[savedService]) {
            service.value = savedService;
        }

        if (petName && savedPetName) {
            petName.value = savedPetName;
        }

        if (
            petType &&
            savedPetType &&
            Array.from(petType.options).some(function (option) {
                return option.value === savedPetType;
            })
        ) {
            petType.value = savedPetType;
        }
    } catch (error) {
        console.warn("Saved preferences could not be loaded.", error);
    }

    updateServiceDescription();
}

// Remove saved preferences when requested.
function clearPreferences() {
    try {
        Object.values(storageKeys).forEach(function (key) {
            localStorage.removeItem(key);
        });
    } catch (error) {
        console.warn("Saved preferences could not be cleared.", error);
    }
}

// Connect JavaScript to the existing contact form.
function initializeContactForm() {
    const form = getElement("inquiry-form");

    if (!form) {
        return;
    }

    loadPreferences();

    Object.keys(validationRules).forEach(function (id) {
        const field = getElement(id);

        if (field) {
            field.addEventListener("input", function () {
                validateField(field);
                savePreferences();
            });

            field.addEventListener("change", function () {
                validateField(field);
                savePreferences();
                updateServiceDescription();
            });
        }
    });

    const service = getElement("service");

    if (service) {
        service.addEventListener("change", updateServiceDescription);
    }

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        if (!validateForm(form)) {
            return;
        }

        savePreferences();

        const status = getElement("form-status");

        if (status) {
            status.textContent =
                "Your form passed validation! This demonstration does not send your inquiry to the business.";
        }
    });

    form.addEventListener("reset", function () {
        // Let the browser reset the fields before updating the display.
        setTimeout(function () {
            form.querySelectorAll("[aria-invalid]").forEach(function (field) {
                showError(field, "");
            });

            updateServiceDescription();
        }, 0);
    });

    const clearButton = getElement("clear-preferences");

    if (clearButton) {
        clearButton.addEventListener("click", function () {
            clearPreferences();

            const status = getElement("form-status");

            if (status) {
                status.textContent = "Saved preferences have been removed.";
            }
        });
    }
}

// Start after the HTML document has loaded.
document.addEventListener("DOMContentLoaded", initializeContactForm);
