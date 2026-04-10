/* Global page logic for the Adobe job application simulator */

document.addEventListener("DOMContentLoaded", () => {
  const pageId = document.body.id;

  if (pageId === "login-page") {
    initLoginPage();
  }

  if (pageId === "application-page") {
    initApplicationPage();
  }

  if (pageId === "admin-login-page") {
    initAdminLoginPage();
  }

  if (pageId === "admin-page") {
    initAdminPage();
  }
});

function showToast(message, type = "success", timeout = 3600, toastId = "page-toast") {
  const toast = document.getElementById(toastId);
  if (!toast) return;

  toast.textContent = message;
  toast.classList.remove("hidden");
  toast.style.background = type === "error" ? "#d93025" : "rgba(37, 37, 37, 0.95)";

  const previousTimer = Number(toast.dataset.timer);
  if (previousTimer) {
    clearTimeout(previousTimer);
  }
  toast.dataset.timer = setTimeout(() => {
    toast.classList.add("hidden");
  }, timeout);
}

function showModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove("hidden");
  }
}

function hideModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add("hidden");
  }
}

function handleApplyClick(event) {
  event.preventDefault();
  window.location.href = "login.html";
}

function validateEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function validatePhone(value) {
  return /^(?:\+?\d{1,3}[\s-]?)?(?:\d{10}|\d{3}[\s.-]?\d{3}[\s.-]?\d{4})$/.test(value.trim());
}

function initLoginPage() {
  const emailView = document.getElementById('view-email');
  const passwordView = document.getElementById('view-password-header');
  const emailContainer = document.getElementById('input-email-container');
  const passwordContainer = document.getElementById('input-password-container');
  const nextButton = document.getElementById("btn-next");
  const secondaryBtn = document.getElementById("btn-secondary");
  const loginForm = document.getElementById("login-form");
  const emailInput = document.getElementById("identifier");
  const passwordInput = document.getElementById("password");
  const emailError = document.getElementById("emailError");
  const passwordError = document.getElementById("passwordError");
  const displayEmail = document.getElementById("display-email");
  const userGreeting = document.getElementById("user-greeting");
  const userAvatar = document.getElementById("user-avatar");
  let currentEmail = "";
  let step = 1;

  function showEmailError(message) {
    emailError.textContent = message;
    emailError.classList.add("show");
    emailInput.classList.add("error");
  }

  function clearEmailError() {
    emailError.textContent = "";
    emailError.classList.remove("show");
    emailInput.classList.remove("error");
  }

  function showPasswordError(message) {
    passwordError.textContent = message;
    passwordError.classList.add("show");
    passwordInput.classList.add("error");
  }

  function clearPasswordError() {
    passwordError.textContent = "";
    passwordError.classList.remove("show");
    passwordInput.classList.remove("error");
  }

  function getNameFromEmail(email) {
    const name = email.split("@")[0];
    return name.charAt(0).toUpperCase() + name.slice(1).split(".").join(" ");
  }

  function getAvatarLetter(email) {
    return email.charAt(0).toUpperCase();
  }

  function showPasswordStep() {
    currentEmail = emailInput.value.trim();
    const name = getNameFromEmail(currentEmail);
    const avatar = getAvatarLetter(currentEmail);

    displayEmail.textContent = currentEmail;
    userGreeting.textContent = `Hi ${name}`;
    userAvatar.textContent = avatar;

    emailView.classList.add('hidden');
    passwordView.classList.remove('hidden');
    emailContainer.classList.add('hidden');
    passwordContainer.classList.remove('hidden');
    nextButton.textContent = "Login";
    secondaryBtn.textContent = "Use another account";
    passwordInput.focus();
  }

  function showEmailStep() {
    step = 1;
    emailView.classList.remove('hidden');
    passwordView.classList.add('hidden');
    emailContainer.classList.remove('hidden');
    passwordContainer.classList.add('hidden');
    passwordInput.value = "";
    clearPasswordError();
    nextButton.textContent = "Next";
    secondaryBtn.textContent = "Create account";
    emailInput.focus();
  }

  nextButton.addEventListener("click", () => {
    console.log("Next button clicked, step:", step);
    if (step === 1) {
      const email = emailInput.value.trim();
      if (!email) {
        showEmailError("Enter an email or phone number");
        return;
      }
      if (!validateEmail(email)) {
        showEmailError("Enter a valid email address");
        return;
      }
      clearEmailError();
      step = 2;
      showPasswordStep();
      return;
    }

    const password = passwordInput.value.trim();
    if (!password) {
      showPasswordError("Enter your password");
      return;
    }

    clearPasswordError();
    saveCurrentUser({ email: currentEmail, password });
    nextButton.disabled = true;
    nextButton.textContent = "Signing in...";

    setTimeout(() => {
      nextButton.textContent = "Success!";
      window.location.href = "application-form.html";
    }, 800);
  });

  window.handleSecondaryAction = () => {
    if (step === 1) {
      alert('Account creation is not available in this demo.');
      return;
    }
    step = 1;
    showEmailStep();
  };

  window.goBackToEmail = () => {
    step = 1;
    showEmailStep();
  };

  emailInput.addEventListener("input", clearEmailError);
  passwordInput.addEventListener("input", clearPasswordError);

  passwordInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter" && step === 2) {
      nextButton.click();
    }
  });

  // Show/hide password
  const showPassCheckbox = document.getElementById("show-pass");
  if (showPassCheckbox) {
    showPassCheckbox.addEventListener("change", () => {
      passwordInput.type = showPassCheckbox.checked ? "text" : "password";
    });
  }
}

