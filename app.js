const bookingAvailabilityMode = "open"; // Use "waiting-list" when no lesson spaces are available.

const themeToggle = document.querySelector("#themeToggle");
const availabilityStatus = document.querySelector("#availabilityStatus");
const bookingAvailabilityStatus = document.querySelector("#bookingAvailabilityStatus");
const bookingSubmitButton = document.querySelector("#bookingSubmitButton");
const bookingRequestForm = document.querySelector("#bookingRequestForm");
const bookingRequestState = document.querySelector("#bookingRequestState");
const bookingRequestStateTitle = document.querySelector("#bookingRequestStateTitle");
const bookingRequestStateText = document.querySelector("#bookingRequestStateText");
const bookingRequestStateMeta = document.querySelector("#bookingRequestStateMeta");
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
const appSharedSupabaseClients = window.__driveSupabaseClients || (window.__driveSupabaseClients = {});
const appSupabaseKey = appHasSupabaseConfig
  ? `${appAuthConfig.supabaseUrl}::${appAuthConfig.supabaseAnonKey}`
  : "";
const appSupabaseClient = appHasSupabaseConfig && window.supabase
  ? (appSharedSupabaseClients[appSupabaseKey] ||= window.supabase.createClient(
      appAuthConfig.supabaseUrl,
      appAuthConfig.supabaseAnonKey,
    ))
  : null;

function setFormMessage(message, text, type = "info") {
  if (!message) return;
  message.textContent = text;
  message.dataset.type = type;
}

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

function isActiveLessonRequest(status) {
  const value = String(status || "submitted").toLowerCase();
  return !["declined", "rejected", "removed", "cancelled", "complete"].some((word) => value.includes(word));
}

function isApprovedLessonStatus(status) {
  const value = String(status || "").toLowerCase();
  return ["approved", "accepted", "active", "confirmed"].some((word) => value.includes(word));
}

function formatRequestDate(dateValue) {
  if (!dateValue) return "recently";

  return new Date(dateValue).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function showBookingRequestState(request) {
  const status = String(request?.status || "Submitted");
  const normalisedStatus = status.toLowerCase();
  const isEnrolled = request?.state === "enrolled" || isApprovedLessonStatus(status);

  bookingRequestForm?.toggleAttribute("hidden", true);
  bookingRequestState?.toggleAttribute("hidden", false);

  if (bookingRequestStateTitle) {
    bookingRequestStateTitle.textContent = isEnrolled
      ? "You are enrolled as a student"
      : normalisedStatus.includes("waiting")
        ? "You are on the waiting list"
        : "Pending authorisation";
  }

  if (bookingRequestStateText) {
    bookingRequestStateText.textContent = isEnrolled
      ? "Your lesson access is active. Use your dashboard to request lesson times, view confirmed lessons, and track your driving hours."
      : normalisedStatus.includes("waiting")
        ? "Your request has been saved on the waiting list. I will get back to you when a suitable space becomes available."
        : "Your lesson request has been sent and is waiting for review. I will check your area, availability, and current stage before approving access to the lesson diary.";
  }

  if (bookingRequestStateMeta) {
    const sentDate = formatRequestDate(request?.created_at);
    const requestType = request?.lesson_type || "Driving lesson request";
    bookingRequestStateMeta.textContent = isEnrolled
      ? "You do not need to submit the lesson request form again."
      : `${requestType} sent ${sentDate}. Status: ${status}.`;
  }
}

function showBookingRequestForm() {
  bookingRequestState?.toggleAttribute("hidden", true);
  bookingRequestForm?.toggleAttribute("hidden", false);
}

async function loadExistingBookingRequest(session) {
  if (!appSupabaseClient || !bookingRequestForm || !session?.user) {
    showBookingRequestForm();
    return;
  }

  const { data: profile } = await appSupabaseClient
    .from("student_profiles")
    .select("lesson_status,updated_at,created_at")
    .eq("student_id", session.user.id)
    .maybeSingle();

  if (isApprovedLessonStatus(profile?.lesson_status)) {
    showBookingRequestState({
      state: "enrolled",
      status: profile.lesson_status,
      created_at: profile.updated_at || profile.created_at,
      lesson_type: "Practical lesson access",
    });
    return;
  }

  const { data, error } = await appSupabaseClient
    .from("lesson_requests")
    .select("id,status,created_at,lesson_type,postcode")
    .eq("student_id", session.user.id)
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) {
    showBookingRequestForm();
    return;
  }

  const activeRequest = (data || []).find((request) => isActiveLessonRequest(request.status));
  if (activeRequest) {
    showBookingRequestState(activeRequest);
    return;
  }

  showBookingRequestForm();
}

