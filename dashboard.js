const dashboardConfig = window.driveAuthConfig || {};
const hasDashboardAuthConfig =
  dashboardConfig.supabaseUrl &&
  dashboardConfig.supabaseAnonKey &&
  !dashboardConfig.supabaseUrl.includes("PASTE_") &&
  !dashboardConfig.supabaseAnonKey.includes("PASTE_");

const dashboardClient = hasDashboardAuthConfig && window.supabase
  ? window.supabase.createClient(dashboardConfig.supabaseUrl, dashboardConfig.supabaseAnonKey)
  : null;

const themeToggle = document.querySelector("#themeToggle");
const signedOutDashboard = document.querySelector("#signedOutDashboard");
const signedInDashboard = document.querySelector("#signedInDashboard");
const dashboardIntro = document.querySelector("#dashboardIntro");
const dashboardEmail = document.querySelector("#dashboardEmail");
const dashboardStatus = document.querySelector("#dashboardStatus");
const dashboardSignOut = document.querySelector("#dashboardSignOut");
const lessonRequestStatus = document.querySelector("#lessonRequestStatus");
const lessonRequestList = document.querySelector("#lessonRequestList");
const diarySlotList = document.querySelector("#diarySlotList");
const diaryRequestForm = document.querySelector("#diaryRequestForm");
const diaryStudentEmail = document.querySelector("#diaryStudentEmail");
const diarySelectedSlot = document.querySelector("#diarySelectedSlot");
const diarySubmitButton = document.querySelector("#diarySubmitButton");
const diaryStatus = document.querySelector("#diaryStatus");
const diaryRequestList = document.querySelector("#diaryRequestList");
const diaryRequestsEmpty = document.querySelector("#diaryRequestsEmpty");
const totalLessonHours = document.querySelector("#totalLessonHours");
const upcomingLessonCount = document.querySelector("#upcomingLessonCount");
const completedLessonCount = document.querySelector("#completedLessonCount");
const upcomingLessonsList = document.querySelector("#upcomingLessonsList");
const lessonHistoryList = document.querySelector("#lessonHistoryList");
const upcomingLessonsEmpty = document.querySelector("#upcomingLessonsEmpty");
const lessonHistoryEmpty = document.querySelector("#lessonHistoryEmpty");
const lessonAccessNotice = document.querySelector("#lessonAccessNotice");
const lessonAccessMessage = document.querySelector("#lessonAccessMessage");
const lessonStudentOnlySections = document.querySelectorAll(".lesson-student-only");
const dashboardPaymentMessage = document.querySelector("#dashboardPaymentMessage");
const dashboardRemainingHours = document.querySelector("#dashboardRemainingHours");
const dashboardPurchasedHours = document.querySelector("#dashboardPurchasedHours");
const dashboardAccountBalance = document.querySelector("#dashboardAccountBalance");

let selectedDiarySlot = null;
let lessonStudentAccess = false;
let currentDashboardUserId = null;
let cancellationRequestSlots = new Set();
let availableDiarySlots = [];

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

function setDashboardStatus(message, type = "info") {
  if (!dashboardStatus) return;
  dashboardStatus.textContent = message;
  dashboardStatus.dataset.type = type;
  dashboardStatus.hidden = !message;
}

function setLessonStatus(message) {
  if (lessonRequestStatus) {
    lessonRequestStatus.textContent = message;
  }
}

function setDiaryStatus(message) {
  if (diaryStatus) {
    diaryStatus.textContent = message;
  }
}

function formatSlotDate(date) {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(date);
}

function selectDiarySlot(slot, button) {
  selectedDiarySlot = slot;

  document.querySelectorAll(".diary-slot").forEach((slotButton) => {
    slotButton.classList.toggle("is-selected", slotButton === button);
  });

  if (diarySelectedSlot) {
    diarySelectedSlot.value = slot.label;
  }

  if (diarySubmitButton) {
    diarySubmitButton.disabled = false;
  }

  setDiaryStatus(`Selected: ${slot.label}. I will confirm before it is booked.`);
}

