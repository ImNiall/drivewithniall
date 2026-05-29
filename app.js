const bookingAvailabilityMode = "open"; // Use "waiting-list" when no lesson spaces are available.

const themeToggle = document.querySelector("#themeToggle");
const availabilityStatus = document.querySelector("#availabilityStatus");
const bookingAvailabilityStatus = document.querySelector("#bookingAvailabilityStatus");
const bookingSubmitButton = document.querySelector("#bookingSubmitButton");
const webinarRequestForm = document.querySelector("#webinarRequestForm");
const supportType = document.querySelector("#supportType");
const accountModal = document.querySelector("#accountModal");
const accountButton = document.querySelector("#accountButton");
const closeAccountModal = document.querySelector("#closeAccountModal");
const reviewsSection = document.querySelector("[data-reviews-section]");

const googleReviewsLink = "https://www.google.com/search?q=Drive+with+Niall+Google+reviews"; // Replace with your live Google Business Profile reviews link.
const featuredGoogleReviews = [
  {
    reviewer: "Placeholder",
    area: "Bromsgrove",
    text: "Placeholder review - replace this with genuine Google review text before relying on it as social proof.",
    isPlaceholder: true,
  },
  {
    reviewer: "Placeholder",
    area: "Longbridge",
    text: "Placeholder review - paste a real Google review here, keeping only the reviewer's first name.",
    isPlaceholder: true,
  },
  {
    reviewer: "Placeholder",
    area: "Redditch",
    text: "Placeholder review - use real review wording from your Google Business Profile only.",
    isPlaceholder: true,
  },
];

function escapeHtml(value = "") {
  return value.replace(/[&<>"']/g, (character) => {
    const replacements = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return replacements[character];
  });
}

function renderGoogleReviews() {
  if (!reviewsSection) return;

  const reviewCards = featuredGoogleReviews
    .map(
      (review) => `
        <article class="review-card">
          <div class="review-card-top">
            <span class="star-rating" aria-label="5 out of 5 stars">★★★★★</span>
            ${review.area ? `<span class="review-area">${escapeHtml(review.area)}</span>` : ""}
          </div>
          <p>${escapeHtml(review.text)}</p>
          <footer>
            <strong>${escapeHtml(review.reviewer)}</strong>
            ${review.isPlaceholder ? `<span>Placeholder</span>` : ""}
          </footer>
        </article>
      `,
    )
    .join("");

  reviewsSection.innerHTML = `
    <div class="reviews-trust">
      <div>
        <p class="eyebrow">Learner reviews</p>
        <h3>Rated 5.0 on Google</h3>
        <p>Trusted by learners across South Birmingham, Bromsgrove, Longbridge, Rubery and Redditch.</p>
      </div>
      <a class="outline-button" href="${escapeHtml(googleReviewsLink)}" target="_blank" rel="noopener">Read all Google reviews</a>
    </div>
    <div class="review-grid">
      ${reviewCards}
    </div>
  `;
}

renderGoogleReviews();

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
  accountModal?.showModal();
}

accountButton?.addEventListener("click", openAccountModal);
document.querySelector("[data-open-account]")?.addEventListener("click", openAccountModal);
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

document.querySelector("#bookingRequestForm")?.addEventListener("submit", (event) => {
  event.currentTarget.querySelector(".form-message").textContent = "Sending your lesson request...";
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