async function getActiveBookingRequest(userId) {
  if (!appSupabaseClient || !userId) return null;

  const { data, error } = await appSupabaseClient
    .from("lesson_requests")
    .select("id,status,created_at,lesson_type,postcode")
    .eq("student_id", userId)
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) return null;
  return (data || []).find((request) => isActiveLessonRequest(request.status)) || null;
}

if (appSupabaseClient && bookingRequestForm) {
  appSupabaseClient.auth.getSession().then(({ data }) => {
    loadExistingBookingRequest(data?.session);
  });

  appSupabaseClient.auth.onAuthStateChange((_event, session) => {
    loadExistingBookingRequest(session);
  });
}

function setTheme(mode) {
  const isDark = mode === "dark";
  document.documentElement.classList.toggle("dark-mode", isDark);
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
  event.preventDefault();

  const form = event.currentTarget;
  const message = form.querySelector(".form-message");
  const submitButton = form.querySelector("button[type='submit']");
  const originalButtonText = submitButton?.textContent || "Send lesson request";

  if (!appSupabaseClient) {
    setFormMessage(
      message,
      "Lesson requests are temporarily unavailable. Please email contact@drivewithniall.co.uk.",
      "error",
    );
    return;
  }

  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = "Checking account...";
  }
  setFormMessage(message, "Checking your student account...");

  const { data, error: sessionError } = await appSupabaseClient.auth.getSession();
  const session = data?.session;

  if (sessionError || !session?.user) {
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = originalButtonText;
    }
    setFormMessage(
      message,
      "Please log in first so your lesson request can be linked to your dashboard.",
      "error",
    );
    accountModal?.showModal();
    return;
  }

  const existingRequest = await getActiveBookingRequest(session.user.id);
  if (existingRequest) {
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = originalButtonText;
    }
    showBookingRequestState(existingRequest);
    return;
  }

  const formData = new FormData(form);
  if (submitButton) submitButton.textContent = "Sending request...";
  setFormMessage(message, "Sending your lesson request...");

  const requestPayload = {
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
  };

  const { data: savedRequest, error } = await appSupabaseClient
    .from("lesson_requests")
    .insert(requestPayload)
    .select("id,status,created_at,lesson_type,postcode")
    .single();

  if (submitButton) {
    submitButton.disabled = false;
    submitButton.textContent = originalButtonText;
  }

  if (error) {
    setFormMessage(
      message,
      "I couldn't save that request yet. Please try again, or email contact@drivewithniall.co.uk.",
      "error",
    );
    return;
  }

  form.reset();
  updateBookingAvailability();
  showBookingRequestState(savedRequest || requestPayload);
  setFormMessage(
    message,
    "Lesson request sent. I'll review it and reply with availability or waiting list options.",
    "success",
  );
});

webinarRequestForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const form = event.currentTarget;
  const message = form.querySelector(".form-message");
  const submitButton = form.querySelector("button[type='submit']");
  const originalButtonText = submitButton?.textContent || "Send support request";

  if (!appSupabaseClient) {
    setFormMessage(
      message,
      "Support requests are temporarily unavailable. Please email contact@drivewithniall.co.uk.",
      "error",
    );
    return;
  }

  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = "Checking account...";
  }
  setFormMessage(message, "Checking your student account...");

  const { data, error: sessionError } = await appSupabaseClient.auth.getSession();
  const session = data?.session;

  if (sessionError || !session?.user) {
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = originalButtonText;
    }
    setFormMessage(
      message,
      "Please log in first so your support request can be linked to your dashboard.",
      "error",
    );
    accountModal?.showModal();
    return;
  }

  const formData = new FormData(form);
  if (submitButton) submitButton.textContent = "Sending request...";
  setFormMessage(message, "Sending your support request...");

  const { error } = await appSupabaseClient.from("support_requests").insert({
    student_id: session.user.id,
    support_option: formData.get("support_option"),
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    current_stage: formData.get("current_stage"),
    recent_test_fail: formData.get("recent_test_fail"),
    regular_instructor_lessons: formData.get("regular_instructor_lessons"),
    private_practice: formData.get("private_practice"),
    theory_test_status: formData.get("theory_test_status"),
    practical_test_status: formData.get("practical_test_status"),
    topic: formData.get("topic"),
    availability: formData.get("availability"),
  });

  if (submitButton) {
    submitButton.disabled = false;
    submitButton.textContent = originalButtonText;
  }

  if (error) {
    setFormMessage(
      message,
      "I couldn't save that support request yet. Please try again, or email contact@drivewithniall.co.uk.",
      "error",
    );
    return;
  }

  form.reset();
  setFormMessage(
    message,
    "Support request sent. I'll review it and get back to you.",
    "success",
  );
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