function normaliseAvailabilitySlot(slot) {
  const date = new Date(slot.starts_at);
  const label = slot.label || (Number.isNaN(date.getTime()) ? String(slot.starts_at) : formatLessonDate(slot.starts_at));
  return {
    id: slot.id,
    label,
    value: slot.starts_at,
    hours: Number(slot.hours || 2),
  };
}

function renderDiarySlots(slots = availableDiarySlots) {
  if (!diarySlotList) return;

  diarySlotList.innerHTML = "";

  if (!slots.length) {
    const empty = document.createElement("p");
    empty.className = "diary-empty-note";
    empty.textContent = "No lesson times are available to request right now. Check back later or message me if you need a specific week.";
    diarySlotList.append(empty);
    return;
  }

  slots.forEach((slot) => {
    const button = document.createElement("button");
    button.className = "diary-slot";
    button.type = "button";
    const [datePart, timePart = "Time to confirm"] = slot.label.split(", ");
    button.innerHTML = `<strong>${datePart}</strong><span>${timePart}</span>`;
    button.addEventListener("click", () => selectDiarySlot(slot, button));
    diarySlotList.append(button);
  });
}

function formatLessonDate(value) {
  if (!value) return "Date to confirm";
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatPaymentHours(value) {
  const number = Number(value || 0);
  if (!Number.isFinite(number)) return "0";
  return Number.isInteger(number) ? String(number) : number.toFixed(1);
}

function formatPoundsFromPence(value) {
  const pence = Number(value || 0);
  if (!Number.isFinite(pence)) return "£0";
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: pence % 100 === 0 ? 0 : 2,
  }).format(pence / 100);
}

function normaliseLessonRecord(lesson) {
  const dateValue = lesson.starts_at || lesson.lesson_date || lesson.date || lesson.created_at;
  const hours = Number(lesson.hours || lesson.duration_hours || 2);
  const status = String(lesson.status || "").toLowerCase();
  const isCompleted =
    status.includes("complete") ||
    status.includes("done") ||
    status.includes("attended") ||
    status.includes("deliver");
  const isCancelled = status.includes("cancel");
  const hasCancellationRequest = cancellationRequestSlots.has(String(dateValue || ""));

  return {
    id: lesson.id,
    availability_slot_id: lesson.availability_slot_id,
    date: dateValue,
    label: formatLessonDate(dateValue),
    hours: Number.isFinite(hours) ? hours : 2,
    topic: lesson.topic || lesson.focus || lesson.lesson_type || "Driving lesson",
    notes: lesson.summary || lesson.notes || "",
    status: lesson.status || (isCompleted ? "Completed" : "Confirmed"),
    isCompleted,
    isCancelled,
    hasCancellationRequest,
  };
}

function renderLessonRecordList(listElement, lessons, options = {}) {
  if (!listElement) return;
  listElement.innerHTML = "";

  lessons.forEach((lesson) => {
    const item = document.createElement("li");
    const canRequestCancellation = options.allowCancellation && !lesson.hasCancellationRequest;
    item.innerHTML = `
      <div>
        <strong>${lesson.topic}</strong>
        <span>${lesson.label} · ${lesson.hours} hour${lesson.hours === 1 ? "" : "s"}</span>
      </div>
      <em>${lesson.hasCancellationRequest ? "Cancellation requested" : lesson.status}</em>
      ${lesson.notes ? `<p>${lesson.notes}</p>` : ""}
    `;

    if (options.allowCancellation) {
      const actions = document.createElement("div");
      actions.className = "lesson-record-actions";

      if (canRequestCancellation) {
        const cancelButton = document.createElement("button");
        cancelButton.className = "secondary-button lesson-cancel-button";
        cancelButton.type = "button";
        cancelButton.textContent = "Request cancellation";
        cancelButton.addEventListener("click", () => requestLessonCancellation(lesson));
        actions.append(cancelButton);
      } else {
        const note = document.createElement("span");
        note.className = "lesson-action-note";
        note.textContent = "Cancellation request sent";
        actions.append(note);
      }

      item.append(actions);
    }

    listElement.append(item);
  });
}

