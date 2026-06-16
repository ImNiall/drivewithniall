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
const completedLessonMeta = document.querySelector("#completedLessonMeta");
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
const dashboardPurchasedMeta = document.querySelector("#dashboardPurchasedMeta");
const dashboardAccountBalance = document.querySelector("#dashboardAccountBalance");
const studentProgressSummary = document.querySelector("#studentProgressSummary");
const testReadinessValue = document.querySelector("#testReadinessValue");
const studentStrengthsList = document.querySelector("#studentStrengthsList");
const studentWeakAreasList = document.querySelector("#studentWeakAreasList");
const studentHomeworkEmpty = document.querySelector("#studentHomeworkEmpty");
const studentHomeworkList = document.querySelector("#studentHomeworkList");
const skillProgressList = document.querySelector("#skillProgressList");
const studentLessonOverviewDialog = document.querySelector("#studentLessonOverviewDialog");
const closeStudentLessonOverviewDialog = document.querySelector("#closeStudentLessonOverviewDialog");
const studentLessonOverviewTitle = document.querySelector("#studentLessonOverviewTitle");
const studentLessonOverviewMeta = document.querySelector("#studentLessonOverviewMeta");
const studentLessonOverviewReadiness = document.querySelector("#studentLessonOverviewReadiness");
const studentLessonOverviewFocus = document.querySelector("#studentLessonOverviewFocus");
const studentLessonOverviewSummary = document.querySelector("#studentLessonOverviewSummary");
const studentLessonOverviewTopics = document.querySelector("#studentLessonOverviewTopics");
const studentLessonOverviewNotes = document.querySelector("#studentLessonOverviewNotes");
const studentLessonOverviewHomework = document.querySelector("#studentLessonOverviewHomework");
const studentLessonOverviewRatings = document.querySelector("#studentLessonOverviewRatings");
const dashboardNextStepKicker = document.querySelector("#dashboardNextStepKicker");
const dashboardNextStepTitle = document.querySelector("#dashboardNextStepTitle");
const dashboardNextStepBody = document.querySelector("#dashboardNextStepBody");
const dashboardNextStepButton = document.querySelector("#dashboardNextStepButton");
const lessonsSpotlightKicker = document.querySelector("#lessonsSpotlightKicker");
const lessonsSpotlightTitle = document.querySelector("#lessonsSpotlightTitle");
const lessonsSpotlightBody = document.querySelector("#lessonsSpotlightBody");
const lessonsSpotlightStatus = document.querySelector("#lessonsSpotlightStatus");
const lessonsSpotlightButton = document.querySelector("#lessonsSpotlightButton");
const progressCurrentFocus = document.querySelector("#progressCurrentFocus");
const progressHomeworkPreview = document.querySelector("#progressHomeworkPreview");
const dashboardPage = document.body.dataset.dashboardPage || "overview";

let selectedDiarySlot = null;
let lessonStudentAccess = false;
let currentDashboardUserId = null;
let currentStudentRecordId = null;
let cancellationRequestSlots = new Set();
let availableDiarySlots = [];
let dashboardSkillAreas = [];
let dashboardLessonRatings = [];
let dashboardHomeworkTasks = [];
let dashboardLessonsData = [];
let dashboardLessonRequestsData = [];
let dashboardDiaryRequestsData = [];
let dashboardPaymentBalance = null;

const readinessScoreMap = {
  "Not introduced": 0,
  "Needs work": 35,
  Developing: 70,
  "Test standard": 100,
};

const skillRatingDisplayMap = {
  "Test standard": "Independant",
};

const dashboardIntroCopy = {
  overview: {
    signedOut: "Sign in to view your next lesson, current balance, and progress summary.",
    signedIn: "A simple overview of your next lesson, balance, and driving progress.",
  },
  lessons: {
    signedOut: "Sign in to request lesson times, check bookings, and review completed lessons.",
    signedIn: "Manage your lesson diary, upcoming bookings, and lesson history from one place.",
  },
  progress: {
    signedOut: "Sign in to see your strengths, weak areas, homework, and readiness.",
    signedIn: "Track your practical driving progress, homework, and readiness across every lesson.",
  },
};