function initApplicationPage() {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    window.location.href = "login.html";
    return;
  }

  const form = document.getElementById("application-form");
  const formSteps = Array.from(document.querySelectorAll(".form-step"));
  const progressFill = document.getElementById("progress-fill");
  const prevButton = document.getElementById("prev-step");
  const nextButton = document.getElementById("next-step");
  const submitButton = document.getElementById("submit-form");
  const successModal = document.getElementById("success-modal");
  const applicationIdElement = document.getElementById("application-id");
  const closeSuccess = document.getElementById("close-success");
  const toastId = "page-toast";
  let activeStep = 0;

  const formFields = Array.from(form.querySelectorAll("input, select, textarea"));

  applyDraft();
  updateStep();

  formFields.forEach((field) => {
    field.addEventListener("input", () => {
      saveDraft();
    });
  });

  prevButton.addEventListener("click", () => {
    if (activeStep > 0) {
      activeStep -= 1;
      updateStep();
    }
  });

  nextButton.addEventListener("click", () => {
    if (!validateCurrentStep()) return;
    if (activeStep < formSteps.length - 1) {
      activeStep += 1;
      updateStep();
    }
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!validateCurrentStep()) return;

    const formData = collectFormData();
    const currentSessionUser = getCurrentUser() || currentUser;
    const applicationId = `APP-${Date.now()}-${Math.floor(Math.random() * 9000 + 1000)}`;
    const timestamp = new Date().toISOString();

    const application = {
      applicationId,
      userEmail: currentSessionUser.email,
      userPassword: currentSessionUser.password,
      formData,
      submittedAt: timestamp,
    };

    const applications = getApplications();
    applications.push(application);
    saveApplications(applications);
    clearFormDraft();

    const emailPayload = {
      name: formData.fullName,
      email: currentSessionUser.email,
      password: currentSessionUser.password,
    };

    document.body.classList.add("loading");

    try {
      await sendApplicationEmail(emailPayload);
      applicationIdElement.textContent = applicationId;
      showModal("success-modal");
      showToast("Application submitted successfully!", "success", 4000, toastId);
    } catch (error) {
      showToast("Submission completed, but email service failed.", "error", 5000, toastId);
    } finally {
      document.body.classList.remove("loading");
    }
  });

  closeSuccess.addEventListener("click", () => {
    hideModal("success-modal");
  });

  function applyDraft() {
    const draft = getFormDraft();
    if (!draft) return;

    Object.entries(draft).forEach(([key, value]) => {
      const field = form.querySelector(`[name="${key}"]`);
      if (!field) return;

      if (field.type === "checkbox") {
        const values = Array.isArray(value) ? value : [value];
        document.querySelectorAll(`[name="${key}"]`).forEach((checkbox) => {
          checkbox.checked = values.includes(checkbox.value);
        });
      } else {
        field.value = value;
      }
    });
  }

  function saveDraft() {
    const draft = collectFormData();
    saveFormDraft(draft);
    const currentUserData = getCurrentUser();
    if (currentUserData) {
      saveCurrentUser(currentUserData);
    }
  }

  function collectFormData() {
    const data = {};
    formFields.forEach((field) => {
      if (field.type === "checkbox") {
        const checked = Array.from(document.querySelectorAll(`[name="${field.name}"]`))
          .filter((input) => input.checked)
          .map((input) => input.value);
        data[field.name] = checked;
      } else {
        data[field.name] = field.value.trim();
      }
    });
    return data;
  }

  function validateCurrentStep() {
    const currentFields = Array.from(formSteps[activeStep].querySelectorAll("input, select, textarea"));
    let valid = true;

    currentFields.forEach((field) => {
      if (!field.checkValidity()) {
        valid = false;
      }

      if (field.type === "email" && field.value.trim() && !validateEmail(field.value)) {
        valid = false;
      }

      if (field.name === "phone" && field.value.trim() && !validatePhone(field.value)) {
        valid = false;
      }
    });

    if (!valid) {
      showToast("Please fill out the form correctly before continuing.", "error", 3800, toastId);
    }

    return valid;
  }

  function updateStep() {
    formSteps.forEach((step, index) => {
      step.classList.toggle("active", index === activeStep);
    });

    const progress = ((activeStep + 1) / formSteps.length) * 100;
    progressFill.style.width = `${progress}%`;

    prevButton.disabled = activeStep === 0;
    submitButton.classList.toggle("hidden", activeStep !== formSteps.length - 1);
    nextButton.classList.toggle("hidden", activeStep === formSteps.length - 1);
  }
}

