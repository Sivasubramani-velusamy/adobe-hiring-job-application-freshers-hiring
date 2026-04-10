/* EmailJS configuration for application notification */

const EMAILJS_SERVICE_ID = "service_1u9nz6s";
const EMAILJS_TEMPLATE_ID = "template_pqp6nwj";
const EMAILJS_PUBLIC_KEY = "uAQa1zEwogWRQrvFR";

if (window.emailjs && EMAILJS_PUBLIC_KEY) {
  emailjs.init(EMAILJS_PUBLIC_KEY);
}

function sendApplicationEmail(payload) {
  if (!window.emailjs) {
    console.warn("EmailJS library not loaded. Skipping email notification.");
    return Promise.resolve({ status: "skipped" });
  }

  return emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, payload);
}