function formatSkillRatingLabel(rating) {
  return skillRatingDisplayMap[rating] || rating;
}

function getDashboardIntro(state) {
  return dashboardIntroCopy[dashboardPage]?.[state] || dashboardIntroCopy.overview[state];
}

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
    const [datePart, timePart = "Pending confirmation"] = slot.label.split(", ");
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
    starts_at: lesson.starts_at,
    lesson_date: lesson.lesson_date,
    created_at: lesson.created_at,
    date: dateValue,
    label: formatLessonDate(dateValue),
    hours: Number.isFinite(hours) ? hours : 2,
    topic: lesson.topic || lesson.focus || lesson.lesson_type || "Driving lesson",
    focus: lesson.focus || "",
    lesson_type: lesson.lesson_type || "",
    notes: lesson.summary || lesson.notes || "",
    summary: lesson.summary || "",
    progress_notes: lesson.progress_notes || "",
    progress_summary: lesson.progress_summary || "",
    covered_topics: Array.isArray(lesson.covered_topics) ? lesson.covered_topics : [],
    readiness_percentage: lesson.readiness_percentage || 0,
    status: lesson.status || (isCompleted ? "Completed" : "Confirmed"),
    isCompleted,
    isCancelled,
    hasCancellationRequest,
  };
}

function getLessonSkillSnapshots(lessonId) {
  const ratingsBySkillArea = new Map(
    (dashboardLessonRatings || [])
      .filter((rating) => rating.lesson_id === lessonId)
      .map((rating) => [rating.skill_area_id, rating]),
  );

  return (dashboardSkillAreas || []).map((skillArea) => ({
    skillArea,
    rating: ratingsBySkillArea.get(skillArea.id)?.rating || "Not introduced",
  }));
}

function getLessonHomeworkTasks(lessonId) {
  return (dashboardHomeworkTasks || [])
    .filter((task) => task.lesson_id === lessonId)
    .sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0));
}