function renderDiaryRequests(requests = []) {
  if (!diaryRequestList) return;

  const activeRequests = requests.filter((request) => !isClosedDiaryRequestStatus(request.status));

  cancellationRequestSlots = new Set(
    activeRequests
      .filter((request) => String(request.status || "").toLowerCase().includes("cancel"))
      .map((request) => String(request.requested_slot || "")),
  );

  diaryRequestList.innerHTML = "";
  diaryRequestsEmpty?.toggleAttribute("hidden", activeRequests.length > 0);

  activeRequests.forEach((request) => {
    const item = document.createElement("li");
    const createdAt = request.created_at
      ? new Date(request.created_at).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
        })
      : "Recently";
    const label = request.requested_label || request.requested_slot || "Requested lesson time";
    const status = request.status || "Requested";

    item.innerHTML = `
      <div>
        <strong>${label}</strong>
        <span>Sent ${createdAt}</span>
      </div>
      <em>${status}</em>
    `;
    diaryRequestList.append(item);
  });
}

function updateLessonProgress(lessons = []) {
  const records = lessons.map(normaliseLessonRecord);
  const upcoming = records
    .filter((lesson) => !lesson.isCompleted && !lesson.isCancelled)
    .sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0));
  const completed = records
    .filter((lesson) => lesson.isCompleted)
    .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
  const completedHours = completed.reduce((total, lesson) => total + lesson.hours, 0);

  if (totalLessonHours) totalLessonHours.textContent = String(completedHours);
  if (upcomingLessonCount) upcomingLessonCount.textContent = String(upcoming.length);
  if (completedLessonCount) completedLessonCount.textContent = String(completed.length);

  upcomingLessonsEmpty?.toggleAttribute("hidden", upcoming.length > 0);
  lessonHistoryEmpty?.toggleAttribute("hidden", completed.length > 0);

  renderLessonRecordList(upcomingLessonsList, upcoming, { allowCancellation: true });
  renderLessonRecordList(lessonHistoryList, completed);
}

function updatePaymentBalance(balance) {
  const purchased = Number(balance?.purchased_hours || 0);
  const used = Number(balance?.used_hours || 0);
  const remaining = Math.max(purchased - used, 0);

  if (dashboardRemainingHours) dashboardRemainingHours.textContent = formatPaymentHours(remaining);
  if (dashboardPurchasedHours) dashboardPurchasedHours.textContent = formatPaymentHours(purchased);
  if (dashboardAccountBalance) dashboardAccountBalance.textContent = formatPoundsFromPence(balance?.account_balance_pence || 0);

  if (dashboardPaymentMessage) {
    dashboardPaymentMessage.textContent = balance
      ? "Your latest payment balance is shown below for 2 hour lesson payments and 10 hour packages."
      : "No payment balance has been added yet. Use the payments page to pay £74 for a 2 hour lesson or buy a 10 hour package, then your balance will appear here.";
  }
}

function isClosedDiaryRequestStatus(status) {
  const value = String(status || "").toLowerCase();
  return [
    "confirm",
    "complete",
    "deliver",
    "declin",
    "reject",
    "approv",
    "remov",
    "cancelled",
    "canceled",
  ].some((word) => value.includes(word));
}

function setLessonStudentAccess(hasAccess, message) {
  lessonStudentAccess = hasAccess;

  lessonStudentOnlySections.forEach((section) => {
    section.toggleAttribute("hidden", !hasAccess);
  });

  lessonAccessNotice?.toggleAttribute("hidden", hasAccess);

  if (lessonAccessMessage && message) {
    lessonAccessMessage.textContent = message;
  }

  if (hasAccess) {
    loadAvailableDiarySlots();
  } else {
    selectedDiarySlot = null;
    availableDiarySlots = [];
    renderDiarySlots([]);
    if (diarySelectedSlot) diarySelectedSlot.value = "";
    if (diarySubmitButton) diarySubmitButton.disabled = true;
    renderDiaryRequests([]);
  }
}

