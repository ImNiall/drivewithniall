const bookingAvailabilityMode = "open"; // Use "waiting-list" when no lesson spaces are available.

const themeToggle = document.querySelector("#themeToggle");
const availabilityStatus = document.querySelector("#availabilityStatus");
const bookingAvailabilityStatus = document.querySelector("#bookingAvailabilityStatus");
const bookingSubmitButton = document.querySelector("#bookingSubmitButton");
const bookingRequestForm = document.querySelector("#bookingRequestForm");
const webinarRequestForm = document.querySelector("#webinarRequestForm");
const supportType = document.querySelector("#supportType");
const accountModal = document.querySelector("#accountModal");
const accountButton = document.querySelector("#accountButton");
const closeAccountModal = document.querySelector("#closeAccountModal");
const appAuthConfig = window.driveAuthConfig || {};
const appHasSupabaseConfig =
  appAuthConfig.supabaseUrl &&
  appAuthConfig.supabaseAnonKey &&
  !appAuthConfig.supabaseUrl.includes("PASTE_") &&
  !appAuthConfig.supabaseAnonKey.includes("PASTE_");
const appSupabaseClient = appHasSupabaseConfig && window.supabase
  ? window.supabase.createClient(appAuthConfig.supabaseUrl, appAuthConfig.supabaseAnonKey)
  : null;

function updateBookingAvailability() {
  if (!availabilityStatus) return;

  const isWaitingList = bookingAvailabilityMode === "waiting-list";
  availabilityStatus.dataset.status = isWaitingList ? "waiting-list" : "open";
  availabilityStatus.querySelector("strong").textContent = isWaitingList ? "No lesson spaces currently available" : "Taking lesson enquiries";
  availabilityStatus.querySelector("span").textContent = isWaitingList
    ? "Submit the form to join the waiting list and I will reply when a space opens."
    : "Submit the form and I will get back to you.";

  if (bookingAvailabilityStatus) {
    bookingAvailabilityStatus.value = isWaitingList ? "Waiting list" : "Taking lesson enquiries";
  }

  if (bookingSubmitButton) {
    bookingSubmitButton.textContent = isWaitingList ? "Join waiting list" : "Send lesson request";
  }
}

updateBookingAvailability();

function setTheme(mode) {
  const isDark = mode === "dark";
  document.body.classList.toggle("dark-mode", isDark);

  if (themeToggle) {
    themeToggle.setAttribute("aria-pressed", String(isDark));
    themeToggle.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
    themeToggle.querySelector(".theme-toggle-icon").textContent = isDark ? "☀" : "☾";
    themeToggle.querySelector(".theme-toggle-text").textContent = isDark ? "Light" : "Dark";
  }

  localStorage.setItem("driveTheme", mode);
}

function persistVisibleTheme() {
  localStorage.setItem("driveTheme", document.body.classList.contains("dark-mode") ? "dark" : "light");
}

const savedTheme = localStorage.getItem("driveTheme");
const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
setTheme(savedTheme || (prefersDark ? "dark" : "light"));

themeToggle?.addEventListener("click", () => {
  setTheme(document.body.classList.contains("dark-mode") ? "light" : "dark");
});

function openAccountModal() {
  if (accountButton?.dataset.destination === "dashboard") {
    window.location.href = "dashboard.html";
    return;
  }

  accountModal?.showModal();
}

accountButton?.addEventListener("click", openAccountModal);
closeAccountModal?.addEventListener("click", () => accountModal?.close());
accountModal?.addEventListener("click", (event) => {
  if (event.target === accountModal) accountModal.close();
});

document.querySelectorAll('a[href$=".html"], a[href^="learn-online.html"], a[href^="index.html"]').forEach((link) => {
  link.addEventListener("click", persistVisibleTheme);
});

document.querySelectorAll("[data-select-support]").forEach((button) => {
  button.addEventListener("click", () => {
    if (supportType) {
      supportType.value = button.dataset.selectSupport;
    }
    webinarRequestForm?.classList.add("is-visible");
    window.setTimeout(() => {
      webinarRequestForm?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 0);
  });
});

bookingRequestForm?.addEventListener("submit", async (event) => {
  const form = event.currentTarget;
  const message = form.querySelector(".form-message");

  if (!appSupabaseClient) {
    if (message) message.textContent = "Sending your lesson request...";
    return;
  }

  event.preventDefault();
  if (message) message.textContent = "Checking your student account...";

  const { data, error: sessionError } = await appSupabaseClient.auth.getSession();
  const session = data?.session;

  if (sessionError || !session?.user) {
    if (message) message.textContent = "Sending your lesson request by email...";
    form.submit();
    return;
  }

  const formData = new FormData(form);
  if (message) message.textContent = "Saving your request to your dashboard...";

  const { error } = await appSupabaseClient.from("lesson_requests").insert({
    student_id: session.user.id,
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    addresses: formData.get("addresses"),
    postcode: formData.get("postcode"),
    lesson_type: formData.get("lesson_type"),
    current_stage: formData.get("current_stage"),
    theory_status: formData.get("theory_status"),
    practical_test_date: formData.get("practical_test_date"),
    availability: formData.get("availability"),
    notes: formData.get("notes"),
    availability_status: formData.get("availability_status"),
  });

  if (error && message) {
    message.textContent = "Could not save to the dashboard, but your email request is still being sent...";
  } else if (message) {
    message.textContent = "Saved to your dashboard. Sending your email request...";
  }

  form.submit();
});

webinarRequestForm?.addEventListener("submit", (event) => {
  event.currentTarget.querySelector(".form-message").textContent = "Sending your support request...";
});

const revealCards = [...document.querySelectorAll(".training-module")];
revealCards.forEach((card) => card.classList.add("reveal-ready"));

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16 },
  );

  revealCards.forEach((card) => observer.observe(card));
} else {
  revealCards.forEach((card) => card.classList.add("is-visible"));
}

document
  .querySelectorAll("button, .primary-button, .secondary-button, .outline-button, .secondary-action, .module-jump-list a")
  .forEach((element) => {
    element.addEventListener("click", (event) => {
      if (element.tagName === "A" && element.href && !element.href.includes("#")) return;

      const rect = element.getBoundingClientRect();
      const ripple = document.createElement("span");
      const size = Math.max(rect.width, rect.height);
      ripple.className = "click-ripple";
      ripple.style.left = `${event.clientX - rect.left}px`;
      ripple.style.top = `${event.clientY - rect.top}px`;
      ripple.style.width = `${size}px`;
      ripple.style.height = `${size}px`;
      element.append(ripple);
      setTimeout(() => ripple.remove(), 650);
    });
  });