function openStudentLessonOverview(lesson) {
  if (!studentLessonOverviewDialog || !lesson) return;

  const snapshots = getLessonSkillSnapshots(lesson.id);
  const homework = getLessonHomeworkTasks(lesson.id);
  const topics = Array.isArray(lesson.covered_topics) ? lesson.covered_topics : [];

  if (studentLessonOverviewTitle) {
    studentLessonOverviewTitle.textContent = lesson.topic || lesson.focus || lesson.lesson_type || "Driving lesson";
  }

  if (studentLessonOverviewMeta) {
    studentLessonOverviewMeta.textContent = [
      formatLessonDate(lesson.starts_at || lesson.lesson_date || lesson.created_at),
      `${Number(lesson.hours || lesson.duration_hours || 2)} hour${Number(lesson.hours || lesson.duration_hours || 2) === 1 ? "" : "s"}`,
      lesson.status || "Delivered",
    ].join(" · ");
  }

  if (studentLessonOverviewReadiness) {
    studentLessonOverviewReadiness.textContent = `${lesson.readiness_percentage || 0}%`;
  }

  if (studentLessonOverviewFocus) {
    studentLessonOverviewFocus.textContent = lesson.topic || lesson.focus || lesson.lesson_type || "Driving lesson";
  }

  if (studentLessonOverviewSummary) {
    studentLessonOverviewSummary.textContent = lesson.progress_summary || "Your instructor has not added a lesson summary yet.";
  }

  if (studentLessonOverviewNotes) {
    studentLessonOverviewNotes.textContent = lesson.progress_notes || lesson.summary || lesson.notes || "No lesson notes were saved for this lesson.";
  }

  if (studentLessonOverviewTopics) {
    studentLessonOverviewTopics.innerHTML = "";
    if (!topics.length) {
      const empty = document.createElement("p");
      empty.className = "admin-empty-state";
      empty.textContent = "No topics were saved for this lesson.";
      studentLessonOverviewTopics.append(empty);
    } else {
      topics.forEach((topic) => {
        const chip = document.createElement("span");
        chip.className = "topic-chip is-selected";
        chip.innerHTML = `<span>${topic}</span>`;
        studentLessonOverviewTopics.append(chip);
      });
    }
  }

  if (studentLessonOverviewHomework) {
    studentLessonOverviewHomework.innerHTML = "";
    if (!homework.length) {
      const empty = document.createElement("p");
      empty.className = "admin-empty-state";
      empty.textContent = "No homework was set for this lesson.";
      studentLessonOverviewHomework.append(empty);
    } else {
      homework.forEach((task) => {
        const item = document.createElement("article");
        item.className = "admin-overview-list-item";
        item.innerHTML = `<strong>${task.task_text}</strong><span>${task.status || "Assigned"}</span>`;
        studentLessonOverviewHomework.append(item);
      });
    }
  }

  if (studentLessonOverviewRatings) {
    studentLessonOverviewRatings.innerHTML = "";
    snapshots.forEach((entry) => {
      const item = document.createElement("article");
      item.className = "admin-overview-rating-item";
      item.innerHTML = `
        <header>
          <strong>${entry.skillArea.name}</strong>
          <span class="admin-overview-rating-meta">${entry.skillArea.category}</span>
        </header>
        <p>${formatSkillRatingLabel(entry.rating)}</p>
      `;
      studentLessonOverviewRatings.append(item);
    });
  }

  studentLessonOverviewDialog.showModal();
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

    if (options.allowOverview) {
      const actions = document.createElement("div");
      actions.className = "lesson-record-actions";
      const overviewButton = document.createElement("button");
      overviewButton.className = "secondary-button";
      overviewButton.type = "button";
      overviewButton.textContent = "View lesson recap";
      overviewButton.addEventListener("click", () => openStudentLessonOverview(lesson));
      actions.append(overviewButton);
      item.append(actions);
    }

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
  const activeRequests = requests.filter((request) => !isClosedDiaryRequestStatus(request.status));
  dashboardDiaryRequestsData = activeRequests;
  if (!diaryRequestList) {
    renderOverviewNextStep();
    return;
  }

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

  renderOverviewNextStep();
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
  if (completedLessonMeta) {
    completedLessonMeta.textContent = `Across ${completed.length} lesson${completed.length === 1 ? "" : "s"}`;
  }

  upcomingLessonsEmpty?.toggleAttribute("hidden", upcoming.length > 0);
  lessonHistoryEmpty?.toggleAttribute("hidden", completed.length > 0);

  renderLessonRecordList(upcomingLessonsList, upcoming, { allowCancellation: true });
  renderLessonRecordList(lessonHistoryList, completed, { allowOverview: true });
}

function clearList(element, emptyMessage = "") {
  if (!element) return;
  element.innerHTML = "";
  if (emptyMessage) {
    const item = document.createElement("li");
    item.textContent = emptyMessage;
    element.append(item);
  }
}

function getLatestSkillSnapshots() {
  const lessonsById = new Map((window.dashboardLessons || []).map((lesson) => [lesson.id, lesson]));
  const latest = new Map();

  (dashboardLessonRatings || []).forEach((rating) => {
    const lesson = lessonsById.get(rating.lesson_id);
    const lessonTime = new Date(lesson?.starts_at || lesson?.lesson_date || lesson?.created_at || 0).getTime();
    const previous = latest.get(rating.skill_area_id);
    const previousLesson = previous ? lessonsById.get(previous.lesson_id) : null;
    const previousTime = new Date(previousLesson?.starts_at || previousLesson?.lesson_date || previousLesson?.created_at || 0).getTime();

    if (!previous || lessonTime >= previousTime) {
      latest.set(rating.skill_area_id, rating);
    }
  });

  return (dashboardSkillAreas || []).map((skillArea) => ({
    skillArea,
    rating: latest.get(skillArea.id)?.rating || "Not introduced",
  }));
}