function isApprovedStatus(status) {
  const value = String(status || "").toLowerCase();
  return ["approved", "accepted", "active", "confirmed"].some((word) => value.includes(word));
}

function isPausedLessonAccessStatus(status) {
  const value = String(status || "").toLowerCase();
  return ["paused", "pause", "hold", "inactive"].some((word) => value.includes(word));
}

function isRemovedLessonAccessStatus(status) {
  const value = String(status || "").toLowerCase();
  return ["removed", "revoked", "closed", "disabled"].some((word) => value.includes(word));
}

function showSignedOut(message) {
  signedOutDashboard?.removeAttribute("hidden");
  signedInDashboard?.setAttribute("hidden", "");
  if (dashboardIntro) {
    dashboardIntro.textContent = "Sign in to view lesson requests, support options, and course access updates.";
  }
  setDashboardStatus(message || "", message ? "info" : "info");
}

function showSignedIn(session) {
  const email = session?.user?.email || "your account";
  signedOutDashboard?.setAttribute("hidden", "");
  signedInDashboard?.removeAttribute("hidden");

  if (dashboardEmail) {
    dashboardEmail.textContent = email;
  }

  if (diaryStudentEmail) {
    diaryStudentEmail.value = email;
  }

  if (dashboardIntro) {
    dashboardIntro.textContent = "A simple home for your lesson requests, support options, and course updates.";
  }

  setDashboardStatus("");
}

function renderLessonRequests(requests) {
  if (!lessonRequestList) return;
  lessonRequestList.innerHTML = "";

  requests.forEach((request) => {
    const item = document.createElement("li");
    const date = request.created_at ? new Date(request.created_at).toLocaleDateString("en-GB") : "Recent";
    const status = request.status || "Submitted";
    const label = request.lesson_type || request.postcode || "Lesson request";
    const area = request.postcode ? ` · ${request.postcode}` : "";
    item.innerHTML = `<strong>${label}</strong><span>${status}${area} · ${date}</span>`;
    lessonRequestList.append(item);
  });
}

async function loadLessonRequests(userId) {
  if (!dashboardClient) {
    setLessonStatus("Lesson request syncing is not connected yet. For now, lesson requests are still sent to your email.");
    return;
  }

  const { data, error } = await dashboardClient
    .from("lesson_requests")
    .select("id,status,lesson_type,postcode,created_at")
    .eq("student_id", userId)
    .order("created_at", { ascending: false })
    .limit(5);

  if (error) {
    setLessonStatus("Lesson request syncing is not fully connected yet. Your lesson requests are still safely sent by email.");
    return;
  }

  const requests = data || [];

  if (!requests.length) {
    setLessonStatus("No lesson requests are linked to this account yet. Use the request button when you are ready.");
    return;
  }

  setLessonStatus("Your latest linked requests:");
  renderLessonRequests(requests);
}

async function loadLessonProgress(userId) {
  updateLessonProgress([]);

  if (!dashboardClient) return;

  const { data, error } = await dashboardClient
    .from("lessons")
    .select("id,status,availability_slot_id,starts_at,lesson_date,hours,duration_hours,topic,focus,lesson_type,notes,summary,created_at")
    .eq("student_id", userId)
    .order("starts_at", { ascending: true });

  if (error || !data) {
    return;
  }

  updateLessonProgress(data);
}

async function loadPaymentBalance(userId) {
  updatePaymentBalance(null);

  if (!dashboardClient) return;

  const { data, error } = await dashboardClient
    .from("student_payment_balances")
    .select("purchased_hours,used_hours,account_balance_pence,last_payment_at,updated_at")
    .eq("student_id", userId)
    .maybeSingle();

  if (error) {
    if (dashboardPaymentMessage) {
      dashboardPaymentMessage.textContent = "Payment tracking is ready in the dashboard, but the Supabase payment balance table still needs to be added.";
    }
    return;
  }

  updatePaymentBalance(data);
}

