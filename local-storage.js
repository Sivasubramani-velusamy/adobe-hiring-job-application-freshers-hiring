/* Local storage helpers for the Adobe application simulator */

const STORAGE_CURRENT_USER = "currentUser";
const STORAGE_APPLICATIONS = "applications";
const STORAGE_APPLICATION_DRAFT = "applicationDraft";
const STORAGE_ADMIN_SESSION = "adminSession";

function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_CURRENT_USER)) || null;
  } catch (error) {
    return null;
  }
}

function saveCurrentUser(user) {
  localStorage.setItem(STORAGE_CURRENT_USER, JSON.stringify(user));
}

function getApplications() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_APPLICATIONS)) || [];
  } catch (error) {
    return [];
  }
}

function saveApplications(applications) {
  localStorage.setItem(STORAGE_APPLICATIONS, JSON.stringify(applications));
}

function getFormDraft() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_APPLICATION_DRAFT)) || null;
  } catch (error) {
    return null;
  }
}

function saveFormDraft(draft) {
  localStorage.setItem(STORAGE_APPLICATION_DRAFT, JSON.stringify(draft));
}

function clearFormDraft() {
  localStorage.removeItem(STORAGE_APPLICATION_DRAFT);
}

function getAdminSession() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_ADMIN_SESSION)) || null;
  } catch (error) {
    return null;
  }
}

function saveAdminSession(session) {
  localStorage.setItem(STORAGE_ADMIN_SESSION, JSON.stringify(session));
}

function clearAdminSession() {
  localStorage.removeItem(STORAGE_ADMIN_SESSION);
}