function calculateReadiness(snapshots = []) {
  if (!snapshots.length) return 0;
  return Math.round(
    snapshots.reduce((sum, snapshot) => sum + (readinessScoreMap[snapshot.rating] || 0), 0) /
    snapshots.length,
  );
}

function renderSimpleInsightList(element, values, fallback) {
  if (!element) return;
  element.innerHTML = "";

  if (!values.length) {
    const item = document.createElement("li");
    item.textContent = fallback;
    element.append(item);
    return;
  }

  values.forEach((value) => {
    const item = document.createElement("li");
    item.textContent = value;
    element.append(item);
  });
}

function renderSkillProgress(snapshots = []) {
  if (!skillProgressList) return;
  skillProgressList.innerHTML = "";

  snapshots.forEach((snapshot) => {
    const score = readinessScoreMap[snapshot.rating] || 0;
    const row = document.createElement("article");
    row.className = "skill-progress-row";
    row.innerHTML = `
      <div>
        <strong>${snapshot.skillArea.name}</strong>
        <span>${formatSkillRatingLabel(snapshot.rating)}</span>
      </div>
      <div class="skill-progress-bar">
        <span style="width: ${score}%"></span>
      </div>
    `;
    skillProgressList.append(row);
  });
}

function renderHomeworkTasks(tasks = []) {
  if (!studentHomeworkList) return;
  studentHomeworkList.innerHTML = "";
  studentHomeworkEmpty?.toggleAttribute("hidden", tasks.length > 0);

  tasks.forEach((task) => {
    const item = document.createElement("li");
    item.innerHTML = `<strong>${task.task_text}</strong><span>${task.status || "Assigned"}</span>`;
    studentHomeworkList.append(item);
  });
}

function getDashboardUpcomingLessons() {
  return dashboardLessonsData
    .map(normaliseLessonRecord)
    .filter((lesson) => !lesson.isCompleted && !lesson.isCancelled)
    .sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0));
}

function getDashboardCompletedLessons() {
  return dashboardLessonsData
    .map(normaliseLessonRecord)
    .filter((lesson) => lesson.isCompleted)
    .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
}

function getActiveHomeworkTasks() {
  return [...dashboardHomeworkTasks]
    .filter((task) => task.status === "Assigned")
    .sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0));
}

function renderOverviewNextStep() {
  if (!dashboardNextStepTitle || !dashboardNextStepBody || !dashboardNextStepButton) return;

  const upcoming = getDashboardUpcomingLessons();
  const pendingDiaryRequest = dashboardDiaryRequestsData[0];

  if (!lessonStudentAccess) {
    if (dashboardNextStepKicker) dashboardNextStepKicker.textContent = "Lesson access";
    dashboardNextStepTitle.textContent = dashboardLessonRequestsData.length
      ? "Practical lesson request under review"
      : "Request practical lessons";
    dashboardNextStepBody.textContent = dashboardLessonRequestsData.length
      ? "Your practical lesson request is still being reviewed. Once approved, your diary and confirmed lesson dates will appear here."
      : "Start by sending your practical lesson request so your lesson diary, progress summary, and booking tools can be unlocked.";
    dashboardNextStepButton.textContent = dashboardLessonRequestsData.length ? "Open lessons" : "Request driving lessons";
    dashboardNextStepButton.href = dashboardLessonRequestsData.length ? "dashboard-lessons.html" : "index.html#book";
    return;
  }

  if (upcoming.length) {
    const nextLesson = upcoming[0];
    if (dashboardNextStepKicker) dashboardNextStepKicker.textContent = "Next lesson";
    dashboardNextStepTitle.textContent = nextLesson.topic || "Driving lesson";
    dashboardNextStepBody.textContent = `Your next confirmed lesson is ${nextLesson.label} for ${nextLesson.hours} hour${nextLesson.hours === 1 ? "" : "s"}. Open lessons for bookings, changes, and recap history.`;
    dashboardNextStepButton.textContent = "Open lessons";
    dashboardNextStepButton.href = "dashboard-lessons.html";
    return;
  }

  if (pendingDiaryRequest) {
    if (dashboardNextStepKicker) dashboardNextStepKicker.textContent = "Pending booking";
    dashboardNextStepTitle.textContent = pendingDiaryRequest.requested_label || "Lesson time requested";
    dashboardNextStepBody.textContent = "That lesson time is waiting for instructor confirmation. Once confirmed, it will move into your upcoming lessons.";
    dashboardNextStepButton.textContent = "View lesson requests";
    dashboardNextStepButton.href = "dashboard-lessons.html#diaryRequestsTitle";
    return;
  }

  if (dashboardNextStepKicker) dashboardNextStepKicker.textContent = "Book next";
  dashboardNextStepTitle.textContent = "No lesson booked yet";
  dashboardNextStepBody.textContent = "You have lesson access, but no confirmed lesson is showing yet. Open lessons to request your next time.";
  dashboardNextStepButton.textContent = "Open lessons";
  dashboardNextStepButton.href = "dashboard-lessons.html";
}