async function loadAvailableDiarySlots() {
  availableDiarySlots = [];
  renderDiarySlots([]);

  if (!dashboardClient || !lessonStudentAccess) return;

  const { data, error } = await dashboardClient
    .from("lesson_availability_slots")
    .select("id,starts_at,label,hours,status")
    .eq("status", "Available")
    .order("starts_at", { ascending: true })
    .limit(60);

  if (error || !data) {
    setDiaryStatus("I couldn't load the latest available lesson times yet. Please refresh or message me directly.");
    return;
  }

  availableDiarySlots = data.map(normaliseAvailabilitySlot);
  renderDiarySlots(availableDiarySlots);
}

async function loadDiaryRequests(userId) {
  renderDiaryRequests([]);

  if (!dashboardClient) return [];

  const { data, error } = await dashboardClient
    .from("lesson_slot_requests")
    .select("id,status,requested_slot,requested_label,availability_slot_id,created_at")
    .eq("student_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error || !data) {
    return [];
  }

  renderDiaryRequests(data);
  return data;
}

async function loadLessonStudentAccess(userId) {
  setLessonStudentAccess(false, "Your lesson request is being reviewed. Once you are accepted as a practical lesson student, your diary, upcoming lessons, lesson history and completed hours will appear here.");

  if (!dashboardClient) return;

  const { data, error } = await dashboardClient
    .from("student_profiles")
    .select("lesson_status")
    .eq("student_id", userId)
    .maybeSingle();

  if (error || !data) return;

  if (isApprovedStatus(data.lesson_status)) {
    setLessonStudentAccess(true);
    return;
  }

  if (isPausedLessonAccessStatus(data.lesson_status)) {
    setLessonStudentAccess(
      false,
      "Your practical lesson access is currently paused. Contact me if you need your diary access reopened.",
    );
    return;
  }

  if (isRemovedLessonAccessStatus(data.lesson_status)) {
    setLessonStudentAccess(
      false,
      "Your practical lesson access is currently inactive. Submit a new request or contact me if you need access restored.",
    );
  }
}

async function initialiseDashboard() {
  const savedTheme = localStorage.getItem("driveTheme");
  const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
  setTheme(savedTheme || (prefersDark ? "dark" : "light"));

  if (!dashboardClient) {
    showSignedOut("Student accounts need the Supabase project details before the dashboard can load.");
    return;
  }

  const { data, error } = await dashboardClient.auth.getSession();
  if (error) {
    showSignedOut("There was a problem checking your account. Sign in again from the homepage.");
    return;
  }

  if (!data.session) {
    showSignedOut("");
    return;
  }

  currentDashboardUserId = data.session.user.id;
  showSignedIn(data.session);
  await loadLessonStudentAccess(data.session.user.id);
  await loadLessonRequests(data.session.user.id);
  await loadDiaryRequests(data.session.user.id);
  await loadLessonProgress(data.session.user.id);
  await loadPaymentBalance(data.session.user.id);
}

themeToggle?.addEventListener("click", () => {
  setTheme(document.body.classList.contains("dark-mode") ? "light" : "dark");
});

dashboardSignOut?.addEventListener("click", async () => {
  if (!dashboardClient) return;

  const { error } = await dashboardClient.auth.signOut();
  if (error) {
    setDashboardStatus("Could not sign out. Try again.", "error");
    return;
  }

  window.location.href = "index.html";
});

