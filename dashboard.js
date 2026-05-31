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

const lessonDiaryAvailability = [
  { day: 1, times: ["10:00", "13:00"] },
  { day: 2, times: ["11:00", "14:00"] },
  { day: 4, times: ["10:00", "15:00"] },
  { day: 5, times: ["09:30", "12:30"] },
];

let selectedDiarySlot = null;
let lessonStudentAccess = false;

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

function buildDiarySlots() {
  const slots = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let offset = 1; offset <= 21 && slots.length < 8; offset += 1) {
    const date = new Date(today);
    date.setDate(today.getDate() + offset);
    const availability = lessonDiaryAvailability.find((entry) => entry.day === date.getDay());

    if (!availability) continue;

    availability.times.forEach((time) => {
      const label = `${formatSlotDate(date)}, ${time}`;
      slots.push({
        label,
        value: `${date.toISOString().slice(0, 10)} ${time}`,
      });
    });
  }

  return slots.slice(0, 8);
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

function renderDiarySlots() {
  if (!diarySlotList) return;

  const slots = buildDiarySlots();
  diarySlotList.innerHTML = "";

  slots.forEach((slot) => {
    const button = document.createElement("button");
    button.className = "diary-slot";
    button.type = "button";
    button.innerHTML = `<strong>${slot.label.split(", ")[0]}</strong><span>${slot.label.split(", ")[1]}</span>`;
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

function normaliseLessonRecord(lesson) {
  const dateValue = lesson.starts_at || lesson.lesson_date || lesson.date || lesson.created_at;
  const hours = Number(lesson.hours || lesson.duration_hours || 2);
  const status = String(lesson.status || "").toLowerCase();
  const isCompleted = status.includes("complete") || status.includes("done") || status.includes("attended");

  return {
    date: dateValue,
    label: formatLessonDate(dateValue),
    hours: Number.isFinite(hours) ? hours : 2,
    topic: lesson.topic || lesson.focus || lesson.lesson_type || "Driving lesson",
    notes: lesson.notes || lesson.summary || "",
    status: lesson.status || (isCompleted ? "Completed" : "Confirmed"),
    isCompleted,
  };
}

function renderLessonRecordList(listElement, lessons) {
  if (!listElement) return;
  listElement.innerHTML = "";

  lessons.forEach((lesson) => {
    const item = document.createElement("li");
    item.innerHTML = `
      <div>
        <strong>${lesson.topic}</strong>
        <span>${lesson.label} · ${lesson.hours} hour${lesson.hours === 1 ? "" : "s"}</span>
      </div>
      <em>${lesson.status}</em>
      ${lesson.notes ? `<p>${lesson.notes}</p>` : ""}
    `;
    listElement.append(item);
  });
}

function updateLessonProgress(lessons = []) {
  const records = lessons.map(normaliseLessonRecord);
  const upcoming = records.filter((lesson) => !lesson.isCompleted);
  const completed = records.filter((lesson) => lesson.isCompleted);
  const completedHours = completed.reduce((total, lesson) => total + lesson.hours, 0);

  if (totalLessonHours) totalLessonHours.textContent = String(completedHours);
  if (upcomingLessonCount) upcomingLessonCount.textContent = String(upcoming.length);
  if (completedLessonCount) completedLessonCount.textContent = String(completed.length);

  upcomingLessonsEmpty?.toggleAttribute("hidden", upcoming.length > 0);
  lessonHistoryEmpty?.toggleAttribute("hidden", completed.length > 0);

  renderLessonRecordList(upcomingLessonsList, upcoming);
  renderLessonRecordList(lessonHistoryList, completed);
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
    renderDiarySlots();
  }
}

function isApprovedStatus(status) {
  const value = String(status || "").toLowerCase();
  return ["approved", "accepted", "active", "confirmed"].some((word) => value.includes(word));
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
  const hasApprovedRequest = requests.some((request) => isApprovedStatus(request.status));

  if (!requests.length) {
    setLessonStatus("No lesson requests are linked to this account yet. Use the request button when you are ready.");
    return;
  }

  setLessonStatus("Your latest linked requests:");
  renderLessonRequests(requests);

  if (hasApprovedRequest) {
    setLessonStudentAccess(true);
  }
}

async function loadLessonProgress(userId) {
  updateLessonProgress([]);

  if (!dashboardClient) return;

  const { data, error } = await dashboardClient
    .from("lessons")
    .select("id,status,starts_at,lesson_date,hours,duration_hours,topic,focus,lesson_type,notes,summary,created_at")
    .eq("student_id", userId)
    .order("starts_at", { ascending: true });

  if (error || !data) {
    return;
  }

  if (data.length > 0) {
    setLessonStudentAccess(true);
  }

  updateLessonProgress(data);
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

  showSignedIn(data.session);
  loadLessonStudentAccess(data.session.user.id);
  loadLessonRequests(data.session.user.id);
  loadLessonProgress(data.session.user.id);
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
    setDiaryStatus("Sending your diary request...");
    return;
  }

  event.preventDefault();
  setDiaryStatus("Saving your diary request...");

  const { data } = await dashboardClient.auth.getSession();
  const session = data?.session;

  if (session?.user) {
    await dashboardClient.from("lesson_slot_requests").insert({
      student_id: session.user.id,
      student_email: session.user.email,
      requested_slot: selectedDiarySlot.value,
      requested_label: selectedDiarySlot.label,
      status: "Requested",
    });
  }

  setDiaryStatus("Request sent. I will confirm the time before it is booked.");
  diaryRequestForm.submit();
});

initialiseDashboard();