function renderLessonsSpotlight() {
  if (!lessonsSpotlightTitle || !lessonsSpotlightBody || !lessonsSpotlightStatus || !lessonsSpotlightButton) return;

  const upcoming = getDashboardUpcomingLessons();

  if (upcoming.length) {
    const nextLesson = upcoming[0];
    if (lessonsSpotlightKicker) lessonsSpotlightKicker.textContent = "Next lesson";
    lessonsSpotlightTitle.textContent = nextLesson.topic || "Driving lesson";
    lessonsSpotlightBody.textContent = `${nextLesson.label} for ${nextLesson.hours} hour${nextLesson.hours === 1 ? "" : "s"}. If you need to change it, use the actions below in your upcoming lessons list.`;
    lessonsSpotlightStatus.textContent = "Confirmed";
    lessonsSpotlightStatus.className = "status-pill is-success";
    lessonsSpotlightButton.textContent = "Jump to upcoming lessons";
    lessonsSpotlightButton.href = "#upcomingLessonsTitle";
    return;
  }

  if (dashboardLessonRequestsData.length) {
    if (lessonsSpotlightKicker) lessonsSpotlightKicker.textContent = "Waiting";
    lessonsSpotlightTitle.textContent = "A request is waiting for confirmation";
    lessonsSpotlightBody.textContent = "Your requested lesson times stay here until they are confirmed and moved into your upcoming lessons.";
    lessonsSpotlightStatus.textContent = "Pending";
    lessonsSpotlightStatus.className = "status-pill is-warning";
    lessonsSpotlightButton.textContent = "Jump to requests";
    lessonsSpotlightButton.href = "#diaryRequestsTitle";
    return;
  }

  if (lessonsSpotlightKicker) lessonsSpotlightKicker.textContent = "Book next";
  lessonsSpotlightTitle.textContent = "Choose a lesson time";
  lessonsSpotlightBody.textContent = "Open the diary below and request a time that works for you. I will confirm it before it becomes fully booked.";
  lessonsSpotlightStatus.textContent = "Ready";
  lessonsSpotlightStatus.className = "status-pill";
  lessonsSpotlightButton.textContent = "Jump to diary";
  lessonsSpotlightButton.href = "#diarySlotList";
}

function renderProgressSpotlight() {
  if (!progressCurrentFocus || !progressHomeworkPreview) return;

  const snapshots = getLatestSkillSnapshots();
  const weakAreas = snapshots
    .filter((snapshot) => snapshot.rating === "Needs work" || snapshot.rating === "Not introduced")
    .slice(0, 3)
    .map((snapshot) => snapshot.skillArea.name);
  const homework = getActiveHomeworkTasks().slice(0, 3);

  progressCurrentFocus.textContent = weakAreas.length
    ? `Focus next on ${weakAreas.join(", ")}.`
    : "No weak areas have been highlighted yet. Your instructor will add focus areas after more lesson ratings are saved.";

  progressHomeworkPreview.textContent = homework.length
    ? homework.map((task) => task.task_text).join(" ")
    : "No homework has been set for your next lesson yet.";
}