diaryRequestForm?.addEventListener("submit", async (event) => {
  if (!lessonStudentAccess) {
    event.preventDefault();
    setDiaryStatus("Lesson slots are only available once your practical lesson request has been accepted.");
    return;
  }

  if (!selectedDiarySlot) {
    event.preventDefault();
    setDiaryStatus("Choose a lesson time before sending the request.");
    return;
  }

  if (!dashboardClient) {
    event.preventDefault();
    setDiaryStatus("Diary requests are temporarily unavailable. Please message me directly.");
    return;
  }

  event.preventDefault();
  setDiaryStatus("Saving your diary request...");
  if (diarySubmitButton) {
    diarySubmitButton.disabled = true;
  }

  const { data } = await dashboardClient.auth.getSession();
  const session = data?.session;

  if (!session?.user) {
    setDiaryStatus("Please sign in again before requesting a lesson time.");
    if (diarySubmitButton && selectedDiarySlot) {
      diarySubmitButton.disabled = false;
    }
    return;
  }

  const slotToRequest = selectedDiarySlot;
  const now = new Date().toISOString();
  const { data: heldSlot, error: holdError } = await dashboardClient
    .from("lesson_availability_slots")
    .update({
      status: "Pending",
      assigned_student_id: session.user.id,
      assigned_student_email: session.user.email,
      updated_at: now,
    })
    .eq("id", slotToRequest.id)
    .eq("status", "Available")
    .select("id")
    .maybeSingle();

  if (holdError) {
    setDiaryStatus("I couldn't hold that lesson time yet. Please try again.");
    if (diarySubmitButton && selectedDiarySlot) {
      diarySubmitButton.disabled = false;
    }
    return;
  }

  if (!heldSlot) {
    selectedDiarySlot = null;
    if (diarySelectedSlot) {
      diarySelectedSlot.value = "";
    }
    await loadAvailableDiarySlots();
    setDiaryStatus("That lesson time has just been requested. Please choose another slot.");
    return;
  }

  const { error } = await dashboardClient.from("lesson_slot_requests").insert({
    student_id: session.user.id,
    student_email: session.user.email,
    availability_slot_id: slotToRequest.id,
    requested_slot: slotToRequest.value,
    requested_label: slotToRequest.label,
    status: "Requested",
  });

  if (error) {
    await dashboardClient
      .from("lesson_availability_slots")
      .update({
        status: "Available",
        assigned_student_id: null,
        assigned_student_email: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", slotToRequest.id)
      .eq("status", "Pending");
    setDiaryStatus("I couldn't save that diary request yet. Please try again.");
    if (diarySubmitButton && selectedDiarySlot) {
      diarySubmitButton.disabled = false;
    }
    return;
  }

  selectedDiarySlot = null;
  document.querySelectorAll(".diary-slot").forEach((slotButton) => {
    slotButton.classList.remove("is-selected");
  });
  if (diarySelectedSlot) {
    diarySelectedSlot.value = "";
  }
  if (diarySubmitButton) {
    diarySubmitButton.disabled = true;
  }
  await loadAvailableDiarySlots();
  await loadDiaryRequests(session.user.id);
  setDiaryStatus("Request sent. I am holding that time until I confirm it.");
});

async function requestLessonCancellation(lesson) {
  if (!lessonStudentAccess || !lesson?.date) return;

  const confirmed = window.confirm(`Request to cancel ${lesson.label}? I will review it before the lesson is removed.`);
  if (!confirmed) return;

  if (!dashboardClient) {
    setDiaryStatus("Cancellation requests are temporarily unavailable. Please message me directly.");
    return;
  }

  setDiaryStatus("Sending cancellation request...");

  const { data } = await dashboardClient.auth.getSession();
  const session = data?.session;

  if (!session?.user) {
    setDiaryStatus("Please sign in again before requesting a cancellation.");
    return;
  }

  const { error } = await dashboardClient.from("lesson_slot_requests").insert({
    student_id: session.user.id,
    student_email: session.user.email,
    availability_slot_id: lesson.availability_slot_id || null,
    requested_slot: lesson.date,
    requested_label: `Cancel lesson: ${lesson.label}`,
    status: "Cancel requested",
  });

  if (error) {
    setDiaryStatus("I couldn't save that cancellation request yet. Please try again.");
    return;
  }

  await loadDiaryRequests(currentDashboardUserId || session.user.id);
  await loadLessonProgress(currentDashboardUserId || session.user.id);
  setDiaryStatus("Cancellation request sent. I will confirm before changing the booking.");
}

initialiseDashboard();
