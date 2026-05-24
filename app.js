const availability = [
  { day: "Tue 26 May", time: "10:30 AM", area: "Town centre routes", price: "£38" },
  { day: "Wed 27 May", time: "2:00 PM", area: "Junctions and roundabouts", price: "£38" },
  { day: "Thu 28 May", time: "9:00 AM", area: "Mock test slot", price: "£45" },
  { day: "Fri 29 May", time: "4:30 PM", area: "Beginner lesson", price: "£38" },
];

const paymentModal = document.querySelector("#paymentModal");
const paymentTitle = document.querySelector("#paymentTitle");
const availabilityList = document.querySelector("#availabilityList");
const selectedSlot = document.querySelector("#selectedSlot");
const themeToggle = document.querySelector("#themeToggle");
let selectedAvailability = null;

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

const savedTheme = localStorage.getItem("driveTheme");
const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
setTheme(savedTheme || (prefersDark ? "dark" : "light"));

themeToggle?.addEventListener("click", () => {
  setTheme(document.body.classList.contains("dark-mode") ? "light" : "dark");
});

document.querySelectorAll("[data-package]").forEach((button) => {
  button.addEventListener("click", () => {
    paymentTitle.textContent = button.dataset.package;
    paymentModal.showModal();
  });
});

document.querySelectorAll("[data-select-webinar]").forEach((button) => {
  button.addEventListener("click", () => {
    selectedSlot.textContent = `${button.dataset.selectWebinar} selected. Choose a diary slot to attach it to your booking request.`;
    document.querySelector("#book").scrollIntoView({ behavior: "smooth" });
  });
});

availability.forEach((slot) => {
  const button = document.createElement("button");
  button.className = "slot-button";
  button.type = "button";
  button.innerHTML = `
    <span>
      <strong>${slot.day} at ${slot.time}</strong>
      <span>${slot.area}</span>
    </span>
    <span class="slot-price">${slot.price}</span>
  `;

  button.addEventListener("click", () => {
    selectedAvailability = slot;
    document.querySelectorAll(".slot-button").forEach((item) => item.classList.remove("is-selected"));
    button.classList.add("is-selected");
    selectedSlot.textContent = `${slot.day} at ${slot.time} for ${slot.area}.`;
  });

  availabilityList.append(button);
});

document.querySelector("#confirmBooking").addEventListener("click", () => {
  if (!selectedAvailability) {
    selectedSlot.textContent = "Please choose an available slot first.";
    return;
  }

  selectedSlot.textContent = `Booking request saved for ${selectedAvailability.day} at ${selectedAvailability.time}.`;
});

document.querySelector("#studentForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const name = new FormData(form).get("name");
  form.querySelector(".form-message").textContent = `Thanks ${name}. Your Drive with Niall training profile has been captured in this prototype.`;
  form.reset();
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
  .querySelectorAll("button, .primary-button, .secondary-button, .outline-button, .secondary-action, .package-card button, .module-jump-list a")
  .forEach((element) => {
    element.addEventListener("click", (event) => {
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