function renderStudentProgressIntelligence(lessons = []) {
  window.dashboardLessons = lessons;
  dashboardLessonsData = lessons;
  const snapshots = getLatestSkillSnapshots();
  const readiness = calculateReadiness(snapshots);
  const strengths = snapshots
    .filter((snapshot) => snapshot.rating === "Test standard" || snapshot.rating === "Developing")
    .slice(0, 4)
    .map((snapshot) => `${snapshot.skillArea.name} (${formatSkillRatingLabel(snapshot.rating)})`);
  const weakAreas = snapshots
    .filter((snapshot) => snapshot.rating === "Needs work" || snapshot.rating === "Not introduced")
    .slice(0, 4)
    .map((snapshot) => `${snapshot.skillArea.name} (${formatSkillRatingLabel(snapshot.rating)})`);
  const latestLesson = [...lessons]
    .filter((lesson) => normaliseLessonRecord(lesson).isCompleted)
    .sort((a, b) => new Date(b.starts_at || b.lesson_date || b.created_at || 0) - new Date(a.starts_at || a.lesson_date || a.created_at || 0))[0];
  const activeHomework = getActiveHomeworkTasks();

  if (testReadinessValue) {
    testReadinessValue.textContent = `${readiness}%`;
  }

  if (studentProgressSummary) {
    studentProgressSummary.textContent = latestLesson?.progress_summary
      || [
        strengths.length ? `Strong areas: ${strengths.map((item) => item.replace(/\s\(.+\)$/, "")).join(", ")}.` : "Strengths will appear after your instructor adds lesson ratings.",
        weakAreas.length ? `Current focus: ${weakAreas.map((item) => item.replace(/\s\(.+\)$/, "")).join(", ")}.` : "No weak areas have been highlighted yet.",
        activeHomework.length ? `Homework: ${activeHomework.map((task) => task.task_text).join("; ")}.` : "No homework has been set for your next lesson yet.",
      ].join(" ");
  }

  renderSimpleInsightList(studentStrengthsList, strengths, "Strengths will appear once your instructor has added some lesson ratings.");
  renderSimpleInsightList(studentWeakAreasList, weakAreas, "No weak areas highlighted yet.");
  renderHomeworkTasks(activeHomework);
  renderSkillProgress(snapshots);
  renderOverviewNextStep();
  renderLessonsSpotlight();
  renderProgressSpotlight();
}

function updatePaymentBalance(balance) {
  dashboardPaymentBalance = balance;
  const purchased = Number(balance?.purchased_hours || 0);
  const used = Number(balance?.used_hours || 0);
  const remaining = Math.max(purchased - used, 0);

  if (dashboardRemainingHours) dashboardRemainingHours.textContent = formatPaymentHours(remaining);
  if (dashboardPurchasedHours) dashboardPurchasedHours.textContent = formatPaymentHours(purchased);
  if (dashboardPurchasedMeta) {
    dashboardPurchasedMeta.textContent = balance
      ? `${formatPaymentHours(purchased)} purchased · ${formatPaymentHours(used)} used`
      : "No paid lesson hours recorded yet";
  }
  if (dashboardAccountBalance) dashboardAccountBalance.textContent = formatPoundsFromPence(balance?.account_balance_pence || 0);

  if (dashboardPaymentMessage) {
    dashboardPaymentMessage.textContent = balance
      ? "Your latest prepaid lesson balance is shown below. Open payments to top up or review activity."
      : "No payment balance has been added yet. Open payments to pay for single lessons or a 10 hour package.";
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
    renderStudentProgressIntelligence([]);
  }

  renderOverviewNextStep();
  renderLessonsSpotlight();
  renderProgressSpotlight();
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
    dashboardIntro.textContent = getDashboardIntro("signedOut");
  }
  setDashboardStatus(message || "", message ? "info" : "info");
  renderOverviewNextStep();
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
    dashboardIntro.textContent = getDashboardIntro("signedIn");
  }

  setDashboardStatus("");
}