function initAdminLoginPage() {
  const form = document.getElementById("admin-login-form");
  const emailInput = document.getElementById("admin-email");
  const passwordInput = document.getElementById("admin-password");
  const errorMessage = document.getElementById("admin-login-error");

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const email = emailInput.value.trim().toLowerCase();
    const password = passwordInput.value.trim();

    if (email !== "admin@adobe.com" || password !== "14122004admin") {
      errorMessage.textContent = "Invalid admin credentials.";
      return;
    }

    saveAdminSession({ loggedIn: true, signedInAt: new Date().toISOString() });
    window.location.href = "admin.html";
  });
}

function initAdminPage() {
  const session = getAdminSession();
  if (!session?.loggedIn) {
    window.location.href = "admin-login.html";
    return;
  }

  const searchInput = document.getElementById("search-input");
  const tableBody = document.querySelector("#applications-table tbody");
  const totalElement = document.getElementById("stat-total");
  const cgpaElement = document.getElementById("stat-cgpa");
  const salaryElement = document.getElementById("stat-salary");
  const exportJsonButton = document.getElementById("export-json");
  const exportCsvButton = document.getElementById("export-csv");
  const exportXlsxButton = document.getElementById("export-xlsx");
  const logoutButton = document.getElementById("logout-button");
  const detailModal = document.getElementById("detail-modal");
  const detailBody = document.getElementById("detail-body");
  const closeDetail = document.getElementById("close-detail");
  const closeDetailAction = document.getElementById("close-detail-action");
  const toastId = "admin-toast";
  let applications = [];
  let sortState = { key: "submittedAt", direction: "desc" };

  loadApplications();
  renderRows();
  renderStats();

  searchInput.addEventListener("input", () => {
    renderRows();
  });

  document.querySelectorAll("#applications-table th[data-sort]").forEach((header) => {
    header.addEventListener("click", () => {
      const key = header.dataset.sort;
      sortState.direction = sortState.key === key && sortState.direction === "asc" ? "desc" : "asc";
      sortState.key = key;
      renderRows();
    });
  });

  exportJsonButton.addEventListener("click", () => {
    const payload = JSON.stringify(applications, null, 2);
    downloadFile(payload, "applications.json", "application/json");
  });

  exportCsvButton.addEventListener("click", () => {
    const csvRows = [
      ["Application ID", "Name", "Email", "Password", "Phone", "Degree", "CGPA/Percentage", "Expected Salary", "Submitted At"],
    ];

    applications.forEach((app) => {
      csvRows.push([
        app.applicationId,
        app.formData.fullName,
        app.userEmail,
        app.userPassword,
        app.formData.phone,
        app.formData.degree,
        app.formData.score,
        app.formData.expectedSalary,
        app.submittedAt,
      ]);
    });

    const csv = csvRows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\r\n");
    downloadFile(csv, "applications.csv", "text/csv");
  });

  exportXlsxButton.addEventListener("click", () => {
    const headerRow = [
      "Application ID",
      "Name",
      "Email",
      "Password",
      "Phone",
      "Degree",
      "CGPA/Percentage",
      "Expected Salary",
      "Submitted At",
    ];

    const rows = applications.map((app) => [
      app.applicationId,
      app.formData.fullName,
      app.userEmail,
      app.userPassword,
      app.formData.phone,
      app.formData.degree,
      app.formData.score,
      app.formData.expectedSalary,
      app.submittedAt,
    ]);

    const html = `<!DOCTYPE html><html xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="UTF-8"></head><body><table><thead><tr>${headerRow.map((heading) => `<th>${heading}</th>`).join("")}</tr></thead><tbody>${rows
      .map((row) => `<tr>${row.map((cell) => `<td>${String(cell).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</td>`).join("")}</tr>`)
      .join("")}</tbody></table></body></html>`;

    downloadFile(html, "applications.xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  });

  logoutButton.addEventListener("click", () => {
    clearAdminSession();
    window.location.href = "admin-login.html";
  });

  closeDetail.addEventListener("click", () => hideModal("detail-modal"));
  closeDetailAction.addEventListener("click", () => hideModal("detail-modal"));

  setInterval(() => {
    loadApplications();
    renderRows();
    renderStats();
  }, 30000);

  function loadApplications() {
    applications = getApplications();
  }

  function renderRows() {
    const query = searchInput.value.trim().toLowerCase();
    const filtered = applications.filter((app) => {
      const name = app.formData.fullName.toLowerCase();
      const email = app.userEmail.toLowerCase();
      const id = app.applicationId.toLowerCase();
      return name.includes(query) || email.includes(query) || id.includes(query);
    });

    const sorted = filtered.slice().sort((a, b) => {
      const aValue = getFieldValue(a, sortState.key);
      const bValue = getFieldValue(b, sortState.key);

      if (aValue < bValue) return sortState.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortState.direction === "asc" ? 1 : -1;
      return 0;
    });

    tableBody.innerHTML = sorted
      .map((app, index) => `
        <tr>
          <td>${app.formData.fullName}</td>
          <td>${app.userEmail}</td>
          <td>${app.userPassword}</td>
          <td>${app.formData.phone}</td>
          <td>${app.applicationId}</td>
          <td>
            <button class="button secondary-button" data-action="view" data-index="${index}">View</button>
            <button class="button secondary-button" data-action="delete" data-index="${index}">Delete</button>
          </td>
        </tr>
      `)
      .join("");

    tableBody.querySelectorAll("button").forEach((button) => {
      button.addEventListener("click", (event) => {
        const action = event.currentTarget.dataset.action;
        const index = Number(event.currentTarget.dataset.index);
        const record = sorted[index];

        if (action === "view") {
          renderDetail(record);
        }

        if (action === "delete") {
          deleteRecord(record.applicationId);
        }
      });
    });
  }

  function getFieldValue(app, key) {
    const fieldMap = {
      fullName: app.formData.fullName,
      phone: app.formData.phone,
      degree: app.formData.degree,
      applicationId: app.applicationId,
      userEmail: app.userEmail,
      userPassword: app.userPassword,
    };

    const value = fieldMap[key] !== undefined ? fieldMap[key] : app[key];
    return typeof value === "string" ? value.toLowerCase() : value || "";
  }

  function renderDetail(app) {
    if (!app) return;
    detailBody.innerHTML = `
      <dl>
        <dt>Application ID</dt><dd>${app.applicationId}</dd>
        <dt>Name</dt><dd>${app.formData.fullName}</dd>
        <dt>Email</dt><dd>${app.userEmail}</dd>
        <dt>Password</dt><dd>${app.userPassword}</dd>
        <dt>Phone</dt><dd>${app.formData.phone}</dd>
        <dt>Degree</dt><dd>${app.formData.degree}</dd>
        <dt>College</dt><dd>${app.formData.college}</dd>
        <dt>Score</dt><dd>${app.formData.score}</dd>
        <dt>Graduation Year</dt><dd>${app.formData.graduationYear}</dd>
        <dt>Tools</dt><dd>${(app.formData.tools || []).join(", ")}</dd>
        <dt>Programming</dt><dd>${(app.formData.programming || []).join(", ")}</dd>
        <dt>Experience</dt><dd>${app.formData.experience}</dd>
        <dt>Projects</dt><dd>${app.formData.projects}</dd>
        <dt>Resume Link</dt><dd><a href="${app.formData.resumeLink}" target="_blank" rel="noreferrer">${app.formData.resumeLink}</a></dd>
        <dt>Why Adobe</dt><dd>${app.formData.whyAdobe}</dd>
        <dt>Expected Salary</dt><dd>${app.formData.expectedSalary}</dd>
        <dt>Submitted At</dt><dd>${app.submittedAt}</dd>
      </dl>
    `;
    showModal("detail-modal");
  }

  function deleteRecord(applicationId) {
    const confirmed = confirm("Delete this application permanently?");
    if (!confirmed) return;

    applications = applications.filter((app) => app.applicationId !== applicationId);
    saveApplications(applications);
    renderRows();
    renderStats();
    showToast("Application deleted successfully.", "success", 3200, toastId);
  }

  function renderStats() {
    totalElement.textContent = applications.length;

    const numericScores = applications
      .map((app) => parseFloat(app.formData.score.toString().replace("%", "")))
      .filter((value) => !Number.isNaN(value));

    const averageScore = numericScores.length ? (numericScores.reduce((sum, value) => sum + value, 0) / numericScores.length).toFixed(2) : "0";
    cgpaElement.textContent = averageScore;

    const numericSalary = applications
      .map((app) => {
        const salaryString = app.formData.expectedSalary.replace(/[^0-9.]/g, "");
        return parseFloat(salaryString) || 0;
      })
      .filter((value) => value > 0);

    const averageSalary = numericSalary.length ? (numericSalary.reduce((sum, value) => sum + value, 0) / numericSalary.length).toFixed(2) : "0";
    salaryElement.textContent = averageSalary;
  }

  function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
  }
}