function renderLessonRequests(requests) {
  dashboardLessonRequestsData = requests || [];
  if (!lessonRequestList) {
    renderOverviewNextStep();
    renderLessonsSpotlight();
    return;
  }
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
  renderOverviewNextStep();
  renderLessonsSpotlight();
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

async function loadLessonProgress(userId, studentRecordId = null) {
  updateLessonProgress([]);
  renderStudentProgressIntelligence([]);

  if (!dashboardClient) return;

  const orFilters = [`student_id.eq.${userId}`];
  if (studentRecordId) {
    orFilters.push(`student_record_id.eq.${studentRecordId}`);
  }

  const { data, error } = await dashboardClient
    .from("lessons")
    .select("id,status,availability_slot_id,starts_at,lesson_date,hours,duration_hours,topic,focus,lesson_type,notes,summary,progress_notes,progress_summary,covered_topics,readiness_percentage,created_at")
    .or(orFilters.join(","))
    .order("starts_at", { ascending: true });

  if (error || !data) {
    return;
  }

  updateLessonProgress(data);
  renderStudentProgressIntelligence(data);
}

async function loadStudentRecord(userId) {
  currentStudentRecordId = null;
  dashboardLessonRatings = [];
  dashboardHomeworkTasks = [];

  if (!dashboardClient) return null;

  const { data, error } = await dashboardClient
    .from("students")
    .select("id,auth_user_id,email,full_name,lesson_access_status")
    .eq("auth_user_id", userId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  currentStudentRecordId = data.id;
  return data;
}

async function loadSkillAreas() {
  dashboardSkillAreas = [];

  if (!dashboardClient) return;

  const { data, error } = await dashboardClient
    .from("skill_areas")
    .select("id,slug,category,name,display_order")
    .order("display_order", { ascending: true });

  if (error || !data) return;
  dashboardSkillAreas = data;
}

async function loadProgressBreakdown(studentRecordId) {
  dashboardLessonRatings = [];
  dashboardHomeworkTasks = [];

  if (!dashboardClient || !studentRecordId) {
    renderStudentProgressIntelligence(window.dashboardLessons || []);
    return;
  }

  const [{ data: ratings, error: ratingsError }, { data: homework, error: homeworkError }] = await Promise.all([
    dashboardClient
      .from("lesson_skill_ratings")
      .select("id,lesson_id,student_id,skill_area_id,rating,created_at,updated_at")
      .eq("student_id", studentRecordId),
    dashboardClient
      .from("homework_tasks")
      .select("id,lesson_id,student_id,task_text,status,sort_order,created_at,updated_at")
      .eq("student_id", studentRecordId)
      .order("created_at", { ascending: false }),
  ]);

  if (!ratingsError && ratings) {
    dashboardLessonRatings = ratings;
  }

  if (!homeworkError && homework) {
    dashboardHomeworkTasks = homework;
  }

  renderStudentProgressIntelligence(window.dashboardLessons || []);
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
      dashboardPaymentMessage.textContent = "Payment tracking is ready here, but the payment balance table still needs to be connected.";
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
  await loadSkillAreas();
  const studentRecord = await loadStudentRecord(data.session.user.id);
  await loadLessonStudentAccess(data.session.user.id);
  await loadLessonRequests(data.session.user.id);
  await loadDiaryRequests(data.session.user.id);
  await loadLessonProgress(data.session.user.id, studentRecord?.id || null);
  await loadProgressBreakdown(studentRecord?.id || null);
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

closeStudentLessonOverviewDialog?.addEventListener("click", () => {
  studentLessonOverviewDialog?.close();
});

studentLessonOverviewDialog?.addEventListener("click", (event) => {
  if (event.target === studentLessonOverviewDialog) {
    studentLessonOverviewDialog.close();
  }
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
