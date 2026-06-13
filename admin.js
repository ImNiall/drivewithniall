const adminConfig = window.driveAuthConfig || {};
const adminEmails = (adminConfig.adminEmails || []).map((email) => email.toLowerCase());
const adminName = adminConfig.adminName || "Admin";
const adminUsername = adminConfig.adminUsername || adminName;
const adminUsernameEmail = String(adminConfig.adminUsernameEmail || adminEmails[0] || "").toLowerCase();
const adminStatus = document.querySelector("#adminStatus");
const adminLoginForm = document.querySelector("#adminLoginForm");
const adminMagicLinkButton = document.querySelector("#adminMagicLinkButton");
const adminSignedOut = document.querySelector("#adminSignedOut");
const adminPanel = document.querySelector("#adminPanel");
const adminLoginCard = document.querySelector(".admin-login-card");
const adminEmail = document.querySelector("#adminEmail");
const adminBrandName = document.querySelector("#adminBrandName");
const adminDashboardTitle = document.querySelector("#adminDashboardTitle");
const adminSignOutButton = document.querySelector("#adminSignOutButton");
const adminRefreshButton = document.querySelector("#adminRefreshButton");
const adminSearchInput = document.querySelector("#adminSearchInput");
const adminFocusFilter = document.querySelector("#adminFocusFilter");
const adminPaymentFilter = document.querySelector("#adminPaymentFilter");
const adminDataStatus = document.querySelector("#adminDataStatus");
const pendingLessonRequests = document.querySelector("#pendingLessonRequests");
const slotRequestList = document.querySelector("#slotRequestList");
const approvedStudentList = document.querySelector("#approvedStudentList");
const paymentTrackerList = document.querySelector("#paymentTrackerList");
const confirmedLessonList = document.querySelector("#confirmedLessonList");
const deliveredLessonList = document.querySelector("#deliveredLessonList");
const closedLessonList = document.querySelector("#closedLessonList");
const supportRequestList = document.querySelector("#supportRequestList");
const pendingRequestCount = document.querySelector("#pendingRequestCount");
const approvedStudentCount = document.querySelector("#approvedStudentCount");
const slotRequestCount = document.querySelector("#slotRequestCount");
const confirmedLessonCount = document.querySelector("#confirmedLessonCount");
const supportRequestCount = document.querySelector("#supportRequestCount");
const lowCreditCount = document.querySelector("#lowCreditCount");
const unpaidLessonCount = document.querySelector("#unpaidLessonCount");
const deliveredThisMonthCount = document.querySelector("#deliveredThisMonthCount");
const paidThisMonthValue = document.querySelector("#paidThisMonthValue");
const studentManageDialog = document.querySelector("#studentManageDialog");
const studentManageForm = document.querySelector("#studentManageForm");
const closeStudentDialog = document.querySelector("#closeStudentDialog");
const addStudentButton = document.querySelector("#addStudentButton");
const studentDialogTitle = document.querySelector("#studentDialogTitle");
const studentEditName = document.querySelector("#studentEditName");
const studentEditEmail = document.querySelector("#studentEditEmail");
const studentEditPhone = document.querySelector("#studentEditPhone");
const studentEditPostcode = document.querySelector("#studentEditPostcode");
const studentEditLicenceStage = document.querySelector("#studentEditLicenceStage");
const studentEditNotes = document.querySelector("#studentEditNotes");
const studentEditStatus = document.querySelector("#studentEditStatus");
const createLessonRecordButton = document.querySelector("#createLessonRecordButton");
const lessonRecordSelect = document.querySelector("#lessonRecordSelect");
const lessonRecordDate = document.querySelector("#lessonRecordDate");
const lessonRecordHours = document.querySelector("#lessonRecordHours");
const lessonRecordStatus = document.querySelector("#lessonRecordStatus");
const lessonRecordTopic = document.querySelector("#lessonRecordTopic");
const coveredTopicsGrid = document.querySelector("#coveredTopicsGrid");
const lessonRecordNotes = document.querySelector("#lessonRecordNotes");
const lessonRecordHomework = document.querySelector("#lessonRecordHomework");
const skillRatingsGrid = document.querySelector("#skillRatingsGrid");
const lessonReadinessValue = document.querySelector("#lessonReadinessValue");
const lessonSummaryPreview = document.querySelector("#lessonSummaryPreview");
const saveLessonRecordButton = document.querySelector("#saveLessonRecordButton");
const studentPaymentSummary = document.querySelector("#studentPaymentSummary");
const studentPaymentAction = document.querySelector("#studentPaymentAction");
const studentPaymentHours = document.querySelector("#studentPaymentHours");
const studentPaymentAmount = document.querySelector("#studentPaymentAmount");
const studentPaymentNote = document.querySelector("#studentPaymentNote");
const applyStudentPaymentButton = document.querySelector("#applyStudentPaymentButton");
const studentHistoryList = document.querySelector("#studentHistoryList");
const removeStudentButton = document.querySelector("#removeStudentButton");
const availabilityForm = document.querySelector("#availabilityForm");
const availabilityDate = document.querySelector("#availabilityDate");
const availabilityTime = document.querySelector("#availabilityTime");
const availabilityHours = document.querySelector("#availabilityHours");
const availabilityNotes = document.querySelector("#availabilityNotes");
const weeklyAvailabilityForm = document.querySelector("#weeklyAvailabilityForm");
const availabilityWeekStart = document.querySelector("#availabilityWeekStart");
const availabilityBlockStart = document.querySelector("#availabilityBlockStart");
const availabilityBlockEnd = document.querySelector("#availabilityBlockEnd");
const availabilityBlockHours = document.querySelector("#availabilityBlockHours");
const availabilityBlockGap = document.querySelector("#availabilityBlockGap");
const availabilityBlockNotes = document.querySelector("#availabilityBlockNotes");
const assignSlotForm = document.querySelector("#assignSlotForm");
const assignSlotSelect = document.querySelector("#assignSlotSelect");
const assignStudentSelect = document.querySelector("#assignStudentSelect");
const availabilitySlotList = document.querySelector("#availabilitySlotList");
const availableSlotCount = document.querySelector("#availableSlotCount");
const bookedSlotCount = document.querySelector("#bookedSlotCount");
const hiddenSlotCount = document.querySelector("#hiddenSlotCount");
const diaryWeekTitle = document.querySelector("#diaryWeekTitle");
const diaryWeekGrid = document.querySelector("#diaryWeekGrid");
const previousDiaryWeek = document.querySelector("#previousDiaryWeek");
const todayDiaryWeek = document.querySelector("#todayDiaryWeek");
const nextDiaryWeek = document.querySelector("#nextDiaryWeek");

let adminData = {
  lessonRequests: [],
  studentProfiles: [],
  studentRecords: [],
  profileRecords: [],
  slotRequests: [],
  supportRequests: [],
  lessons: [],
  lessonSkillRatings: [],
  homeworkTasks: [],
  skillAreas: [],
  availabilitySlots: [],
  paymentBalances: [],
  paymentEvents: [],
};
let activeStudent = null;
let activeLessonRecordId = null;
let currentDiaryWeekStart = getStartOfWeek(new Date());
let adminFilters = {
  search: "",
  focus: "all",
  payment: "all",
};
let isCreatingAvailabilitySlot = false;
let isPublishingWeeklyAvailability = false;
let isAssigningStudentSlot = false;
let isSavingLessonRecord = false;

const lessonTopicOptions = [
  "Cockpit drill",
  "Moving away and stopping",
  "Clutch control",
  "Use of mirrors",
  "Signalling",
  "Junctions",
  "Roundabouts",
  "Meeting traffic",
  "Pedestrian crossings",
  "Manoeuvres",
  "Reversing",
  "Hill starts",
  "Dual carriageways",
  "Independent driving",
  "Mock test practice",
];

const skillRatingOptions = [
  "Not introduced",
  "Needs work",
  "Developing",
  "Test standard",
];

const readinessScoreMap = {
  "Not introduced": 0,
  "Needs work": 35,
  Developing: 70,
  "Test standard": 100,
};

const eligibleLessonStatuses = ["confirmed", "delivered", "completed", "attended"];

const hasAdminConfig =
  adminConfig.supabaseUrl &&
  adminConfig.supabaseAnonKey &&
  !adminConfig.supabaseUrl.includes("PASTE_") &&
  !adminConfig.supabaseAnonKey.includes("PASTE_");

const adminClient = hasAdminConfig && window.supabase
  ? window.supabase.createClient(adminConfig.supabaseUrl, adminConfig.supabaseAnonKey)
  : null;

function getAdminRedirectUrl() {
  const configuredUrl = adminConfig.siteUrl || "https://drivewithniall.co.uk/";
  return new URL("admin.html", configuredUrl).toString();
}

if (adminBrandName) {
  adminBrandName.textContent = adminName;
}

if (adminDashboardTitle) {
  adminDashboardTitle.textContent = adminName;
}

function setAdminStatus(message, type = "info") {
  if (!adminStatus) return;
  adminStatus.textContent = message;
  adminStatus.dataset.type = type;
  adminStatus.hidden = !message;
}

function setAdminDataStatus(message, type = "info") {
  if (!adminDataStatus) return;
  adminDataStatus.textContent = message;
  adminDataStatus.dataset.type = type;
  adminDataStatus.hidden = !message;
}

function setCount(element, value) {
  if (element) element.textContent = String(value || 0);
}

function getLessonStatusValue(status) {
  return String(status || "").toLowerCase();
}

function isCompletedLessonStatus(status) {
  const value = getLessonStatusValue(status);
  return value.includes("complete") || value.includes("done") || value.includes("attended") || value.includes("deliver");
}

function isCancelledLessonStatus(status) {
  return getLessonStatusValue(status).includes("cancel");
}

function isNoShowLessonStatus(status) {
  const value = getLessonStatusValue(status);
  return value.includes("no-show") || value.includes("no show");
}

function getLessonRemainingHours(balance) {
  const purchasedHours = Number(balance?.purchased_hours || 0);
  const usedHours = Number(balance?.used_hours || 0);
  return Math.max(purchasedHours - usedHours, 0);
}

function getAdminError(error) {
  const message = error?.message || String(error || "");
  const normalisedMessage = message.toLowerCase();

  if (normalisedMessage.includes("invalid login credentials")) {
    return "Those admin login details do not match an account.";
  }

  if (normalisedMessage.includes("email not confirmed")) {
    return "This account needs to verify its email before admin login can work.";
  }

  return message;
}

function isAdminSession(session) {
  const userEmail = session?.user?.email || "";
  return adminEmails.includes(userEmail.toLowerCase());
}

function clearElement(element) {
  if (element) element.innerHTML = "";
}

function createEmptyState(message) {
  const empty = document.createElement("p");
  empty.className = "admin-empty-state";
  empty.textContent = message;
  return empty;
}

function setFormSubmitButtonState(form, isBusy, busyLabel, idleLabel) {
  const button = form?.querySelector('button[type="submit"]');
  if (!button) return;

  if (!button.dataset.idleLabel) {
    button.dataset.idleLabel = idleLabel || button.textContent.trim();
  }

  button.disabled = Boolean(isBusy);
  button.textContent = isBusy ? busyLabel : (idleLabel || button.dataset.idleLabel);
}

function formatAdminDate(value) {
  if (!value) return "Date not set";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getStartOfWeek(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return new Date();
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function formatDateInput(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getDateKey(value) {
  return formatDateInput(value);
}

function buildLocalDateTime(dateKey, timeValue) {
  return new Date(`${dateKey}T${timeValue}:00`);
}

function addMinutes(value, minutes) {
  const date = new Date(value);
  date.setMinutes(date.getMinutes() + minutes);
  return date;
}

function formatClock(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDiaryRange(slot) {
  const startsAt = new Date(slot?.starts_at || slot?.lesson_date || slot?.created_at);
  if (Number.isNaN(startsAt.getTime())) return "Time not set";
  const hours = Number(slot?.hours || slot?.duration_hours || 2);
  const endsAt = addMinutes(startsAt, hours * 60);
  return `${formatClock(startsAt)}-${formatClock(endsAt)}`;
}

function formatAdminHours(value) {
  const hours = Number(value || 0);
  if (!Number.isFinite(hours)) return "0";
  return Number.isInteger(hours) ? String(hours) : hours.toFixed(1).replace(/\.0$/, "");
}

function formatPoundsFromPence(value) {
  const amount = Number(value || 0) / 100;
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(amount);
}

function parsePoundsToPence(value) {
  const amount = Number.parseFloat(String(value || "").trim());
  if (!Number.isFinite(amount)) return 0;
  return Math.round(amount * 100);
}

function getSlotDateKey(slot) {
  return getDateKey(slot?.starts_at);
}

function getWeekDays(weekStart = currentDiaryWeekStart) {
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + index);
    return date;
  });
}

function isPendingStatus(status) {
  const value = String(status || "submitted").toLowerCase();
  return ![
    "approved",
    "accepted",
    "active",
    "confirmed",
    "rejected",
    "declined",
    "waiting",
    "removed",
    "cancel",
    "complete",
    "deliver",
  ].some((word) => value.includes(word));
}

function isApprovedStatus(status) {
  const value = String(status || "").toLowerCase();
  return ["approved", "accepted", "active", "confirmed"].some((word) => value.includes(word));
}

function isClosedWorkflowStatus(status) {
  const value = String(status || "").toLowerCase();
  return ["removed", "cancel", "complete", "deliver", "declined", "rejected", "no-show", "no show"].some((word) => value.includes(word));
}

function isCancellationRequest(request) {
  const status = String(request?.status || "").toLowerCase();
  const label = String(request?.requested_label || "").toLowerCase();
  return status.includes("cancel") || label.includes("cancel lesson");
}

function sameStudent(record, student) {
  if (!record || !student) return false;
  const studentId = student.student_id;
  const studentRecordId = student.progress_student_id || student.progressStudentId;
  const studentEmail = String(student.email || "").toLowerCase();
  const recordEmail = String(record.email || record.student_email || "").toLowerCase();

  return Boolean(
    (studentRecordId && record.student_record_id === studentRecordId) ||
      (studentRecordId && record.student_id === studentRecordId) ||
      (studentId && record.student_id === studentId) ||
      (studentEmail && recordEmail && recordEmail === studentEmail),
  );
}

function normaliseEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function getStudentMergeKey(student) {
  return normaliseEmail(student?.email) || student?.student_id || student?.id;
}

function getStudentName(student) {
  return student?.name || student?.full_name || student?.email || "Approved student";
}

function findStudentRecord(student, studentRecords = adminData.studentRecords) {
  if (!student) return null;
  const matchEmail = normaliseEmail(student.email || student.student_email);

  return (studentRecords || []).find((record) => Boolean(
    (student.progress_student_id && record.id === student.progress_student_id) ||
      (student.id && !student.student_id && record.id === student.id) ||
      (student.student_id && record.auth_user_id === student.student_id) ||
      (matchEmail && normaliseEmail(record.email) === matchEmail)
  )) || null;
}

function getStudentRecordKey(student) {
  return student?.progress_student_id || student?.student_id || normaliseEmail(student?.email);
}

function getApprovedStudentRecords(students = adminData.studentProfiles, requests = adminData.lessonRequests, studentRecords = adminData.studentRecords) {
  const merged = new Map();
  (studentRecords || []).forEach((record) => {
    const key = getStudentMergeKey({
      id: record.id,
      student_id: record.auth_user_id,
      email: record.email,
    });
    if (!key) return;
    merged.set(key, {
      ...record,
      progress_student_id: record.id,
      student_id: record.auth_user_id,
      name: record.full_name,
      full_name: record.full_name,
      email: record.email,
      lesson_status: record.lesson_access_status || "Approved",
    });
  });

  (students || []).forEach((student) => {
    const key = getStudentMergeKey(student);
    if (!key) return;
    const linkedRecord = findStudentRecord(student, studentRecords);
    merged.set(key, {
      ...merged.get(key),
      ...student,
      progress_student_id: linkedRecord?.id || merged.get(key)?.progress_student_id || null,
      student_id: student.student_id,
      name: student.name || student.full_name,
      full_name: student.full_name || student.name,
      email: student.email,
    });
  });

  (requests || [])
    .filter((request) => isApprovedStatus(request.status))
    .forEach((request) => {
      const requestRecord = {
        student_id: request.student_id,
        email: request.email,
        name: request.name,
        lesson_status: request.status,
      };
      const key = getStudentMergeKey(requestRecord);
      if (!key || merged.has(key)) return;
      merged.set(key, requestRecord);
    });

  return [...merged.values()]
    .filter((student) => isApprovedStatus(student.lesson_status))
    .map((student) => {
      const latestRequest = (requests || []).find((request) => sameStudent(request, student));
      const linkedRecord = findStudentRecord(student, studentRecords);
      return {
        ...latestRequest,
        ...student,
        progress_student_id: linkedRecord?.id || student.progress_student_id || null,
        phone: linkedRecord?.phone || student.phone || "",
        postcode: linkedRecord?.postcode || student.postcode || "",
        licence_stage: linkedRecord?.licence_stage || student.licence_stage || "",
        student_notes: linkedRecord?.notes || student.student_notes || "",
        latest_request_id: latestRequest?.id,
      };
    });
}

function getLessonRatingsForStudent(student) {
  const key = getStudentRecordKey(student);
  if (!key) return [];
  return (adminData.lessonSkillRatings || []).filter((rating) => sameStudent(rating, student));
}

function getHomeworkForStudent(student) {
  const key = getStudentRecordKey(student);
  if (!key) return [];
  return (adminData.homeworkTasks || []).filter((task) => sameStudent(task, student));
}

function getLatestSkillSnapshots(student) {
  const ratings = getLessonRatingsForStudent(student);
  const lessonsById = new Map((adminData.lessons || []).map((lesson) => [lesson.id, lesson]));
  const snapshots = new Map();

  ratings.forEach((rating) => {
    const currentLesson = lessonsById.get(rating.lesson_id);
    const currentDate = new Date(formatLessonDateValue(currentLesson) || currentLesson?.created_at || 0).getTime();
    const previous = snapshots.get(rating.skill_area_id);
    const previousDate = previous
      ? new Date(formatLessonDateValue(lessonsById.get(previous.lesson_id)) || lessonsById.get(previous.lesson_id)?.created_at || 0).getTime()
      : -Infinity;

    if (!previous || currentDate >= previousDate) {
      snapshots.set(rating.skill_area_id, rating);
    }
  });

  return (adminData.skillAreas || []).map((skillArea) => {
    const rating = snapshots.get(skillArea.id);
    return {
      skillArea,
      rating: rating?.rating || "Not introduced",
    };
  });
}

function calculateReadinessFromSnapshots(snapshots = []) {
  if (!snapshots.length) return 0;
  const total = snapshots.reduce((sum, snapshot) => sum + (readinessScoreMap[snapshot.rating] || 0), 0);
  return Math.round(total / snapshots.length);
}

function buildStudentProgressSummary(student) {
  const snapshots = getLatestSkillSnapshots(student);
  const readiness = calculateReadinessFromSnapshots(snapshots);
  const strengths = snapshots.filter((snapshot) => snapshot.rating === "Test standard" || snapshot.rating === "Developing");
  const weakAreas = snapshots.filter((snapshot) => snapshot.rating === "Needs work" || snapshot.rating === "Not introduced");
  const latestLesson = getStudentCompletedLessons(student)
    .sort((a, b) => new Date(formatLessonDateValue(b) || 0) - new Date(formatLessonDateValue(a) || 0))[0];
  const latestHomework = getHomeworkForStudent(student)
    .filter((task) => task.status === "Assigned")
    .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
    .slice(0, 3);

  const summary = [
    strengths.length
      ? `Strongest areas: ${strengths.slice(0, 3).map((item) => item.skillArea.name).join(", ")}.`
      : "Strengths will appear after lesson ratings are added.",
    weakAreas.length
      ? `Main development areas: ${weakAreas.slice(0, 3).map((item) => item.skillArea.name).join(", ")}.`
      : "No weak areas flagged yet.",
    latestHomework.length
      ? `Homework focus: ${latestHomework.map((task) => task.task_text).join("; ")}.`
      : "No homework set for the next lesson yet.",
    latestLesson?.covered_topics?.length
      ? `Most recent lesson covered: ${latestLesson.covered_topics.join(", ")}.`
      : "",
  ].filter(Boolean).join(" ");

  return {
    readiness,
    strengths,
    weakAreas,
    summary,
  };
}

function findStudentForLesson(lesson, students = [], requests = []) {
  return [...students, ...requests].find((student) => sameStudent(lesson, student));
}

function findPaymentBalanceForStudent(student, balances = adminData.paymentBalances) {
  if (!student) return null;
  const studentId = student.student_id;
  const studentEmail = normaliseEmail(student.email);

  return (balances || []).find((balance) => {
    const balanceEmail = normaliseEmail(balance.student_email);
    return Boolean(
      (studentId && balance.student_id === studentId) ||
        (studentEmail && balanceEmail && balanceEmail === studentEmail),
    );
  }) || null;
}

function getPaymentEventsForStudent(student, events = adminData.paymentEvents) {
  return (events || [])
    .filter((event) => sameStudent(event, student))
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

function formatPaymentEventTitle(event) {
  const eventType = String(event?.event_type || "payment");
  const customTitles = {
    manual_payment_received: "Manual payment recorded",
    manual_credit_added: "Manual credit added",
    manual_credit_deducted: "Manual credit deducted",
    payment_reversed: "Payment reversed",
    checkout_session_completed: "Stripe payment confirmed",
    checkout_session_created: "Stripe checkout started",
    checkout_session_expired: "Stripe checkout expired",
    lesson_credit_used: "Lesson credit used",
    lesson_credit_refunded: "Lesson credit refunded",
  };

  if (customTitles[eventType]) return customTitles[eventType];

  const type = eventType.replaceAll("_", " ");
  return type.charAt(0).toUpperCase() + type.slice(1);
}

function formatLessonStatusLabel(status) {
  const value = String(status || "").trim();
  const normalised = value.toLowerCase();

  if (!value) return "Confirmed";
  if (normalised === "confirmed") return "Booked";
  if (normalised === "delivered") return "Delivered";
  if (normalised === "cancelled by instructor") return "Cancelled by instructor";
  if (normalised === "cancelled by student") return "Cancelled by student";
  if (normalised === "no-show") return "No-show";
  if (normalised === "no-show charged") return "No-show charged";

  return value;
}

function normaliseAdminSearchValue(value) {
  return String(value || "").trim().toLowerCase();
}

function matchesAdminSearch(values = []) {
  const search = normaliseAdminSearchValue(adminFilters.search);
  if (!search) return true;

  return values.some((value) => normaliseAdminSearchValue(value).includes(search));
}

function getStudentLessons(student, lessons = adminData.lessons) {
  return (lessons || []).filter((lesson) => sameStudent(lesson, student));
}

function getStudentActiveBookings(student, lessons = adminData.lessons) {
  return getStudentLessons(student, lessons)
    .filter((lesson) => !isCompletedLessonStatus(lesson.status) && !isCancelledLessonStatus(lesson.status) && !isNoShowLessonStatus(lesson.status))
    .sort((a, b) => new Date(formatLessonDateValue(a) || 0) - new Date(formatLessonDateValue(b) || 0));
}

function getStudentClosedLessons(student, lessons = adminData.lessons) {
  return getStudentLessons(student, lessons).filter((lesson) => isCancelledLessonStatus(lesson.status) || isNoShowLessonStatus(lesson.status));
}

function getStudentCompletedLessons(student, lessons = adminData.lessons) {
  return getStudentLessons(student, lessons).filter((lesson) => isCompletedLessonStatus(lesson.status));
}

function isEligibleLessonForProgress(lesson) {
  if (!lesson) return false;
  if (isCancelledLessonStatus(lesson.status) || isNoShowLessonStatus(lesson.status)) return false;

  const status = String(lesson.status || "").toLowerCase();
  return eligibleLessonStatuses.some((value) => status.includes(value));
}

function lessonHasProgressRecord(lesson) {
  if (!lesson) return false;

  return Boolean(
    lesson.progress_notes ||
      lesson.progress_summary ||
      (Array.isArray(lesson.covered_topics) && lesson.covered_topics.length) ||
      (adminData.lessonSkillRatings || []).some((rating) => rating.lesson_id === lesson.id) ||
      (adminData.homeworkTasks || []).some((task) => task.lesson_id === lesson.id),
  );
}

function getProgressEligibleLessons(student) {
  return getStudentLessons(student)
    .filter((lesson) => isEligibleLessonForProgress(lesson))
    .sort((a, b) => new Date(formatLessonDateValue(b) || 0) - new Date(formatLessonDateValue(a) || 0));
}

function getStudentPaymentHealth(student, lessons = adminData.lessons, paymentBalances = adminData.paymentBalances) {
  const paymentBalance = findPaymentBalanceForStudent(student, paymentBalances);
  const activeBookings = getStudentActiveBookings(student, lessons);
  const nextLesson = activeBookings[0] || null;
  const nextLessonHours = nextLesson ? getLessonDurationHours(nextLesson) : 0;
  const purchasedHours = Number(paymentBalance?.purchased_hours || 0);
  const usedHours = Number(paymentBalance?.used_hours || 0);
  const remainingHours = Math.max(purchasedHours - usedHours, 0);
  const coverageGap = nextLessonHours ? Math.max(nextLessonHours - remainingHours, 0) : 0;

  if (!paymentBalance) {
    return {
      code: activeBookings.length ? "needs-payment" : "no-credit",
      tone: activeBookings.length ? "danger" : "muted",
      label: activeBookings.length ? "Needs payment" : "No credit recorded",
      summary: activeBookings.length ? "Booked lesson has no paid credit linked yet." : "No paid balance recorded yet.",
      paymentBalance,
      activeBookings,
      nextLesson,
      nextLessonHours,
      purchasedHours,
      usedHours,
      remainingHours,
      coverageGap,
    };
  }

  if (remainingHours <= 0) {
    return {
      code: "needs-payment",
      tone: "danger",
      label: "No paid hours",
      summary: activeBookings.length ? "The next booked lesson is not covered." : "No paid hours remain.",
      paymentBalance,
      activeBookings,
      nextLesson,
      nextLessonHours,
      purchasedHours,
      usedHours,
      remainingHours,
      coverageGap,
    };
  }

  if (coverageGap > 0) {
    return {
      code: "short-next-lesson",
      tone: "danger",
      label: "Short for next lesson",
      summary: `Short by ${formatAdminHours(coverageGap)}h for the next booked lesson.`,
      paymentBalance,
      activeBookings,
      nextLesson,
      nextLessonHours,
      purchasedHours,
      usedHours,
      remainingHours,
      coverageGap,
    };
  }

  if (remainingHours <= 2) {
    return {
      code: "low-hours",
      tone: "warning",
      label: "Low remaining hours",
      summary: activeBookings.length ? "The next lesson is covered, but the account is running low." : "Paid credit is running low.",
      paymentBalance,
      activeBookings,
      nextLesson,
      nextLessonHours,
      purchasedHours,
      usedHours,
      remainingHours,
      coverageGap,
    };
  }

  return {
    code: activeBookings.length ? "covered" : "credit-available",
    tone: "success",
    label: activeBookings.length ? "Lesson covered" : "Credit available",
    summary: activeBookings.length ? "The next booked lesson is covered." : "Paid credit is available for future bookings.",
    paymentBalance,
    activeBookings,
    nextLesson,
    nextLessonHours,
    purchasedHours,
    usedHours,
    remainingHours,
    coverageGap,
  };
}

function matchesPaymentFilter(health) {
  switch (adminFilters.payment) {
    case "needs-payment":
      return ["needs-payment", "short-next-lesson"].includes(health.code);
    case "low-hours":
      return health.code === "low-hours";
    case "covered":
      return ["covered", "credit-available"].includes(health.code);
    case "no-credit":
      return health.code === "no-credit";
    default:
      return true;
  }
}

function matchesFocusFilterForStudent(student, health, lessons = adminData.lessons, requests = adminData.lessonRequests, slotRequests = adminData.slotRequests) {
  switch (adminFilters.focus) {
    case "pending":
      return (requests || []).some((request) => sameStudent(request, student) && isPendingStatus(request.status))
        || (slotRequests || []).some((request) => sameStudent(request, student) && isPendingStatus(request.status));
    case "unpaid":
      return ["needs-payment", "short-next-lesson"].includes(health.code);
    case "low":
      return ["low-hours", "short-next-lesson"].includes(health.code);
    case "upcoming":
      return health.activeBookings.length > 0;
    case "delivered":
      return getStudentCompletedLessons(student, lessons).length > 0;
    case "closed":
      return getStudentClosedLessons(student, lessons).length > 0;
    default:
      return true;
  }
}

function getLessonSearchTerms(lesson, student = null) {
  return [
    lesson?.student_email,
    lesson?.topic,
    lesson?.notes,
    lesson?.summary,
    formatLessonDateValue(lesson),
    student ? getStudentName(student) : "",
    student?.email || "",
  ];
}

function matchesFocusFilterForLesson(lesson, student, health) {
  switch (adminFilters.focus) {
    case "upcoming":
      return !isCompletedLessonStatus(lesson.status) && !isCancelledLessonStatus(lesson.status) && !isNoShowLessonStatus(lesson.status);
    case "delivered":
      return isCompletedLessonStatus(lesson.status);
    case "closed":
      return isCancelledLessonStatus(lesson.status) || isNoShowLessonStatus(lesson.status);
    case "unpaid":
      return !isCompletedLessonStatus(lesson.status) && ["needs-payment", "short-next-lesson"].includes(health.code);
    case "low":
      return !isCompletedLessonStatus(lesson.status) && ["low-hours", "short-next-lesson"].includes(health.code);
    default:
      return true;
  }
}

function addStatusPill(item, label, tone = "muted") {
  if (!label) return;
  const pill = document.createElement("span");
  pill.className = `status-pill is-${tone}`;
  pill.textContent = label;
  item.prepend(pill);
}

function getPaymentSummaryLines(student) {
  const health = getStudentPaymentHealth(student);
  const balance = health.paymentBalance;
  if (!balance) {
    return [
      "No payment balance recorded yet.",
      health.activeBookings.length ? "Booked lesson warning: this student has a lesson booked without linked credit." : "",
    ].filter(Boolean);
  }

  const remainingHours = health.remainingHours;
  const purchasedHours = health.purchasedHours;
  const usedHours = health.usedHours;

  return [
    `Status: ${health.label}`,
    `Remaining: ${formatAdminHours(remainingHours)}h`,
    `Purchased: ${formatAdminHours(purchasedHours)}h`,
    `Used: ${formatAdminHours(usedHours)}h`,
    `Balance: ${formatPoundsFromPence(balance.account_balance_pence)}`,
    health.nextLesson ? `Next lesson: ${formatAdminDate(formatLessonDateValue(health.nextLesson))} (${formatAdminHours(health.nextLessonHours)}h)` : "",
    health.summary,
  ];
}

function renderStudentPaymentSummary(student) {
  if (!studentPaymentSummary) return;
  studentPaymentSummary.innerHTML = "";

  getPaymentSummaryLines(student).forEach((line) => {
    const detail = document.createElement("div");
    detail.textContent = line;
    studentPaymentSummary.append(detail);
  });
}

function resetStudentPaymentControls() {
  if (studentPaymentAction) studentPaymentAction.value = "payment_received";
  if (studentPaymentHours) studentPaymentHours.value = "";
  if (studentPaymentAmount) studentPaymentAmount.value = "";
  if (studentPaymentNote) studentPaymentNote.value = "";
}

function getPaymentEventMetadata(event) {
  return event?.metadata && typeof event.metadata === "object" ? event.metadata : {};
}

function isReversiblePaymentEvent(event) {
  const eventType = String(event?.event_type || "");
  const status = String(event?.event_status || "").toLowerCase();
  const metadata = getPaymentEventMetadata(event);
  const reversibleTypes = [
    "checkout_session_completed",
    "manual_payment_received",
    "manual_credit_added",
  ];

  if (!reversibleTypes.includes(eventType)) return false;
  if (["reversed", "superseded", "refunded"].includes(status)) return false;
  if (metadata.reversed_by_event_id || metadata.superseded_by_event_id) return false;

  return Number(event?.hours_delta || 0) >= 0 && Number(event?.amount_pence || 0) >= 0;
}

function buildAdminItem(title, meta, details = []) {
  const item = document.createElement("article");
  item.className = "admin-list-item";

  const content = document.createElement("div");
  content.className = "admin-list-content";

  const heading = document.createElement("h3");
  heading.textContent = title || "Untitled";
  content.append(heading);

  if (meta) {
    const metaText = document.createElement("p");
    metaText.textContent = meta;
    content.append(metaText);
  }

  const cleanDetails = details.filter(Boolean);
  if (cleanDetails.length) {
    const detailList = document.createElement("ul");
    cleanDetails.forEach((detail) => {
      const row = document.createElement("li");
      row.textContent = detail;
      detailList.append(row);
    });
    content.append(detailList);
  }

  item.append(content);
  return item;
}

function formatLessonDateValue(lesson) {
  return lesson?.starts_at || lesson?.lesson_date || lesson?.created_at || "";
}

function getDateTimeValue(value) {
  const date = new Date(value || "");
  return Number.isNaN(date.getTime()) ? null : date;
}

function isPastDateTime(value) {
  const date = getDateTimeValue(value);
  return Boolean(date && date.getTime() < Date.now());
}

function addItemActions(item, actions) {
  const actionWrap = document.createElement("div");
  actionWrap.className = "admin-list-actions";

  actions.forEach(({ label, className = "secondary-button", onClick, disabled = false }) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = className;
    button.textContent = label;
    button.disabled = disabled;
    button.addEventListener("click", onClick);
    actionWrap.append(button);
  });

  item.append(actionWrap);
}

function renderPendingLessonRequests(requests) {
  clearElement(pendingLessonRequests);

  const pending = (requests || []).filter((request) =>
    isPendingStatus(request.status) &&
    (adminFilters.focus === "all" || adminFilters.focus === "pending") &&
    matchesAdminSearch([request.name, request.email, request.phone, request.postcode, request.addresses, request.current_stage]),
  );
  setCount(pendingRequestCount, pending.length);

  if (!pending.length) {
    pendingLessonRequests?.append(createEmptyState("No pending lesson requests found."));
    return;
  }

  pending.forEach((request) => {
    const item = buildAdminItem(
      request.name || request.email || "Lesson request",
      `${request.status || "Submitted"} · ${formatAdminDate(request.created_at)}`,
      [
        request.email ? `Email: ${request.email}` : "",
        request.phone ? `Phone: ${request.phone}` : "",
        request.postcode ? `Postcode: ${request.postcode}` : "",
        request.addresses ? `Address: ${request.addresses}` : "",
        request.current_stage ? `Stage: ${request.current_stage}` : "",
        request.availability ? `Availability: ${request.availability}` : "",
      ],
    );

    addItemActions(item, [
      {
        label: "Approve student",
        className: "primary-button",
        onClick: () => approveLessonRequest(request),
      },
      {
        label: "Waiting list",
        onClick: () => updateLessonRequestStatus(request.id, "Waiting list"),
      },
    ]);

    pendingLessonRequests?.append(item);
  });
}

function renderApprovedStudents(students, requests, lessons, paymentBalances = adminData.paymentBalances) {
  clearElement(approvedStudentList);

  const approvedSource = Array.isArray(students) && students.some((student) => Object.prototype.hasOwnProperty.call(student, "progress_student_id"))
    ? students
    : getApprovedStudentRecords(students, requests, adminData.studentRecords);
  const approved = approvedSource
    .map((student) => ({
      student,
      health: getStudentPaymentHealth(student, lessons, paymentBalances),
    }))
    .filter(({ student, health }) =>
      matchesAdminSearch([getStudentName(student), student.email, student.lesson_status, health.label, health.summary]) &&
      matchesPaymentFilter(health) &&
      matchesFocusFilterForStudent(student, health, lessons, requests, adminData.slotRequests),
    );
  setCount(approvedStudentCount, approved.length);

  if (!approved.length) {
    approvedStudentList?.append(createEmptyState("No approved practical students yet."));
    return;
  }

  approved.forEach(({ student, health }) => {
    const studentLessons = getStudentLessons(student, lessons);
    const activeBookings = health.activeBookings;
    const paymentBalance = health.paymentBalance;
    const progress = buildStudentProgressSummary(student);
    const completedHours = studentLessons
      .filter((lesson) => isCompletedLessonStatus(lesson.status))
      .reduce((total, lesson) => total + Number(lesson.hours || lesson.duration_hours || 2), 0);
    const purchasedHours = health.purchasedHours;
    const usedHours = health.usedHours;
    const remainingHours = health.remainingHours;

    const item = buildAdminItem(
      getStudentName(student),
      student.email || "No email saved",
      [
        `Access: ${student.lesson_status || "Approved"}`,
        `Payment status: ${health.label}`,
        `Completed hours: ${completedHours}`,
        `Bookings: ${activeBookings.length}`,
        paymentBalance
          ? `Paid remaining: ${formatAdminHours(remainingHours)} hour${remainingHours === 1 ? "" : "s"}`
          : "Paid remaining: No paid hours recorded",
        paymentBalance ? `Paid used: ${formatAdminHours(usedHours)} of ${formatAdminHours(purchasedHours)} hours` : "",
        paymentBalance ? `Account balance: ${formatPoundsFromPence(paymentBalance.account_balance_pence)}` : "",
        health.nextLesson ? `Next lesson: ${formatAdminDate(formatLessonDateValue(health.nextLesson))}` : "",
        `Estimated test readiness: ${progress.readiness}%`,
        progress.summary,
        health.summary,
      ],
    );
    addStatusPill(item, health.label, health.tone);

    addItemActions(item, [
      {
        label: "View / edit",
        className: "primary-button",
        onClick: () => openStudentManager(student),
      },
      {
        label: "Remove",
        onClick: () => removeStudentAccess(student),
      },
    ]);

    approvedStudentList?.append(item);
  });
}

function renderPaymentTracker(students, requests, lessons = adminData.lessons, paymentBalances = adminData.paymentBalances) {
  clearElement(paymentTrackerList);

  const approved = Array.isArray(students) && students.some((student) => Object.prototype.hasOwnProperty.call(student, "progress_student_id"))
    ? students
    : getApprovedStudentRecords(students, requests, adminData.studentRecords);

  if (!approved.length) {
    paymentTrackerList?.append(createEmptyState("No approved students to track yet."));
    return;
  }

  const trackerRows = approved
    .map((student) => {
      return {
        student,
        health: getStudentPaymentHealth(student, lessons, paymentBalances),
      };
    })
    .filter(({ student, health }) =>
      matchesAdminSearch([getStudentName(student), student.email, health.label, health.summary]) &&
      matchesPaymentFilter(health) &&
      matchesFocusFilterForStudent(student, health, lessons, requests, adminData.slotRequests),
    )
    .sort((a, b) => {
      const severityMap = {
        "needs-payment": 0,
        "short-next-lesson": 1,
        "low-hours": 2,
        "no-credit": 3,
        covered: 4,
        "credit-available": 5,
      };
      const aSeverity = severityMap[a.health.code] ?? 9;
      const bSeverity = severityMap[b.health.code] ?? 9;
      if (aSeverity !== bSeverity) return aSeverity - bSeverity;
      return a.health.remainingHours - b.health.remainingHours;
    });

  trackerRows.forEach((row) => {
    const { health } = row;
    const summary = health.summary;

    const item = buildAdminItem(
      getStudentName(row.student),
      summary,
      [
        row.student.email || "No email saved",
        `Hours remaining: ${formatAdminHours(health.remainingHours)}`,
        `Hours purchased: ${formatAdminHours(health.purchasedHours)}`,
        `Hours used: ${formatAdminHours(health.usedHours)}`,
        health.paymentBalance ? `Account balance: ${formatPoundsFromPence(health.paymentBalance.account_balance_pence)}` : "",
        health.activeBookings.length ? `Booked lessons: ${health.activeBookings.length}` : "Booked lessons: 0",
        health.nextLessonHours ? `Next lesson needs: ${formatAdminHours(health.nextLessonHours)}h` : "",
        health.nextLesson ? `Next lesson: ${formatAdminDate(formatLessonDateValue(health.nextLesson))}` : "",
      ],
    );
    addStatusPill(item, health.label, health.tone);

    addItemActions(item, [
      {
        label: "View / edit",
        className: "primary-button",
        onClick: () => openStudentManager(row.student),
      },
    ]);

    paymentTrackerList?.append(item);
  });
}

function renderStudentHistory(student) {
  clearElement(studentHistoryList);

  const lessons = adminData.lessons
    .filter((lesson) => sameStudent(lesson, student))
    .sort((a, b) => new Date(b.starts_at || b.lesson_date || b.created_at) - new Date(a.starts_at || a.lesson_date || a.created_at));
  const requests = adminData.lessonRequests
    .filter((request) => sameStudent(request, student))
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  const paymentEvents = getPaymentEventsForStudent(student);

  if (!lessons.length && !requests.length && !paymentEvents.length) {
    studentHistoryList?.append(createEmptyState("No booking history found for this student yet."));
    return;
  }

  lessons.forEach((lesson) => {
    const item = buildAdminItem(
      lesson.topic || "Driving lesson",
      formatAdminDate(lesson.starts_at || lesson.lesson_date),
      [
        `Status: ${lesson.status || "Confirmed"}`,
        `Hours: ${lesson.hours || lesson.duration_hours || 2}`,
        lesson.notes ? `Notes: ${lesson.notes}` : "",
      ],
    );
    studentHistoryList?.append(item);
  });

  requests.forEach((request) => {
    const item = buildAdminItem(
      "Lesson request",
      `${request.status || "Submitted"} · ${formatAdminDate(request.created_at)}`,
      [
        request.lesson_type ? `Type: ${request.lesson_type}` : "",
        request.postcode ? `Postcode: ${request.postcode}` : "",
        request.addresses ? `Address: ${request.addresses}` : "",
      ],
    );
    studentHistoryList?.append(item);
  });

  paymentEvents.forEach((event) => {
    const hours = Number(event.hours_delta || 0);
    const amount = Number(event.amount_pence || 0);
    const metadata = getPaymentEventMetadata(event);
    const isStripePayment = String(event.event_type || "") === "checkout_session_completed";
    const item = buildAdminItem(
      formatPaymentEventTitle(event),
      `${event.event_status || "Recorded"} · ${formatAdminDate(event.created_at)}`,
      [
        event.plan_key ? `Plan: ${event.plan_key}` : "",
        hours ? `Hours: ${formatAdminHours(hours)}` : "",
        amount ? `Amount: ${formatPoundsFromPence(amount)}` : "",
        isStripePayment ? "Stripe refund note: refund the card payment in Stripe, then reverse app credit here if needed." : "",
        metadata.note ? `Note: ${metadata.note}` : "",
        metadata.source ? `Source: ${metadata.source}` : "",
      ],
    );

    if (isReversiblePaymentEvent(event)) {
      addItemActions(item, [
        {
          label: isStripePayment ? "Reverse app credit" : "Reverse payment",
          onClick: () => reverseStudentPaymentEvent(event),
        },
      ]);
    }

    studentHistoryList?.append(item);
  });
}

function toDateTimeLocalValue(value) {
  const date = new Date(value || "");
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - (offset * 60 * 1000));
  return localDate.toISOString().slice(0, 16);
}

function getSelectedCoveredTopics() {
  return [...coveredTopicsGrid?.querySelectorAll("input[type='checkbox']:checked") || []].map((input) => input.value);
}

function renderCoveredTopicOptions(selectedTopics = []) {
  if (!coveredTopicsGrid) return;
  coveredTopicsGrid.innerHTML = "";

  lessonTopicOptions.forEach((topic) => {
    const label = document.createElement("label");
    label.className = "topic-chip";
    label.innerHTML = `
      <input type="checkbox" value="${topic}" ${selectedTopics.includes(topic) ? "checked" : ""} />
      <span>${topic}</span>
    `;
    label.querySelector("input")?.addEventListener("change", refreshLessonSummaryPreview);
    coveredTopicsGrid.append(label);
  });
}

function renderSkillRatingsGrid(selectedRatings = {}) {
  if (!skillRatingsGrid) return;
  skillRatingsGrid.innerHTML = "";

  (adminData.skillAreas || []).forEach((skillArea) => {
    const row = document.createElement("fieldset");
    row.className = "skill-rating-row";

    const legend = document.createElement("legend");
    legend.innerHTML = `<strong>${skillArea.name}</strong><span>${skillArea.category}</span>`;
    row.append(legend);

    const options = document.createElement("div");
    options.className = "skill-rating-options";

    skillRatingOptions.forEach((rating) => {
      const label = document.createElement("label");
      label.className = "skill-rating-option";
      const input = document.createElement("input");
      input.type = "radio";
      input.name = `skill-rating-${skillArea.id}`;
      input.value = rating;
      input.checked = (selectedRatings[skillArea.id] || "Not introduced") === rating;
      input.addEventListener("change", refreshLessonSummaryPreview);

      const text = document.createElement("span");
      text.textContent = rating;
      label.append(input, text);
      options.append(label);
    });

    row.append(options);
    skillRatingsGrid.append(row);
  });
}

function getSelectedSkillRatings() {
  const selections = {};
  (adminData.skillAreas || []).forEach((skillArea) => {
    const selected = skillRatingsGrid?.querySelector(`input[name="skill-rating-${skillArea.id}"]:checked`);
    selections[skillArea.id] = selected?.value || "Not introduced";
  });
  return selections;
}

function resetLessonRecordForm(student = activeStudent) {
  activeLessonRecordId = null;
  if (lessonRecordSelect) lessonRecordSelect.value = "";
  if (lessonRecordDate) lessonRecordDate.value = "";
  if (lessonRecordHours) lessonRecordHours.value = "";
  if (lessonRecordStatus) lessonRecordStatus.value = "Delivered";
  if (lessonRecordTopic) lessonRecordTopic.value = "";
  if (lessonRecordNotes) lessonRecordNotes.value = "";
  if (lessonRecordHomework) lessonRecordHomework.value = "";
  renderCoveredTopicOptions([]);
  renderSkillRatingsGrid({});
  refreshLessonSummaryPreview(student);
}

function renderLessonRecordOptions(student) {
  if (!lessonRecordSelect) return;

  lessonRecordSelect.innerHTML = "";
  const eligibleLessons = getProgressEligibleLessons(student);

  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = eligibleLessons.length
    ? "Choose a lesson"
    : "No eligible lessons available";
  lessonRecordSelect.append(placeholder);

  eligibleLessons
    .forEach((lesson) => {
      const option = document.createElement("option");
      option.value = lesson.id;
      option.textContent = `${formatAdminDate(formatLessonDateValue(lesson))} · ${formatLessonStatusLabel(lesson.status || "Delivered")}`;
      if (lessonHasProgressRecord(lesson)) {
        option.textContent += " · Progress saved";
      }
      lessonRecordSelect.append(option);
    });

  lessonRecordSelect.disabled = !eligibleLessons.length;
  createLessonRecordButton.disabled = !eligibleLessons.length;
}

function loadLessonRecordIntoForm(student, lessonId) {
  const lesson = getProgressEligibleLessons(student).find((item) => item.id === lessonId);
  if (!lesson) {
    resetLessonRecordForm(student);
    return;
  }

  const selectedRatings = {};
  (adminData.lessonSkillRatings || [])
    .filter((rating) => rating.lesson_id === lesson.id)
    .forEach((rating) => {
      selectedRatings[rating.skill_area_id] = rating.rating;
    });

  const homeworkLines = (adminData.homeworkTasks || [])
    .filter((task) => task.lesson_id === lesson.id)
    .sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0))
    .map((task) => task.task_text);

  activeLessonRecordId = lesson.id;
  if (lessonRecordSelect) lessonRecordSelect.value = lesson.id;
  if (lessonRecordDate) lessonRecordDate.value = formatAdminDate(formatLessonDateValue(lesson));
  if (lessonRecordHours) lessonRecordHours.value = `${lesson.hours || lesson.duration_hours || 2}`;
  if (lessonRecordStatus) lessonRecordStatus.value = lesson.status || "Delivered";
  if (lessonRecordTopic) lessonRecordTopic.value = lesson.topic || "";
  if (lessonRecordNotes) lessonRecordNotes.value = lesson.progress_notes || lesson.summary || "";
  if (lessonRecordHomework) lessonRecordHomework.value = homeworkLines.join("\n");
  renderCoveredTopicOptions(lesson.covered_topics || []);
  renderSkillRatingsGrid(selectedRatings);
  refreshLessonSummaryPreview(student);
}

function refreshLessonSummaryPreview(student = activeStudent) {
  const coveredTopics = getSelectedCoveredTopics();
  const selectedRatings = Object.values(getSelectedSkillRatings());
  const readiness = selectedRatings.length
    ? Math.round(selectedRatings.reduce((sum, rating) => sum + (readinessScoreMap[rating] || 0), 0) / selectedRatings.length)
    : 0;
  const strongCount = selectedRatings.filter((rating) => rating === "Test standard").length;
  const developingCount = selectedRatings.filter((rating) => rating === "Developing").length;
  const weakAreas = (adminData.skillAreas || []).filter((skillArea) => {
    const rating = getSelectedSkillRatings()[skillArea.id];
    return rating === "Needs work" || rating === "Not introduced";
  }).slice(0, 3);

  if (lessonReadinessValue) {
    lessonReadinessValue.textContent = `${readiness}%`;
  }

  if (lessonSummaryPreview) {
    const pieces = [
      coveredTopics.length ? `Covered: ${coveredTopics.join(", ")}.` : "Select the topics covered in the lesson.",
      `Current rating snapshot: ${strongCount} at test standard, ${developingCount} developing.`,
      weakAreas.length ? `Next focus: ${weakAreas.map((item) => item.name).join(", ")}.` : "No weak areas highlighted from the current ratings.",
      student ? `Student: ${getStudentName(student)}.` : "",
    ];
    lessonSummaryPreview.textContent = pieces.filter(Boolean).join(" ");
  }
}

async function upsertProgressStudentRecord(student) {
  const fullName = String(studentEditName?.value || student?.name || student?.full_name || "").trim();
  const email = String(studentEditEmail?.value || student?.email || "").trim();
  const payload = {
    auth_user_id: student?.student_id || null,
    email: email || null,
    full_name: fullName || null,
    phone: String(studentEditPhone?.value || student?.phone || "").trim() || null,
    postcode: String(studentEditPostcode?.value || student?.postcode || "").trim() || null,
    licence_stage: String(studentEditLicenceStage?.value || student?.licence_stage || "").trim() || null,
    notes: String(studentEditNotes?.value || student?.student_notes || "").trim() || null,
    lesson_access_status: String(studentEditStatus?.value || student?.lesson_status || "Approved").trim(),
    updated_at: new Date().toISOString(),
  };

  let query;
  if (payload.auth_user_id) {
    query = adminClient.from("students").upsert(payload, {
      onConflict: "auth_user_id",
    }).select("id,auth_user_id,email,full_name,phone,postcode,licence_stage,notes,lesson_access_status").single();
  } else if (student?.progress_student_id) {
    query = adminClient.from("students").update(payload)
      .eq("id", student.progress_student_id)
      .select("id,auth_user_id,email,full_name,phone,postcode,licence_stage,notes,lesson_access_status")
      .single();
  } else {
    delete payload.auth_user_id;
    query = adminClient.from("students").insert(payload)
      .select("id,auth_user_id,email,full_name,phone,postcode,licence_stage,notes,lesson_access_status")
      .single();
  }

  const { data, error } = await query;
  if (error) {
    return { data: null, error };
  }

  return { data, error: null };
}

async function saveLessonProgressRecord() {
  if (!activeStudent || !adminClient || isSavingLessonRecord) return;

  const activeLesson = getProgressEligibleLessons(activeStudent).find((lesson) => lesson.id === activeLessonRecordId);
  const topic = String(lessonRecordTopic?.value || "").trim() || "Driving lesson";
  const coveredTopics = getSelectedCoveredTopics();
  const lessonNotes = String(lessonRecordNotes?.value || "").trim();
  const homeworkLines = String(lessonRecordHomework?.value || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (!activeLessonRecordId || !activeLesson) {
    setAdminDataStatus("Choose an eligible lesson record before saving progress.", "error");
    return;
  }

  isSavingLessonRecord = true;
  saveLessonRecordButton.disabled = true;
  saveLessonRecordButton.textContent = "Saving lesson...";
  setAdminDataStatus("Saving lesson progress...");

  try {
    const studentRecordResult = await upsertProgressStudentRecord(activeStudent);
    if (studentRecordResult.error || !studentRecordResult.data) {
      setAdminDataStatus(getAdminError(studentRecordResult.error), "error");
      return;
    }

    const selectedRatings = getSelectedSkillRatings();
    const readiness = Math.round(
      Object.values(selectedRatings).reduce((sum, rating) => sum + (readinessScoreMap[rating] || 0), 0) /
      Math.max(Object.keys(selectedRatings).length, 1),
    );

    const weakAreas = (adminData.skillAreas || []).filter((skillArea) => {
      const rating = selectedRatings[skillArea.id];
      return rating === "Needs work" || rating === "Not introduced";
    });
    const strongAreas = (adminData.skillAreas || []).filter((skillArea) => {
      const rating = selectedRatings[skillArea.id];
      return rating === "Developing" || rating === "Test standard";
    });

    const progressSummary = [
      coveredTopics.length ? `Covered ${coveredTopics.join(", ")}.` : "",
      strongAreas.length ? `Stronger areas: ${strongAreas.slice(0, 3).map((area) => area.name).join(", ")}.` : "",
      weakAreas.length ? `Needs more work on ${weakAreas.slice(0, 3).map((area) => area.name).join(", ")}.` : "",
      homeworkLines.length ? `Homework: ${homeworkLines.join("; ")}.` : "",
    ].filter(Boolean).join(" ");

    const lessonPayload = {
      student_id: activeLesson.student_id || activeStudent.student_id || studentRecordResult.data.auth_user_id || null,
      student_email: activeLesson.student_email || studentEditEmail?.value || activeStudent.email || null,
      student_record_id: studentRecordResult.data.id,
      starts_at: activeLesson.starts_at || activeLesson.lesson_date || null,
      lesson_date: activeLesson.lesson_date || activeLesson.starts_at || null,
      hours: Number(activeLesson.hours || activeLesson.duration_hours || 2),
      topic,
      status: activeLesson.status || "Delivered",
      covered_topics: coveredTopics,
      progress_notes: lessonNotes || null,
      summary: lessonNotes || null,
      progress_summary: progressSummary || null,
      readiness_percentage: readiness,
      delivered_at: activeLesson.delivered_at || (String(activeLesson.status || "").toLowerCase().includes("deliver")
        ? new Date().toISOString()
        : null),
    };

    const { data: savedLesson, error: lessonError } = await adminClient
      .from("lessons")
      .update(lessonPayload)
      .eq("id", activeLessonRecordId)
      .select("id")
      .single();

    if (lessonError || !savedLesson?.id) {
      setAdminDataStatus(getAdminError(lessonError), "error");
      return;
    }

    await adminClient.from("lesson_skill_ratings").delete().eq("lesson_id", savedLesson.id);
    const lessonRatingsPayload = (adminData.skillAreas || []).map((skillArea) => ({
      lesson_id: savedLesson.id,
      student_id: studentRecordResult.data.id,
      skill_area_id: skillArea.id,
      rating: selectedRatings[skillArea.id] || "Not introduced",
      updated_at: new Date().toISOString(),
    }));
    const { error: ratingsError } = await adminClient.from("lesson_skill_ratings").insert(lessonRatingsPayload);
    if (ratingsError) {
      setAdminDataStatus(getAdminError(ratingsError), "error");
      return;
    }

    await adminClient.from("homework_tasks").delete().eq("lesson_id", savedLesson.id);
    if (homeworkLines.length) {
      const homeworkPayload = homeworkLines.map((taskText, index) => ({
        lesson_id: savedLesson.id,
        student_id: studentRecordResult.data.id,
        task_text: taskText,
        sort_order: index,
      }));
      const { error: homeworkError } = await adminClient.from("homework_tasks").insert(homeworkPayload);
      if (homeworkError) {
        setAdminDataStatus(getAdminError(homeworkError), "error");
        return;
      }
    }

    activeLessonRecordId = savedLesson.id;
    await loadAdminData();
    if (activeStudent) {
      activeStudent = getApprovedStudentRecords().find((student) => sameStudent(student, activeStudent)) || activeStudent;
      renderLessonRecordOptions(activeStudent);
      loadLessonRecordIntoForm(activeStudent, savedLesson.id);
    }
    setAdminDataStatus("Lesson progress saved.", "success");
  } finally {
    isSavingLessonRecord = false;
    saveLessonRecordButton.disabled = false;
    saveLessonRecordButton.textContent = "Save lesson progress";
  }
}

function openStudentManager(student) {
  activeStudent = student || {
    lesson_status: "Approved",
    email: "",
    name: "",
    full_name: "",
    phone: "",
    postcode: "",
    licence_stage: "",
    student_notes: "",
  };

  if (studentDialogTitle) studentDialogTitle.textContent = getStudentName(activeStudent);
  if (studentEditName) studentEditName.value = activeStudent.name || activeStudent.full_name || "";
  if (studentEditEmail) studentEditEmail.value = activeStudent.email || "";
  if (studentEditPhone) studentEditPhone.value = activeStudent.phone || "";
  if (studentEditPostcode) studentEditPostcode.value = activeStudent.postcode || "";
  if (studentEditLicenceStage) studentEditLicenceStage.value = activeStudent.licence_stage || "";
  if (studentEditNotes) studentEditNotes.value = activeStudent.student_notes || "";
  if (studentEditStatus) studentEditStatus.value = activeStudent.lesson_status || "Approved";

  resetStudentPaymentControls();
  renderStudentPaymentSummary(activeStudent);
  renderStudentHistory(activeStudent);
  renderLessonRecordOptions(activeStudent);
  resetLessonRecordForm(activeStudent);
  studentManageDialog?.showModal();
}

function renderSlotRequests(slotRequests) {
  clearElement(slotRequestList);

  const activeRequests = (slotRequests || []).filter((request) =>
    (isPendingStatus(request.status) || String(request.status || "").toLowerCase().includes("requested")) &&
    (adminFilters.focus === "all" || adminFilters.focus === "pending") &&
    matchesAdminSearch([request.student_email, request.requested_label, request.status]),
  );
  setCount(slotRequestCount, activeRequests.length);

  if (!activeRequests.length) {
    slotRequestList?.append(createEmptyState("No diary requests waiting for confirmation."));
    return;
  }

  activeRequests.forEach((request) => {
    const cancellationRequest = isCancellationRequest(request);
    const item = buildAdminItem(
      request.student_email || "Diary request",
      request.requested_label || formatAdminDate(request.requested_slot),
      [
        `Status: ${request.status || "Requested"}`,
        cancellationRequest ? "Type: Cancellation request" : "",
      ],
    );

    if (cancellationRequest) {
      addItemActions(item, [
        {
          label: "Approve cancellation",
          className: "primary-button",
          onClick: () => approveCancellationRequest(request),
        },
        {
          label: "Keep lesson",
          onClick: () => updateSlotRequestStatus(request.id, "Cancellation declined", request),
        },
      ]);
    } else {
      addItemActions(item, [
        {
          label: "Confirm lesson",
          className: "primary-button",
          onClick: () => confirmSlotRequest(request),
        },
        {
          label: "Decline",
          onClick: () => updateSlotRequestStatus(request.id, "Declined", request),
        },
      ]);
    }

    slotRequestList?.append(item);
  });
}

function renderConfirmedLessons(lessons, students = [], requests = []) {
  clearElement(confirmedLessonList);

  const confirmed = (lessons || []).filter((lesson) => {
    const student = findStudentForLesson(lesson, students, requests);
    const health = student ? getStudentPaymentHealth(student) : {
      code: "no-credit",
      tone: "muted",
      label: "No credit recorded",
      activeBookings: [],
      nextLesson: null,
      nextLessonHours: 0,
      remainingHours: 0,
      paymentBalance: null,
    };
    return !isCompletedLessonStatus(lesson.status) &&
      !isCancelledLessonStatus(lesson.status) &&
      !isNoShowLessonStatus(lesson.status) &&
      matchesFocusFilterForLesson(lesson, student, health) &&
      matchesAdminSearch(getLessonSearchTerms(lesson, student)) &&
      matchesPaymentFilter(health);
  }).sort((a, b) => {
    const aPast = isPastDateTime(formatLessonDateValue(a));
    const bPast = isPastDateTime(formatLessonDateValue(b));
    if (aPast !== bPast) return aPast ? -1 : 1;
    return new Date(formatLessonDateValue(a) || 0) - new Date(formatLessonDateValue(b) || 0);
  });
  setCount(confirmedLessonCount, confirmed.length);

  if (!confirmed.length) {
    confirmedLessonList?.append(createEmptyState("No confirmed lessons yet."));
    return;
  }

  confirmed.forEach((lesson) => {
    const student = findStudentForLesson(lesson, students, requests);
    const health = student ? getStudentPaymentHealth(student) : null;
    const paymentBalance = health?.paymentBalance || null;
    const remainingHours = health?.remainingHours || 0;
    const lessonHours = Number(lesson.hours || lesson.duration_hours || 2);
    const afterLessonHours = paymentBalance ? remainingHours - lessonHours : 0;
    const isPastLesson = isPastDateTime(formatLessonDateValue(lesson));
    const item = buildAdminItem(
      student ? getStudentName(student) : lesson.student_email || lesson.topic || "Driving lesson",
      formatAdminDate(lesson.starts_at || lesson.lesson_date),
      [
        lesson.student_email ? `Email: ${lesson.student_email}` : "",
        `Status: ${formatLessonStatusLabel(lesson.status || "Confirmed")}`,
        isPastLesson ? "Action: This lesson time has passed and needs review." : "",
        `Hours: ${lessonHours}`,
        paymentBalance
          ? `Paid remaining now: ${formatAdminHours(remainingHours)}h`
          : "Paid remaining now: No paid hours recorded",
        paymentBalance
          ? afterLessonHours >= 0
            ? `After this lesson: ${formatAdminHours(afterLessonHours)}h remaining`
            : `After this lesson: ${formatAdminHours(Math.abs(afterLessonHours))}h short`
          : "",
        health?.label ? `Payment status: ${health.label}` : "",
        lesson.topic ? `Focus: ${lesson.topic}` : "",
        lesson.summary ? `Summary: ${lesson.summary}` : "",
      ],
    );
    if (health) addStatusPill(item, health.label, health.tone);
    if (isPastLesson) addStatusPill(item, "Needs review", "warning");

    addItemActions(item, [
      {
        label: "Record progress",
        onClick: () => {
          if (student) {
            openStudentManager(student);
            loadLessonRecordIntoForm(student, lesson.id);
          }
        },
        disabled: !student,
      },
      {
        label: "Mark as delivered",
        className: "primary-button",
        onClick: () => markLessonDelivered(lesson),
      },
      {
        label: "Mark no-show",
        onClick: () => markLessonNoShow(lesson),
      },
      {
        label: "No-show and charge",
        onClick: () => markLessonNoShow(lesson, { chargeStudent: true }),
      },
      {
        label: "Cancel booking",
        onClick: () => cancelLessonBooking(lesson),
      },
    ]);

    confirmedLessonList?.append(item);
  });
}

function renderDeliveredLessons(lessons, students = [], requests = []) {
  clearElement(deliveredLessonList);

  const delivered = (lessons || [])
    .filter((lesson) => {
      const student = findStudentForLesson(lesson, students, requests);
      const health = student ? getStudentPaymentHealth(student) : { code: "no-credit", tone: "muted", label: "No credit recorded" };
      return isCompletedLessonStatus(lesson.status) &&
        matchesFocusFilterForLesson(lesson, student, health) &&
        matchesAdminSearch(getLessonSearchTerms(lesson, student));
    })
    .sort((a, b) => new Date(b.delivered_at || formatLessonDateValue(b) || 0) - new Date(a.delivered_at || formatLessonDateValue(a) || 0));

  if (!delivered.length) {
    deliveredLessonList?.append(createEmptyState("No delivered lessons yet."));
    return;
  }

  delivered.forEach((lesson) => {
    const student = findStudentForLesson(lesson, students, requests);
    const item = buildAdminItem(
      student ? getStudentName(student) : lesson.student_email || lesson.topic || "Driving lesson",
      formatAdminDate(formatLessonDateValue(lesson)),
      [
        lesson.student_email ? `Email: ${lesson.student_email}` : "",
        `Status: ${formatLessonStatusLabel(lesson.status || "Delivered")}`,
        `Hours: ${lesson.hours || lesson.duration_hours || 2}`,
        lesson.delivered_at ? `Delivered: ${formatAdminDate(lesson.delivered_at)}` : "",
        lesson.topic ? `Focus: ${lesson.topic}` : "",
        lesson.summary ? `Summary: ${lesson.summary}` : "",
      ],
    );

    addItemActions(item, [
      {
        label: "Edit progress",
        className: "primary-button",
        onClick: () => {
          if (student) {
            openStudentManager(student);
            loadLessonRecordIntoForm(student, lesson.id);
          }
        },
        disabled: !student,
      },
      {
        label: "Undo delivered",
        onClick: () => undoLessonDelivered(lesson),
      },
    ]);

    deliveredLessonList?.append(item);
  });
}

function renderClosedLessons(lessons, students = [], requests = []) {
  clearElement(closedLessonList);

  const closedLessons = (lessons || [])
    .filter((lesson) => {
      const student = findStudentForLesson(lesson, students, requests);
      const health = student ? getStudentPaymentHealth(student) : { code: "no-credit", tone: "muted", label: "No credit recorded" };
      return (isCancelledLessonStatus(lesson.status) || isNoShowLessonStatus(lesson.status)) &&
        matchesFocusFilterForLesson(lesson, student, health) &&
        matchesAdminSearch(getLessonSearchTerms(lesson, student));
    })
    .sort((a, b) => new Date(formatLessonDateValue(b) || 0) - new Date(formatLessonDateValue(a) || 0));

  if (!closedLessons.length) {
    closedLessonList?.append(createEmptyState("No cancelled or no-show lessons yet."));
    return;
  }

  closedLessons.forEach((lesson) => {
    const student = findStudentForLesson(lesson, students, requests);
    const tone = isNoShowLessonStatus(lesson.status) ? "warning" : "muted";
    const item = buildAdminItem(
      student ? getStudentName(student) : lesson.student_email || lesson.topic || "Driving lesson",
      formatAdminDate(formatLessonDateValue(lesson)),
      [
        lesson.student_email ? `Email: ${lesson.student_email}` : "",
        `Status: ${formatLessonStatusLabel(lesson.status)}`,
        `Hours: ${lesson.hours || lesson.duration_hours || 2}`,
        lesson.topic ? `Focus: ${lesson.topic}` : "",
        lesson.summary ? `Summary: ${lesson.summary}` : "",
      ],
    );
    addStatusPill(item, formatLessonStatusLabel(lesson.status), tone);

    addItemActions(item, [
      {
        label: isNoShowLessonStatus(lesson.status) ? "Undo no-show" : "Reopen lesson",
        onClick: () => reopenClosedLesson(lesson),
      },
    ]);

    closedLessonList?.append(item);
  });
}

function getAvailableSlots(slots = adminData.availabilitySlots) {
  return (slots || []).filter((slot) => String(slot.status || "").toLowerCase() === "available");
}

function renderAvailabilityOptions(slots = adminData.availabilitySlots) {
  if (assignSlotSelect) {
    const availableSlots = getAvailableSlots(slots);
    assignSlotSelect.innerHTML = "";

    if (!availableSlots.length) {
      const option = document.createElement("option");
      option.textContent = "No available slots";
      option.value = "";
      assignSlotSelect.append(option);
    } else {
      availableSlots.forEach((slot) => {
        const option = document.createElement("option");
        option.value = slot.id;
        option.textContent = `${formatAdminDate(slot.starts_at)} · ${slot.hours || 2}h`;
        assignSlotSelect.append(option);
      });
    }
  }

  if (assignStudentSelect) {
    const approvedStudents = getApprovedStudentRecords();
    assignStudentSelect.innerHTML = "";

    if (!approvedStudents.length) {
      const option = document.createElement("option");
      option.textContent = "No approved students";
      option.value = "";
      assignStudentSelect.append(option);
    } else {
      approvedStudents.forEach((student) => {
        const option = document.createElement("option");
        option.value = getStudentMergeKey(student);
        option.textContent = `${getStudentName(student)}${student.email ? ` · ${student.email}` : ""}`;
        assignStudentSelect.append(option);
      });
    }
  }
}

function renderDiaryStats(slots = adminData.availabilitySlots) {
  const available = (slots || []).filter((slot) => String(slot.status || "").toLowerCase() === "available");
  const booked = (slots || []).filter((slot) => String(slot.status || "").toLowerCase() === "booked");
  const hidden = (slots || []).filter((slot) => String(slot.status || "").toLowerCase() === "hidden");

  setCount(availableSlotCount, available.length);
  setCount(bookedSlotCount, booked.length);
  setCount(hiddenSlotCount, hidden.length);
}

function getSlotStatusClass(status) {
  const value = String(status || "available").toLowerCase();
  if (value.includes("book")) return "is-booked";
  if (value.includes("hidden")) return "is-hidden";
  if (value.includes("pending")) return "is-pending";
  return "is-available";
}

function findPendingRequestForSlot(slot) {
  if (!slot?.id) return null;

  return (adminData.slotRequests || []).find((request) => {
    const requestStatus = String(request.status || "").toLowerCase();
    const isClosed = ["confirmed", "declined", "rejected", "cancel"].some((word) => requestStatus.includes(word));
    return request.availability_slot_id === slot.id && !isClosed;
  });
}

function getPendingSlotActions(slot) {
  const request = findPendingRequestForSlot(slot);

  if (!request) {
    return [
      {
        label: "Release slot",
        onClick: () =>
          updateAvailabilitySlot(slot.id, {
            status: "Available",
            assigned_student_id: null,
            assigned_student_email: null,
          }),
      },
    ];
  }

  return [
    {
      label: "Confirm",
      className: "primary-button",
      onClick: () => confirmSlotRequest(request),
    },
    {
      label: "Decline",
      onClick: () => updateSlotRequestStatus(request.id, "Declined", request),
    },
  ];
}

function renderDiaryWeek(slots = adminData.availabilitySlots) {
  if (!diaryWeekGrid) return;

  clearElement(diaryWeekGrid);

  const days = getWeekDays();
  const startLabel = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" }).format(days[0]);
  const endLabel = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(days[6]);

  if (diaryWeekTitle) {
    diaryWeekTitle.textContent = `${startLabel} - ${endLabel}`;
  }

  days.forEach((day) => {
    const dayKey = getDateKey(day);
    const column = document.createElement("article");
    column.className = "admin-day-column";

    const heading = document.createElement("div");
    heading.className = "admin-day-heading";

    const dayName = document.createElement("strong");
    dayName.textContent = new Intl.DateTimeFormat("en-GB", { weekday: "short" }).format(day);

    const dayDate = document.createElement("span");
    dayDate.textContent = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" }).format(day);

    heading.append(dayName, dayDate);
    column.append(heading);

    const daySlots = (slots || [])
      .filter((slot) => getSlotDateKey(slot) === dayKey)
      .sort((a, b) => new Date(a.starts_at || 0) - new Date(b.starts_at || 0));

    if (!daySlots.length) {
      const empty = document.createElement("p");
      empty.className = "admin-day-empty";
      empty.textContent = "No slots";
      column.append(empty);
    } else {
      daySlots.forEach((slot) => {
        const card = document.createElement("div");
        card.className = `admin-slot-card ${getSlotStatusClass(slot.status)}`;

        const time = document.createElement("strong");
        time.className = "admin-slot-time";
        time.textContent = formatDiaryRange(slot);

        const status = document.createElement("span");
        status.className = "admin-slot-status";
        status.textContent = slot.status || "Available";

        const meta = document.createElement("p");
        meta.textContent = slot.assigned_student_email || slot.notes || `${slot.hours || 2} hour lesson`;

        const actions = document.createElement("div");
        actions.className = "admin-slot-actions";

        const statusValue = String(slot.status || "").toLowerCase();
        if (statusValue === "available") {
          const hideButton = document.createElement("button");
          hideButton.type = "button";
          hideButton.className = "secondary-button";
          hideButton.textContent = "Hide";
          hideButton.addEventListener("click", () => updateAvailabilitySlot(slot.id, { status: "Hidden" }));
          actions.append(hideButton);
        } else if (statusValue === "pending") {
          getPendingSlotActions(slot).forEach(({ label, className = "secondary-button", onClick }) => {
            const button = document.createElement("button");
            button.type = "button";
            button.className = className;
            button.textContent = label;
            button.addEventListener("click", onClick);
            actions.append(button);
          });
        } else if (statusValue === "hidden") {
          const showButton = document.createElement("button");
          showButton.type = "button";
          showButton.className = "primary-button";
          showButton.textContent = "Publish";
          showButton.addEventListener("click", () => updateAvailabilitySlot(slot.id, { status: "Available" }));
          actions.append(showButton);
        }

        if (statusValue !== "booked" && statusValue !== "pending") {
          const deleteButton = document.createElement("button");
          deleteButton.type = "button";
          deleteButton.className = "secondary-button";
          deleteButton.textContent = "Delete";
          deleteButton.addEventListener("click", () => deleteAvailabilitySlot(slot));
          actions.append(deleteButton);
        }

        card.append(time, status, meta);
        if (actions.children.length) card.append(actions);
        column.append(card);
      });
    }

    diaryWeekGrid.append(column);
  });
}

function renderAvailabilitySlots(slots) {
  clearElement(availabilitySlotList);
  renderAvailabilityOptions(slots);
  renderDiaryStats(slots);
  renderDiaryWeek(slots);

  if (!slots?.length) {
    availabilitySlotList?.append(createEmptyState("No diary slots have been added yet."));
    return;
  }

  const upcomingSlots = [...slots]
    .sort((a, b) => new Date(a.starts_at || 0) - new Date(b.starts_at || 0))
    .slice(0, 80);

  upcomingSlots.forEach((slot) => {
    const status = slot.status || "Available";
    const item = buildAdminItem(
      formatAdminDate(slot.starts_at),
      `${status} · ${slot.hours || 2} hour${Number(slot.hours || 2) === 1 ? "" : "s"}`,
      [
        slot.assigned_student_email ? `Student: ${slot.assigned_student_email}` : "",
        slot.notes ? `Note: ${slot.notes}` : "",
      ],
    );

    const statusValue = String(status).toLowerCase();
    const actions = [];

    if (statusValue === "available") {
      actions.push(
        {
          label: "Hide",
          onClick: () => updateAvailabilitySlot(slot.id, { status: "Hidden" }),
        },
        {
          label: "Delete",
          onClick: () => deleteAvailabilitySlot(slot),
        },
      );
    } else if (statusValue === "pending") {
      actions.push(...getPendingSlotActions(slot));
    } else if (statusValue === "hidden") {
      actions.push({
        label: "Make available",
        className: "primary-button",
        onClick: () => updateAvailabilitySlot(slot.id, { status: "Available" }),
      });
    }

    if (actions.length) {
      addItemActions(item, actions);
    }

    availabilitySlotList?.append(item);
  });
}

function renderSupportRequests(requests) {
  clearElement(supportRequestList);

  const activeRequests = (requests || []).filter((request) =>
    isPendingStatus(request.status) &&
    (adminFilters.focus === "all" || adminFilters.focus === "pending") &&
    matchesAdminSearch([request.name, request.email, request.topic, request.support_option, request.status]),
  );
  setCount(supportRequestCount, activeRequests.length);

  if (!activeRequests.length) {
    supportRequestList?.append(createEmptyState("No support requests waiting for reply."));
    return;
  }

  activeRequests.forEach((request) => {
    const item = buildAdminItem(
      request.name || request.email || request.support_option || "Support request",
      `${request.support_option || "Support"} · ${formatAdminDate(request.created_at)}`,
      [
        request.email ? `Email: ${request.email}` : "",
        request.phone ? `Phone: ${request.phone}` : "",
        request.topic ? `Topic: ${request.topic}` : "",
        request.availability ? `Availability: ${request.availability}` : "",
        request.current_stage ? `Stage: ${request.current_stage}` : "",
      ],
    );

    addItemActions(item, [
      {
        label: "Mark replied",
        onClick: () => updateSupportRequestStatus(request.id, "Replied"),
      },
    ]);

    supportRequestList?.append(item);
  });
}

function renderAdminSummary() {
  const approvedStudents = getApprovedStudentRecords();
  const lowCreditStudents = approvedStudents.filter((student) => {
    const health = getStudentPaymentHealth(student);
    return ["low-hours", "short-next-lesson"].includes(health.code);
  });
  const unpaidBookedLessons = (adminData.lessons || []).filter((lesson) => {
    if (isCompletedLessonStatus(lesson.status) || isCancelledLessonStatus(lesson.status) || isNoShowLessonStatus(lesson.status)) {
      return false;
    }
    const student = findStudentForLesson(lesson, adminData.studentProfiles, adminData.lessonRequests);
    if (!student) return false;
    const health = getStudentPaymentHealth(student);
    return ["needs-payment", "short-next-lesson"].includes(health.code);
  });

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const deliveredThisMonth = (adminData.lessons || []).filter((lesson) =>
    isCompletedLessonStatus(lesson.status) &&
    new Date(lesson.delivered_at || formatLessonDateValue(lesson) || 0) >= monthStart,
  );
  const paidThisMonthPence = (adminData.paymentEvents || [])
    .filter((event) =>
      Number(event.amount_pence || 0) > 0 &&
      String(event.event_status || "").toLowerCase() === "completed" &&
      new Date(event.created_at || 0) >= monthStart,
    )
    .reduce((total, event) => total + Number(event.amount_pence || 0), 0);

  setCount(lowCreditCount, lowCreditStudents.length);
  setCount(unpaidLessonCount, unpaidBookedLessons.length);
  setCount(deliveredThisMonthCount, deliveredThisMonth.length);
  if (paidThisMonthValue) paidThisMonthValue.textContent = formatPoundsFromPence(paidThisMonthPence);
}

function applyAdminFiltersFromControls() {
  adminFilters = {
    search: String(adminSearchInput?.value || "").trim(),
    focus: String(adminFocusFilter?.value || "all"),
    payment: String(adminPaymentFilter?.value || "all"),
  };
}

function rerenderAdminBoard() {
  renderPendingLessonRequests(adminData.lessonRequests);
  renderAvailabilitySlots(adminData.availabilitySlots);
  renderApprovedStudents(
    getApprovedStudentRecords(adminData.studentProfiles, adminData.lessonRequests, adminData.studentRecords),
    adminData.lessonRequests,
    adminData.lessons,
    adminData.paymentBalances,
  );
  renderPaymentTracker(
    getApprovedStudentRecords(adminData.studentProfiles, adminData.lessonRequests, adminData.studentRecords),
    adminData.lessonRequests,
    adminData.lessons,
    adminData.paymentBalances,
  );
  renderSlotRequests(adminData.slotRequests);
  renderSupportRequests(adminData.supportRequests);
  renderConfirmedLessons(adminData.lessons, getApprovedStudentRecords(adminData.studentProfiles, adminData.lessonRequests, adminData.studentRecords), adminData.lessonRequests);
  renderDeliveredLessons(adminData.lessons, getApprovedStudentRecords(adminData.studentProfiles, adminData.lessonRequests, adminData.studentRecords), adminData.lessonRequests);
  renderClosedLessons(adminData.lessons, getApprovedStudentRecords(adminData.studentProfiles, adminData.lessonRequests, adminData.studentRecords), adminData.lessonRequests);
  renderAdminSummary();

  if (activeStudent) {
    const refreshedStudent = getApprovedStudentRecords(adminData.studentProfiles, adminData.lessonRequests, adminData.studentRecords)
      .find((student) => sameStudent(student, activeStudent) || findStudentRecord(activeStudent)?.id === student.progress_student_id) || activeStudent;
    activeStudent = refreshedStudent;
    renderStudentPaymentSummary(refreshedStudent);
    renderStudentHistory(refreshedStudent);
    renderLessonRecordOptions(refreshedStudent);
    if (activeLessonRecordId) {
      loadLessonRecordIntoForm(refreshedStudent, activeLessonRecordId);
    } else {
      refreshLessonSummaryPreview(refreshedStudent);
    }
  }
}

async function loadTable(table, queryBuilder) {
  const { data, error } = await queryBuilder(adminClient.from(table));
  if (error) {
    console.warn(`Admin table failed to load: ${table}`, error);
    return { table, data: [], error };
  }

  return { table, data: data || [], error: null };
}

async function archiveExpiredAvailabilitySlots(slots = []) {
  const expiredAvailableSlots = (slots || []).filter((slot) =>
    String(slot.status || "").toLowerCase() === "available" &&
    isPastDateTime(slot.starts_at),
  );

  if (!expiredAvailableSlots.length) {
    return { count: 0, error: null };
  }

  const now = new Date().toISOString();
  const results = await Promise.all(
    expiredAvailableSlots.map((slot) =>
      adminClient
        .from("lesson_availability_slots")
        .update({
          status: "Hidden",
          updated_at: now,
        })
        .eq("id", slot.id),
    ),
  );

  const firstError = results.find((result) => result.error)?.error || null;
  if (firstError) {
    return { count: 0, error: firstError };
  }

  const archivedIds = new Set(expiredAvailableSlots.map((slot) => slot.id));
  expiredAvailableSlots.forEach((slot) => {
    slot.status = "Hidden";
    slot.updated_at = now;
  });

  return { count: archivedIds.size, error: null };
}

async function loadAdminData() {
  if (!adminClient) {
    setAdminDataStatus("Admin data is not connected to Supabase yet.", "error");
    return;
  }

  setAdminDataStatus("Loading admin data...");

  const [
    lessonRequests,
    studentProfiles,
    studentRecords,
    profileRecords,
    slotRequests,
    supportRequests,
    lessons,
    lessonSkillRatings,
    homeworkTasks,
    skillAreas,
    availabilitySlots,
    paymentBalances,
    paymentEvents,
  ] = await Promise.all([
    loadTable("lesson_requests", (query) =>
      query
        .select("id,student_id,name,email,phone,addresses,postcode,lesson_type,current_stage,availability,status,created_at")
        .order("created_at", { ascending: false })
        .limit(50),
    ),
    loadTable("student_profiles", (query) =>
      query
        .select("id,student_id,email,name,full_name,lesson_status,created_at,updated_at")
        .order("updated_at", { ascending: false })
        .limit(100),
    ),
    loadTable("students", (query) =>
      query
        .select("id,auth_user_id,email,full_name,phone,postcode,licence_stage,notes,lesson_access_status,created_at,updated_at")
        .order("updated_at", { ascending: false })
        .limit(150),
    ),
    loadTable("profiles", (query) =>
      query
        .select("id,email,full_name,role,created_at,updated_at")
        .order("updated_at", { ascending: false })
        .limit(150),
    ),
    loadTable("lesson_slot_requests", (query) =>
      query
        .select("id,student_id,student_email,availability_slot_id,requested_slot,requested_label,status,created_at")
        .order("created_at", { ascending: false })
        .limit(50),
    ),
    loadTable("support_requests", (query) =>
      query
        .select("id,student_id,support_option,name,email,phone,current_stage,recent_test_fail,regular_instructor_lessons,private_practice,theory_test_status,practical_test_status,topic,availability,status,created_at")
        .order("created_at", { ascending: false })
        .limit(50),
    ),
    loadTable("lessons", (query) =>
      query
        .select("id,student_id,student_email,student_record_id,availability_slot_id,starts_at,lesson_date,hours,duration_hours,topic,status,notes,summary,progress_notes,progress_summary,covered_topics,readiness_percentage,delivered_at,created_at")
        .order("starts_at", { ascending: true })
        .limit(200),
    ),
    loadTable("lesson_skill_ratings", (query) =>
      query
        .select("id,lesson_id,student_id,skill_area_id,rating,created_at,updated_at")
        .order("updated_at", { ascending: false })
        .limit(4000),
    ),
    loadTable("homework_tasks", (query) =>
      query
        .select("id,lesson_id,student_id,task_text,status,sort_order,created_at,updated_at")
        .order("created_at", { ascending: false })
        .limit(1000),
    ),
    loadTable("skill_areas", (query) =>
      query
        .select("id,slug,category,name,display_order,created_at")
        .order("display_order", { ascending: true })
        .limit(100),
    ),
    loadTable("lesson_availability_slots", (query) =>
      query
        .select("id,starts_at,label,hours,status,assigned_student_id,assigned_student_email,notes,created_at,updated_at")
        .order("starts_at", { ascending: true })
        .limit(120),
    ),
    loadTable("student_payment_balances", (query) =>
      query
        .select("id,student_id,student_email,purchased_hours,used_hours,account_balance_pence,last_payment_at,updated_at")
        .order("updated_at", { ascending: false })
        .limit(100),
    ),
    loadTable("student_payment_events", (query) =>
      query
        .select("id,student_id,student_email,event_type,event_status,plan_key,hours_delta,amount_pence,currency,metadata,created_at")
        .order("created_at", { ascending: false })
        .limit(120),
    ),
  ]);

  adminData = {
    lessonRequests: lessonRequests.data,
    studentProfiles: studentProfiles.data,
    studentRecords: studentRecords.data,
    profileRecords: profileRecords.data,
    slotRequests: slotRequests.data,
    supportRequests: supportRequests.data,
    lessons: lessons.data,
    lessonSkillRatings: lessonSkillRatings.data,
    homeworkTasks: homeworkTasks.data,
    skillAreas: skillAreas.data,
    availabilitySlots: availabilitySlots.data,
    paymentBalances: paymentBalances.data,
    paymentEvents: paymentEvents.data,
  };

  const expiredSlotArchive = await archiveExpiredAvailabilitySlots(adminData.availabilitySlots);
  if (expiredSlotArchive.error) {
    setAdminDataStatus(getAdminError(expiredSlotArchive.error), "error");
    return;
  }

  rerenderAdminBoard();

  const errors = [
    lessonRequests,
    studentProfiles,
    studentRecords,
    profileRecords,
    slotRequests,
    supportRequests,
    lessons,
    lessonSkillRatings,
    homeworkTasks,
    skillAreas,
    availabilitySlots,
    paymentBalances,
    paymentEvents,
  ].filter((result) => result.error);
  if (errors.length) {
    const errorSummary = errors
      .map((result) => `${result.table}: ${result.error.message || "could not load"}`)
      .join(" | ");
    setAdminDataStatus(`Some admin data could not load yet. ${errorSummary}`, "error");
    return;
  }

  if (expiredSlotArchive.count) {
    setAdminDataStatus(`${expiredSlotArchive.count} past available slot${expiredSlotArchive.count === 1 ? "" : "s"} archived automatically.`, "success");
    return;
  }

  setAdminDataStatus("Admin data loaded.", "success");
}

async function updateLessonRequestStatus(id, status) {
  if (!id) return;
  setAdminDataStatus(`Updating request to ${status}...`);

  const { error } = await adminClient
    .from("lesson_requests")
    .update({ status })
    .eq("id", id);

  if (error) {
    setAdminDataStatus(getAdminError(error), "error");
    return;
  }

  await loadAdminData();
}

async function approveLessonRequest(request) {
  if (!request?.id) return;
  setAdminDataStatus("Approving practical student...");

  let existingProfile = null;
  if (request.student_id) {
    await adminClient.from("profiles").upsert({
      id: request.student_id,
      email: request.email,
      full_name: request.name || null,
      role: "student",
      updated_at: new Date().toISOString(),
    });

    const { data: profileData, error: profileLoadError } = await adminClient
      .from("student_profiles")
      .select("id,student_id,email,name,full_name,lesson_status")
      .eq("student_id", request.student_id)
      .maybeSingle();

    if (profileLoadError) {
      setAdminDataStatus(getAdminError(profileLoadError), "error");
      return;
    }

    existingProfile = profileData || null;

    const { error: profileError } = await adminClient.from("student_profiles").upsert({
      student_id: request.student_id,
      email: request.email,
      name: request.name,
      lesson_status: "Approved",
      updated_at: new Date().toISOString(),
    }, {
      onConflict: "student_id",
    });

    if (profileError) {
      setAdminDataStatus(getAdminError(profileError), "error");
      return;
    }

    const { error: studentRecordError } = await adminClient.from("students").upsert({
      auth_user_id: request.student_id,
      email: request.email,
      full_name: request.name || null,
      lesson_access_status: "Approved",
      updated_at: new Date().toISOString(),
    }, {
      onConflict: "auth_user_id",
    });

    if (studentRecordError) {
      setAdminDataStatus(getAdminError(studentRecordError), "error");
      return;
    }
  }

  const { error: requestError } = await adminClient
    .from("lesson_requests")
    .update({ status: "Approved" })
    .eq("id", request.id);

  if (requestError) {
    if (request.student_id) {
      if (existingProfile) {
        await adminClient
          .from("student_profiles")
          .update({
            email: existingProfile.email,
            name: existingProfile.name,
            full_name: existingProfile.full_name,
            lesson_status: existingProfile.lesson_status,
            updated_at: new Date().toISOString(),
          })
          .eq("student_id", request.student_id);
      } else {
        await adminClient
          .from("student_profiles")
          .delete()
          .eq("student_id", request.student_id);
      }
    }

    setAdminDataStatus(getAdminError(requestError), "error");
    return;
  }

  await loadAdminData();
  setAdminDataStatus("Practical student approved.", "success");
}

async function saveStudentDetails(event) {
  event.preventDefault();

  if (!activeStudent) return;

  const name = String(studentEditName?.value || "").trim();
  const email = String(studentEditEmail?.value || "").trim();
  const phone = String(studentEditPhone?.value || "").trim();
  const postcode = String(studentEditPostcode?.value || "").trim();
  const licenceStage = String(studentEditLicenceStage?.value || "").trim();
  const instructorNotes = String(studentEditNotes?.value || "").trim();
  const lessonStatus = String(studentEditStatus?.value || "Approved").trim();
  const studentId = activeStudent.student_id;
  const originalEmail = activeStudent.email;

  setAdminDataStatus("Saving student details...");

  if (studentId) {
    await adminClient.from("profiles").upsert({
      id: studentId,
      email,
      full_name: name || null,
      role: "student",
      updated_at: new Date().toISOString(),
    });
  }

  if (studentId) {
    const { error: profileError } = await adminClient.from("student_profiles").upsert({
      student_id: studentId,
      email,
      name,
      full_name: name,
      lesson_status: lessonStatus,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: "student_id",
    });

    if (profileError) {
      setAdminDataStatus(getAdminError(profileError), "error");
      return;
    }

    const { error: requestMetaError } = await adminClient
      .from("lesson_requests")
      .update({ name, email })
      .eq("student_id", studentId);

    if (requestMetaError) {
      setAdminDataStatus(getAdminError(requestMetaError), "error");
      return;
    }
  } else if (originalEmail) {
    const { error: requestError } = await adminClient
      .from("lesson_requests")
      .update({ name, email })
      .eq("email", originalEmail);

    if (requestError) {
      setAdminDataStatus(getAdminError(requestError), "error");
      return;
    }
  }

  const { error: studentRecordError } = await upsertProgressStudentRecord({
    ...activeStudent,
    student_id: activeStudent.student_id,
    email,
    name,
    full_name: name,
    phone,
    postcode,
    licence_stage: licenceStage,
    student_notes: instructorNotes,
    lesson_status: lessonStatus,
  });
  if (studentRecordError) {
    setAdminDataStatus(getAdminError(studentRecordError), "error");
    return;
  }

  studentManageDialog?.close();
  await loadAdminData();
  setAdminDataStatus("Student details saved.", "success");
}

async function applyStudentPaymentAdjustment() {
  if (!activeStudent) return;

  const action = String(studentPaymentAction?.value || "payment_received");
  const hoursDelta = Number.parseFloat(String(studentPaymentHours?.value || "").trim());
  const amountPenceInput = parsePoundsToPence(studentPaymentAmount?.value || "");
  const note = String(studentPaymentNote?.value || "").trim();

  if (!Number.isFinite(hoursDelta) || hoursDelta <= 0) {
    setAdminDataStatus("Enter the number of hours to add or deduct.", "error");
    return;
  }

  if (action === "payment_received" && amountPenceInput <= 0) {
    setAdminDataStatus("Enter the payment amount in pounds for a cash or bank-transfer payment.", "error");
    return;
  }

  const existingBalance = findPaymentBalanceForStudent(activeStudent);
  const purchasedHours = Number(existingBalance?.purchased_hours || 0);
  const usedHours = Number(existingBalance?.used_hours || 0);
  const currentBalancePence = Number(existingBalance?.account_balance_pence || 0);
  const remainingHours = Math.max(purchasedHours - usedHours, 0);
  const normalisedHours = Math.round(hoursDelta * 10) / 10;
  const adjustmentHours = action === "debit_correction" ? -normalisedHours : normalisedHours;
  const adjustmentAmountPence = action === "debit_correction" ? -Math.abs(amountPenceInput) : Math.abs(amountPenceInput);

  if (action === "debit_correction") {
    if (normalisedHours > remainingHours) {
      setAdminDataStatus(`Only ${formatAdminHours(remainingHours)} hour${remainingHours === 1 ? "" : "s"} can be deducted from the remaining balance.`, "error");
      return;
    }

    if (Math.abs(adjustmentAmountPence) > currentBalancePence) {
      setAdminDataStatus(`Only ${formatPoundsFromPence(currentBalancePence)} can be deducted from the current account balance.`, "error");
      return;
    }
  }

  const nextPurchasedHours = purchasedHours + adjustmentHours;
  const nextBalancePence = currentBalancePence + adjustmentAmountPence;

  if (nextPurchasedHours < usedHours) {
    setAdminDataStatus("This change would reduce purchased hours below the hours already used.", "error");
    return;
  }

  if (nextBalancePence < 0) {
    setAdminDataStatus("This change would make the account balance negative.", "error");
    return;
  }

  const studentId = activeStudent.student_id || null;
  const studentEmail = activeStudent.email || activeStudent.student_email || "";
  const now = new Date().toISOString();
  const eventType = {
    payment_received: "manual_payment_received",
    credit_only: "manual_credit_added",
    debit_correction: "manual_credit_deducted",
  }[action] || "manual_payment_received";
  const statusMessage = {
    payment_received: "Recording manual payment...",
    credit_only: "Adding lesson credit...",
    debit_correction: "Applying manual deduction...",
  }[action] || "Updating payment balance...";

  setAdminDataStatus(statusMessage);
  if (applyStudentPaymentButton) applyStudentPaymentButton.disabled = true;

  const balancePayload = {
    student_id: studentId,
    student_email: studentEmail,
    purchased_hours: nextPurchasedHours,
    used_hours: usedHours,
    account_balance_pence: nextBalancePence,
    last_payment_at: action === "debit_correction" ? existingBalance?.last_payment_at || null : now,
    updated_at: now,
  };

  let balanceError = null;
  let createdBalanceRow = false;

  if (existingBalance?.id) {
    const result = await adminClient
      .from("student_payment_balances")
      .update(balancePayload)
      .eq("id", existingBalance.id);
    balanceError = result.error;
  } else {
    const result = await adminClient
      .from("student_payment_balances")
      .insert(balancePayload);
    balanceError = result.error;
    createdBalanceRow = !result.error;
  }

  if (balanceError) {
    if (applyStudentPaymentButton) applyStudentPaymentButton.disabled = false;
    setAdminDataStatus(getAdminError(balanceError), "error");
    return;
  }

  const metadata = {
    source: action === "payment_received" ? "admin_manual_payment" : "admin_manual_adjustment",
    note: note || null,
    adjusted_by: adminUsernameEmail || adminName,
    adjustment_action: action,
  };

  const { error: eventError } = await adminClient
    .from("student_payment_events")
    .insert({
      student_id: studentId,
      student_email: studentEmail,
      event_type: eventType,
      event_status: "completed",
      plan_key: action === "payment_received" ? "offline_payment" : "manual_adjustment",
      hours_delta: adjustmentHours,
      amount_pence: adjustmentAmountPence,
      currency: "gbp",
      metadata,
      updated_at: now,
    });

  if (eventError) {
    if (existingBalance) {
      await adminClient
        .from("student_payment_balances")
        .update({
          purchased_hours: purchasedHours,
          used_hours: usedHours,
          account_balance_pence: currentBalancePence,
          last_payment_at: existingBalance.last_payment_at || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingBalance.id);
    } else if (createdBalanceRow) {
      const deleteQuery = adminClient
        .from("student_payment_balances")
        .delete()
        .eq("student_email", studentEmail);

      if (studentId) {
        await deleteQuery.eq("student_id", studentId);
      } else {
        await deleteQuery;
      }
    }

    if (applyStudentPaymentButton) applyStudentPaymentButton.disabled = false;
    setAdminDataStatus(getAdminError(eventError), "error");
    return;
  }

  resetStudentPaymentControls();
  await loadAdminData();

  const refreshedStudent = getApprovedStudentRecords().find((student) => sameStudent(student, activeStudent)) || activeStudent;
  activeStudent = refreshedStudent;
  renderStudentPaymentSummary(refreshedStudent);
  renderStudentHistory(refreshedStudent);

  if (applyStudentPaymentButton) applyStudentPaymentButton.disabled = false;
  setAdminDataStatus("Payment balance updated.", "success");
}

async function reverseStudentPaymentEvent(event) {
  if (!activeStudent || !event?.id) return;

  const reverseHours = Math.abs(Number(event.hours_delta || 0));
  const reverseAmountPence = Math.abs(Number(event.amount_pence || 0));
  const eventLabel = formatPaymentEventTitle(event);
  const isStripePayment = String(event.event_type || "") === "checkout_session_completed";
  const currentBalance = findPaymentBalanceForStudent(activeStudent);
  const currentPurchasedHours = Number(currentBalance?.purchased_hours || 0);
  const currentUsedHours = Number(currentBalance?.used_hours || 0);
  const currentAccountBalancePence = Number(currentBalance?.account_balance_pence || 0);
  const nextPurchasedHours = currentPurchasedHours - reverseHours;
  const nextAccountBalancePence = currentAccountBalancePence - reverseAmountPence;

  if (nextPurchasedHours < currentUsedHours) {
    setAdminDataStatus("This payment cannot be reversed because some of the credited lesson hours have already been used.", "error");
    return;
  }

  if (nextAccountBalancePence < 0) {
    setAdminDataStatus("This payment cannot be reversed because the stored account balance is already lower than the payment amount.", "error");
    return;
  }

  const confirmationMessage = isStripePayment
    ? `Reverse ${eventLabel} for ${formatPoundsFromPence(reverseAmountPence)} and ${formatAdminHours(reverseHours)}h? This removes the lesson credit in Drive with Niall only. Refund the actual card payment separately in Stripe if needed.`
    : `Reverse ${eventLabel} for ${formatPoundsFromPence(reverseAmountPence)} and ${formatAdminHours(reverseHours)}h?`;
  const confirmed = window.confirm(confirmationMessage);
  if (!confirmed) return;

  const studentId = activeStudent.student_id || null;
  const studentEmail = activeStudent.email || activeStudent.student_email || "";
  const now = new Date().toISOString();
  setAdminDataStatus("Reversing payment credit...");

  const { error: balanceError } = await adminClient
    .from("student_payment_balances")
    .update({
      purchased_hours: nextPurchasedHours,
      used_hours: currentUsedHours,
      account_balance_pence: nextAccountBalancePence,
      updated_at: now,
    })
    .eq("id", currentBalance?.id);

  if (balanceError) {
    setAdminDataStatus(getAdminError(balanceError), "error");
    return;
  }

  const { data: reversalEvent, error: reversalInsertError } = await adminClient
    .from("student_payment_events")
    .insert({
      student_id: studentId,
      student_email: studentEmail,
      event_type: "payment_reversed",
      event_status: "completed",
      plan_key: event.plan_key || "payment_reversal",
      hours_delta: -reverseHours,
      amount_pence: -reverseAmountPence,
      currency: event.currency || "gbp",
      metadata: {
        source: "admin_payment_reversal",
        reversed_event_id: event.id,
        original_event_type: event.event_type,
        original_created_at: event.created_at || null,
        note: isStripePayment
          ? "Lesson credit reversed in admin. Refund the original Stripe charge separately if needed."
          : "Payment credit reversed in admin.",
        reversed_by: adminUsernameEmail || adminName,
      },
      updated_at: now,
    })
    .select("id")
    .single();

  if (reversalInsertError) {
    await adminClient
      .from("student_payment_balances")
      .update({
        purchased_hours: currentPurchasedHours,
        used_hours: currentUsedHours,
        account_balance_pence: currentAccountBalancePence,
        updated_at: new Date().toISOString(),
      })
      .eq("id", currentBalance?.id);

    setAdminDataStatus(getAdminError(reversalInsertError), "error");
    return;
  }

  const originalMetadata = getPaymentEventMetadata(event);
  const { error: originalUpdateError } = await adminClient
    .from("student_payment_events")
    .update({
      event_status: "reversed",
      metadata: {
        ...originalMetadata,
        reversed_by_event_id: reversalEvent?.id || null,
        reversed_at: now,
        reversed_by: adminUsernameEmail || adminName,
      },
      updated_at: now,
    })
    .eq("id", event.id);

  if (originalUpdateError) {
    await adminClient
      .from("student_payment_balances")
      .update({
        purchased_hours: currentPurchasedHours,
        used_hours: currentUsedHours,
        account_balance_pence: currentAccountBalancePence,
        updated_at: new Date().toISOString(),
      })
      .eq("id", currentBalance?.id);

    if (reversalEvent?.id) {
      await adminClient
        .from("student_payment_events")
        .delete()
        .eq("id", reversalEvent.id);
    }

    setAdminDataStatus(getAdminError(originalUpdateError), "error");
    return;
  }

  await loadAdminData();
  const refreshedStudent = getApprovedStudentRecords().find((student) => sameStudent(student, activeStudent)) || activeStudent;
  activeStudent = refreshedStudent;
  renderStudentPaymentSummary(refreshedStudent);
  renderStudentHistory(refreshedStudent);

  setAdminDataStatus(
    isStripePayment
      ? "Payment credit reversed. If the card charge also needs refunding, do that in Stripe."
      : "Payment credit reversed.",
    "success",
  );
}

async function removeStudentAccess(student = activeStudent) {
  if (!student) return;

  const confirmed = window.confirm(`Remove practical lesson access for ${getStudentName(student)}? Their account and lesson history will stay saved.`);
  if (!confirmed) return;

  setAdminDataStatus("Removing practical lesson access...");

  const activeLessons = adminData.lessons.filter((lesson) => {
    if (!sameStudent(lesson, student)) return false;
    return !isCompletedLessonStatus(lesson.status) && !isCancelledLessonStatus(lesson.status);
  });
  const activeLessonRequests = adminData.lessonRequests.filter((request) => sameStudent(request, student) && !isClosedWorkflowStatus(request.status));
  const activeSlotRequests = adminData.slotRequests.filter((request) => sameStudent(request, student) && !isClosedWorkflowStatus(request.status));

  if (student.student_id) {
    await adminClient
      .from("students")
      .update({
        lesson_access_status: "Removed",
        updated_at: new Date().toISOString(),
      })
      .eq("auth_user_id", student.student_id);

    const { error: profileError } = await adminClient
      .from("student_profiles")
      .update({
        lesson_status: "Removed",
        updated_at: new Date().toISOString(),
      })
      .eq("student_id", student.student_id);

    if (profileError) {
      setAdminDataStatus(getAdminError(profileError), "error");
      return;
    }

    if (activeLessonRequests.length) {
      const { error: requestUpdateError } = await adminClient
        .from("lesson_requests")
        .update({ status: "Removed" })
        .in("id", activeLessonRequests.map((request) => request.id));

      if (requestUpdateError) {
        setAdminDataStatus(getAdminError(requestUpdateError), "error");
        return;
      }
    }

    if (activeSlotRequests.length) {
      const { error: slotRequestError } = await adminClient
        .from("lesson_slot_requests")
        .update({ status: "Removed" })
        .in("id", activeSlotRequests.map((request) => request.id));

      if (slotRequestError) {
        setAdminDataStatus(getAdminError(slotRequestError), "error");
        return;
      }
    }
  } else if (student.progress_student_id) {
    await adminClient
      .from("students")
      .update({
        lesson_access_status: "Removed",
        updated_at: new Date().toISOString(),
      })
      .eq("id", student.progress_student_id);
  } else if (student.email) {
    if (activeLessonRequests.length) {
      const { error: requestError } = await adminClient
        .from("lesson_requests")
        .update({ status: "Removed" })
        .in("id", activeLessonRequests.map((request) => request.id));

      if (requestError) {
        setAdminDataStatus(getAdminError(requestError), "error");
        return;
      }
    }

    if (activeSlotRequests.length) {
      const { error: slotRequestError } = await adminClient
        .from("lesson_slot_requests")
        .update({ status: "Removed" })
        .in("id", activeSlotRequests.map((request) => request.id));

      if (slotRequestError) {
        setAdminDataStatus(getAdminError(slotRequestError), "error");
        return;
      }
    }
  }

  for (const lesson of activeLessons) {
    const cancelled = await cancelLessonBooking(lesson, { skipConfirm: true, silent: true });
    if (!cancelled) {
      setAdminDataStatus("Practical access was removed, but one or more booked lessons could not be released.", "error");
      await loadAdminData();
      return;
    }
  }

  studentManageDialog?.close();
  await loadAdminData();
  setAdminDataStatus("Student practical access removed. Active bookings were cancelled and their history was kept.", "success");
}

function shouldReleaseHeldSlot(status, request) {
  const normalisedStatus = String(status || "").toLowerCase();
  return Boolean(
    request?.availability_slot_id &&
      !isCancellationRequest(request) &&
      (normalisedStatus.includes("declined") || normalisedStatus.includes("rejected")),
  );
}

async function releaseHeldSlot(availabilitySlotId) {
  if (!availabilitySlotId) return null;

  return adminClient
    .from("lesson_availability_slots")
    .update({
      status: "Available",
      assigned_student_id: null,
      assigned_student_email: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", availabilitySlotId)
    .eq("status", "Pending");
}

async function updateSlotRequestStatus(id, status, request = null) {
  if (!id) return;
  setAdminDataStatus(`Updating diary request to ${status}...`);

  const { error } = await adminClient
    .from("lesson_slot_requests")
    .update({ status })
    .eq("id", id);

  if (error) {
    setAdminDataStatus(getAdminError(error), "error");
    return;
  }

  if (shouldReleaseHeldSlot(status, request)) {
    const { error: releaseError } = await releaseHeldSlot(request.availability_slot_id);

    if (releaseError) {
      setAdminDataStatus(getAdminError(releaseError), "error");
      return;
    }
  }

  await loadAdminData();
}

async function updateSupportRequestStatus(id, status) {
  if (!id) return;
  setAdminDataStatus(`Updating support request to ${status}...`);

  const { error } = await adminClient
    .from("support_requests")
    .update({ status })
    .eq("id", id);

  if (error) {
    setAdminDataStatus(getAdminError(error), "error");
    return;
  }

  await loadAdminData();
}

async function createAvailabilitySlot(event) {
  event.preventDefault();

  if (isCreatingAvailabilitySlot) {
    return;
  }

  const date = availabilityDate?.value;
  const time = availabilityTime?.value;
  const hours = Number(availabilityHours?.value || 2);
  const notes = String(availabilityNotes?.value || "").trim();

  if (!date || !time) {
    setAdminDataStatus("Choose a date and time before adding a diary slot.", "error");
    return;
  }

  const startsAt = `${date}T${time}:00`;
  isCreatingAvailabilitySlot = true;
  setFormSubmitButtonState(availabilityForm, true, "Adding slot...", "Add slot");
  setAdminDataStatus("Adding available diary slot...");

  try {
    const { error } = await adminClient.from("lesson_availability_slots").insert({
      starts_at: startsAt,
      label: formatAdminDate(startsAt),
      hours: Number.isFinite(hours) ? hours : 2,
      status: "Available",
      notes,
    });

    if (error) {
      setAdminDataStatus(getAdminError(error), "error");
      return;
    }

    availabilityForm?.reset();
    if (availabilityHours) availabilityHours.value = "2";
    await loadAdminData();
    setAdminDataStatus("Diary slot added. Approved students can now request it.", "success");
  } finally {
    isCreatingAvailabilitySlot = false;
    setFormSubmitButtonState(availabilityForm, false, "Adding slot...", "Add slot");
  }
}

async function createWeeklyAvailability(event) {
  event.preventDefault();

  if (isPublishingWeeklyAvailability) {
    return;
  }

  const weekStartValue = availabilityWeekStart?.value;
  const startTime = availabilityBlockStart?.value;
  const endTime = availabilityBlockEnd?.value;
  const hours = Number(availabilityBlockHours?.value || 2);
  const gapMinutes = Number(availabilityBlockGap?.value || 0);
  const notes = String(availabilityBlockNotes?.value || "").trim();
  const selectedDays = [...document.querySelectorAll('input[name="availabilityDays"]:checked')]
    .map((input) => Number(input.value));

  if (!weekStartValue || !startTime || !endTime || !selectedDays.length) {
    setAdminDataStatus("Choose a week, days, start time and finish time before publishing slots.", "error");
    return;
  }

  if (!Number.isFinite(hours) || hours <= 0) {
    setAdminDataStatus("Choose a valid lesson length before publishing slots.", "error");
    return;
  }

  const durationMinutes = hours * 60;
  const weekStart = getStartOfWeek(buildLocalDateTime(weekStartValue, "00:00"));
  const existingStarts = new Set((adminData.availabilitySlots || []).map((slot) => String(slot.starts_at || "").slice(0, 16)));
  const newSlots = [];

  selectedDays.forEach((dayValue) => {
    const dayOffset = dayValue === 0 ? 6 : dayValue - 1;
    const day = new Date(weekStart);
    day.setDate(weekStart.getDate() + dayOffset);

    const dayKey = getDateKey(day);
    let cursor = buildLocalDateTime(dayKey, startTime);
    const finish = buildLocalDateTime(dayKey, endTime);

    while (addMinutes(cursor, durationMinutes) <= finish) {
      const startsAt = `${getDateKey(cursor)}T${formatClock(cursor)}:00`;
      const duplicateKey = startsAt.slice(0, 16);

      if (!existingStarts.has(duplicateKey)) {
        newSlots.push({
          starts_at: startsAt,
          label: formatAdminDate(startsAt),
          hours,
          status: "Available",
          notes,
        });
        existingStarts.add(duplicateKey);
      }

      cursor = addMinutes(cursor, durationMinutes + gapMinutes);
    }
  });

  if (!newSlots.length) {
    setAdminDataStatus("No new slots were created. Those times may already exist, or the time window is too short.", "error");
    return;
  }

  isPublishingWeeklyAvailability = true;
  setFormSubmitButtonState(weeklyAvailabilityForm, true, "Publishing...", "Publish lesson times");
  setAdminDataStatus(`Publishing ${newSlots.length} diary slot${newSlots.length === 1 ? "" : "s"}...`);

  try {
    const { error } = await adminClient.from("lesson_availability_slots").insert(newSlots);

    if (error) {
      setAdminDataStatus(getAdminError(error), "error");
      return;
    }

    currentDiaryWeekStart = weekStart;
    await loadAdminData();
    setAdminDataStatus(`${newSlots.length} diary slot${newSlots.length === 1 ? "" : "s"} published.`, "success");
  } finally {
    isPublishingWeeklyAvailability = false;
    setFormSubmitButtonState(weeklyAvailabilityForm, false, "Publishing...", "Publish lesson times");
  }
}

async function updateAvailabilitySlot(id, changes) {
  if (!id) return;
  setAdminDataStatus("Updating diary slot...");

  const { error } = await adminClient
    .from("lesson_availability_slots")
    .update({
      ...changes,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    setAdminDataStatus(getAdminError(error), "error");
    return;
  }

  await loadAdminData();
}

async function deleteAvailabilitySlot(slot) {
  if (!slot?.id) return;
  const confirmed = window.confirm(`Delete ${formatAdminDate(slot.starts_at)} from the diary? Students will no longer see it.`);
  if (!confirmed) return;

  setAdminDataStatus("Deleting diary slot...");

  const { error } = await adminClient
    .from("lesson_availability_slots")
    .delete()
    .eq("id", slot.id);

  if (error) {
    setAdminDataStatus(getAdminError(error), "error");
    return;
  }

  await loadAdminData();
  setAdminDataStatus("Diary slot deleted.", "success");
}

async function assignSlotToStudent(event) {
  event.preventDefault();

  if (isAssigningStudentSlot) {
    return;
  }

  const slotId = assignSlotSelect?.value;
  const studentKey = assignStudentSelect?.value;
  const slot = adminData.availabilitySlots.find((item) => item.id === slotId);
  const student = getApprovedStudentRecords().find((item) => getStudentMergeKey(item) === studentKey);

  if (!slot || !student) {
    setAdminDataStatus("Choose both an available slot and an approved student before booking.", "error");
    return;
  }

  isAssigningStudentSlot = true;
  setFormSubmitButtonState(assignSlotForm, true, "Booking student...", "Book student");
  setAdminDataStatus("Booking selected student...");

  try {
    const { data: savedLesson, error: lessonError } = await adminClient
      .from("lessons")
      .insert({
        student_id: student.student_id || null,
        student_email: student.email,
        availability_slot_id: slot.id,
        starts_at: slot.starts_at,
        status: "Confirmed",
        hours: Number(slot.hours || 2),
        topic: "Driving lesson",
        notes: slot.notes || "",
      })
      .select("id")
      .single();

    if (lessonError) {
      setAdminDataStatus(getAdminError(lessonError), "error");
      return;
    }

    const { error: slotError } = await adminClient
      .from("lesson_availability_slots")
      .update({
        status: "Booked",
        assigned_student_id: student.student_id || null,
        assigned_student_email: student.email,
        updated_at: new Date().toISOString(),
      })
      .eq("id", slot.id);

    if (slotError) {
      if (savedLesson?.id) {
        await adminClient.from("lessons").delete().eq("id", savedLesson.id);
      }
      setAdminDataStatus(getAdminError(slotError), "error");
      return;
    }

    await loadAdminData();
    setAdminDataStatus("Student booked into that diary slot.", "success");
  } finally {
    isAssigningStudentSlot = false;
    setFormSubmitButtonState(assignSlotForm, false, "Booking student...", "Book student");
  }
}

async function confirmSlotRequest(request) {
  if (!request?.id) return;
  setAdminDataStatus("Confirming lesson...");

  const availabilitySlot = request.availability_slot_id
    ? adminData.availabilitySlots.find((slot) => slot.id === request.availability_slot_id)
    : null;

  const { data: savedLesson, error: lessonError } = await adminClient
    .from("lessons")
    .insert({
      student_id: request.student_id,
      student_email: request.student_email,
      availability_slot_id: availabilitySlot?.id || request.availability_slot_id || null,
      starts_at: availabilitySlot?.starts_at || request.requested_slot,
      status: "Confirmed",
      hours: Number(availabilitySlot?.hours || 2),
      topic: "Driving lesson",
      notes: availabilitySlot?.notes || "",
    })
    .select("id")
    .single();

  if (lessonError) {
    setAdminDataStatus(getAdminError(lessonError), "error");
    return;
  }

  if (availabilitySlot?.id) {
    const { error: slotError } = await adminClient
      .from("lesson_availability_slots")
      .update({
        status: "Booked",
        assigned_student_id: request.student_id || null,
        assigned_student_email: request.student_email,
        updated_at: new Date().toISOString(),
      })
      .eq("id", availabilitySlot.id);

    if (slotError) {
      if (savedLesson?.id) {
        await adminClient.from("lessons").delete().eq("id", savedLesson.id);
      }
      setAdminDataStatus(getAdminError(slotError), "error");
      return;
    }
  }

  const { error: requestError } = await adminClient
    .from("lesson_slot_requests")
    .update({ status: "Confirmed" })
    .eq("id", request.id);

  if (requestError) {
    if (savedLesson?.id) {
      await adminClient.from("lessons").delete().eq("id", savedLesson.id);
    }
    if (availabilitySlot?.id) {
      await adminClient
        .from("lesson_availability_slots")
        .update({
          status: availabilitySlot.status || "Available",
          assigned_student_id: availabilitySlot.assigned_student_id || null,
          assigned_student_email: availabilitySlot.assigned_student_email || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", availabilitySlot.id);
    }
    setAdminDataStatus(getAdminError(requestError), "error");
    return;
  }

  await loadAdminData();
  setAdminDataStatus("Lesson confirmed.", "success");
}

async function approveCancellationRequest(request) {
  if (!request?.id) return;
  setAdminDataStatus("Approving cancellation...");

  let lessonUpdate = adminClient
    .from("lessons")
    .update({ status: "Cancelled by student" })
    .eq("starts_at", request.requested_slot);

  if (request.student_id) {
    lessonUpdate = lessonUpdate.eq("student_id", request.student_id);
  } else if (request.student_email) {
    lessonUpdate = lessonUpdate.eq("student_email", request.student_email);
  }

  const { error: lessonError } = await lessonUpdate;

  if (lessonError) {
    setAdminDataStatus(getAdminError(lessonError), "error");
    return;
  }

  if (request.availability_slot_id) {
    const { error: slotError } = await adminClient
      .from("lesson_availability_slots")
      .update({
        status: "Available",
        assigned_student_id: null,
        assigned_student_email: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", request.availability_slot_id);

    if (slotError) {
      let lessonRollback = adminClient
        .from("lessons")
        .update({ status: "Confirmed" })
        .eq("starts_at", request.requested_slot);

      if (request.student_id) {
        lessonRollback = lessonRollback.eq("student_id", request.student_id);
      } else if (request.student_email) {
        lessonRollback = lessonRollback.eq("student_email", request.student_email);
      }

      await lessonRollback;
      setAdminDataStatus(getAdminError(slotError), "error");
      return;
    }
  }

  const { error: requestError } = await adminClient
    .from("lesson_slot_requests")
    .update({ status: "Cancellation approved" })
    .eq("id", request.id);

  if (requestError) {
    let lessonRollback = adminClient
      .from("lessons")
      .update({ status: "Confirmed" })
      .eq("starts_at", request.requested_slot);

    if (request.student_id) {
      lessonRollback = lessonRollback.eq("student_id", request.student_id);
    } else if (request.student_email) {
      lessonRollback = lessonRollback.eq("student_email", request.student_email);
    }

    await lessonRollback;

    if (request.availability_slot_id) {
      await adminClient
        .from("lesson_availability_slots")
        .update({
          status: "Booked",
          assigned_student_id: request.student_id || null,
          assigned_student_email: request.student_email || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", request.availability_slot_id);
    }

    setAdminDataStatus(getAdminError(requestError), "error");
    return;
  }

  await loadAdminData();
  setAdminDataStatus("Cancellation approved.", "success");
}

async function releaseLessonAvailabilitySlot(lesson) {
  const slotId = lesson?.availability_slot_id;
  if (!slotId) return { error: null };

  const { error } = await adminClient
    .from("lesson_availability_slots")
    .update({
      status: "Available",
      assigned_student_id: null,
      assigned_student_email: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", slotId);

  return { error };
}

async function reserveLessonAvailabilitySlot(lesson) {
  const slotId = lesson?.availability_slot_id;
  if (!slotId) return { error: null };

  const { data: slot, error: slotLoadError } = await adminClient
    .from("lesson_availability_slots")
    .select("id,status,assigned_student_id,assigned_student_email")
    .eq("id", slotId)
    .maybeSingle();

  if (slotLoadError) {
    return { error: slotLoadError };
  }

  if (!slot?.id) {
    return { error: { message: "The original diary slot could not be found for this lesson." } };
  }

  const status = String(slot.status || "").toLowerCase();
  const sameAssignedStudent = Boolean(
    (lesson.student_id && slot.assigned_student_id && slot.assigned_student_id === lesson.student_id) ||
      (lesson.student_email && slot.assigned_student_email && String(slot.assigned_student_email).toLowerCase() === String(lesson.student_email).toLowerCase()),
  );

  if (status === "booked" && sameAssignedStudent) {
    return { error: null };
  }

  if (status !== "available" && status !== "booked") {
    return { error: { message: "The original diary slot is no longer available to rebook." } };
  }

  if (status === "booked" && !sameAssignedStudent) {
    return { error: { message: "The original diary slot has already been booked by someone else." } };
  }

  const { error } = await adminClient
    .from("lesson_availability_slots")
    .update({
      status: "Booked",
      assigned_student_id: lesson.student_id || null,
      assigned_student_email: lesson.student_email || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", slotId);

  return { error };
}

async function cancelLessonBooking(lessonOrId, options = {}) {
  const lesson = typeof lessonOrId === "object"
    ? lessonOrId
    : adminData.lessons.find((item) => item.id === lessonOrId);
  const id = lesson?.id || lessonOrId;

  if (!id) return false;
  if (isCancelledLessonStatus(lesson?.status)) {
    setAdminDataStatus("This lesson is already cancelled.", "success");
    return true;
  }

  if (!options.skipConfirm) {
    const confirmed = window.confirm("Cancel this booked lesson and release the diary slot?");
    if (!confirmed) return false;
  }

  if (!options.silent) {
    setAdminDataStatus("Cancelling booked lesson...");
  }

  const nextStatus = String(options.status || "Cancelled by instructor");

  const { error: lessonError } = await adminClient
    .from("lessons")
    .update({ status: nextStatus })
    .eq("id", id);

  if (lessonError) {
    if (!options.silent) {
      setAdminDataStatus(getAdminError(lessonError), "error");
    }
    return false;
  }

  const { error: slotError } = await releaseLessonAvailabilitySlot(lesson);
  if (slotError) {
    await adminClient
      .from("lessons")
      .update({ status: lesson?.status || "Confirmed" })
      .eq("id", id);

    if (!options.silent) {
      setAdminDataStatus(getAdminError(slotError), "error");
    }
    return false;
  }

  if (!options.silent) {
    await loadAdminData();
    setAdminDataStatus(`${formatLessonStatusLabel(nextStatus)} recorded and the diary slot was released.`, "success");
  }

  return true;
}

async function markLessonNoShow(lessonOrId, options = {}) {
  const lesson = typeof lessonOrId === "object"
    ? lessonOrId
    : adminData.lessons.find((item) => item.id === lessonOrId);
  const id = lesson?.id || lessonOrId;
  const shouldChargeStudent = Boolean(options.chargeStudent);

  if (!id) return;
  if (isNoShowLessonStatus(lesson?.status)) {
    setAdminDataStatus("This lesson is already marked as a no-show.", "success");
    return;
  }

  const { balance, error: balanceError } = shouldChargeStudent ? await getPaymentBalanceForLesson(lesson || { id }) : { balance: null, error: null };
  if (balanceError) {
    setAdminDataStatus(balanceError, "error");
    return;
  }

  const remainingHours = shouldChargeStudent ? getLessonRemainingHours(balance) : 0;
  const lessonHours = shouldChargeStudent ? getLessonDurationHours(lesson) : 0;
  const confirmationMessage = !shouldChargeStudent
    ? "Mark this booked lesson as a no-show? This closes the lesson without changing paid hours."
    : !balance
      ? "Mark this booked lesson as a no-show and try to charge it? No paid balance is linked to this student yet, so no hours can be deducted."
      : remainingHours <= 0
        ? "Mark this booked lesson as a no-show and charge it? This student has no paid hours remaining."
        : remainingHours < lessonHours
          ? `Mark this booked lesson as a no-show and charge it? Only ${remainingHours} paid hour${remainingHours === 1 ? "" : "s"} remain for a ${lessonHours}-hour lesson.`
          : "Mark this booked lesson as a no-show and charge it? This will reduce the student's remaining paid hours.";
  const confirmed = window.confirm(confirmationMessage);
  if (!confirmed) return;
  const summaryPrompt = shouldChargeStudent
    ? "Add a short no-show note (optional). Include why the missed lesson is still being charged if needed."
    : "Add a short no-show note (optional).";
  const summaryInput = window.prompt(summaryPrompt, lesson?.summary || "");

  setAdminDataStatus(shouldChargeStudent ? "Marking lesson as chargeable no-show..." : "Marking lesson as no-show...");
  const nextStatus = shouldChargeStudent ? "No-show charged" : "No-show";

  const { error } = await adminClient
    .from("lessons")
    .update({
      status: nextStatus,
      summary: summaryInput === null ? (lesson?.summary || null) : summaryInput.trim(),
    })
    .eq("id", id);

  if (error) {
    setAdminDataStatus(getAdminError(error), "error");
    return;
  }

  if (shouldChargeStudent) {
    const paymentResult = await consumeLessonPaymentCredit({
      ...(lesson || { id }),
      status: nextStatus,
      summary: summaryInput === null ? (lesson?.summary || null) : summaryInput.trim(),
    });
    await loadAdminData();

    if (paymentResult.status === "error") {
      await adminClient
        .from("lessons")
        .update({
          status: lesson?.status || "Confirmed",
          summary: lesson?.summary || null,
        })
        .eq("id", id);
      await loadAdminData();
      setAdminDataStatus(`Lesson marked as a no-show, but the charge could not be applied. ${paymentResult.message}`, "error");
      return;
    }

    if (paymentResult.status === "warning" || paymentResult.status === "skipped") {
      await adminClient
        .from("lessons")
        .update({
          status: "No-show",
          summary: summaryInput === null ? (lesson?.summary || null) : summaryInput.trim(),
        })
        .eq("id", id);
      await loadAdminData();
      setAdminDataStatus(`Lesson marked as a no-show, but no credit was deducted. ${paymentResult.message}`, "error");
      return;
    }

    setAdminDataStatus("Lesson marked as a no-show and the student's paid hours were deducted.", "success");
    return;
  }

  await loadAdminData();
  setAdminDataStatus("Lesson marked as a no-show.", "success");
}

async function reopenClosedLesson(lessonOrId) {
  const lesson = typeof lessonOrId === "object"
    ? lessonOrId
    : adminData.lessons.find((item) => item.id === lessonOrId);
  const id = lesson?.id || lessonOrId;

  if (!id) return;

  const status = String(lesson?.status || "").toLowerCase();
  const isChargedNoShow = status === "no-show charged";
  const isNoShow = isNoShowLessonStatus(status);
  const isCancelled = isCancelledLessonStatus(status);

  if (!isChargedNoShow && !isNoShow && !isCancelled) {
    setAdminDataStatus("This lesson is not in the closed lesson list.", "error");
    return;
  }

  const confirmationMessage = isChargedNoShow
    ? "Reopen this charged no-show? This will return the lesson to confirmed and restore the student's paid hours."
    : "Reopen this closed lesson and return it to confirmed status?";
  const confirmed = window.confirm(confirmationMessage);
  if (!confirmed) return;

  setAdminDataStatus("Reopening lesson...");

  const { error: lessonError } = await adminClient
    .from("lessons")
    .update({
      status: "Confirmed",
    })
    .eq("id", id);

  if (lessonError) {
    setAdminDataStatus(getAdminError(lessonError), "error");
    return;
  }

  const { error: slotError } = await reserveLessonAvailabilitySlot(lesson || { id });
  if (slotError) {
    await adminClient
      .from("lessons")
      .update({ status: lesson?.status || "Cancelled by instructor" })
      .eq("id", id);
    setAdminDataStatus(getAdminError(slotError), "error");
    return;
  }

  if (isChargedNoShow) {
    const paymentResult = await restoreLessonPaymentCredit(lesson || { id });
    await loadAdminData();

    if (paymentResult.status === "error") {
      await adminClient
        .from("lessons")
        .update({ status: lesson?.status || "No-show charged" })
        .eq("id", id);
      await releaseLessonAvailabilitySlot(lesson || { id });
      await loadAdminData();
      setAdminDataStatus(`Lesson reopened, but the paid hours could not be restored. ${paymentResult.message}`, "error");
      return;
    }

    if (paymentResult.status === "warning") {
      setAdminDataStatus(paymentResult.message, "error");
      return;
    }

    if (paymentResult.status === "skipped") {
      setAdminDataStatus(`Lesson reopened. ${paymentResult.message}`, "success");
      return;
    }

    setAdminDataStatus("Lesson reopened and the student's paid hours were restored.", "success");
    return;
  }

  await loadAdminData();
  setAdminDataStatus("Lesson reopened and returned to confirmed status.", "success");
}

function getLessonDurationHours(lesson) {
  const hours = Number(lesson?.hours || lesson?.duration_hours || 2);
  return Number.isFinite(hours) && hours > 0 ? hours : 2;
}

function calculateCreditPenceUsed(balance, lessonHours) {
  const purchasedHours = Number(balance?.purchased_hours || 0);
  const usedHours = Number(balance?.used_hours || 0);
  const remainingHours = Math.max(purchasedHours - usedHours, 0);
  const currentBalancePence = Math.max(Number(balance?.account_balance_pence || 0), 0);

  if (!remainingHours || !currentBalancePence) {
    return 0;
  }

  return Math.min(currentBalancePence, Math.round((currentBalancePence / remainingHours) * lessonHours));
}

async function getPaymentBalanceForLesson(lesson) {
  const studentId = lesson?.student_id || null;
  const studentEmail = String(lesson?.student_email || "").toLowerCase();

  if (!studentId && !studentEmail) {
    return { balance: null, error: null };
  }

  let balanceQuery = adminClient
    .from("student_payment_balances")
    .select("id,student_id,student_email,purchased_hours,used_hours,account_balance_pence");

  if (studentId) {
    balanceQuery = balanceQuery.eq("student_id", studentId);
  } else {
    balanceQuery = balanceQuery.eq("student_email", studentEmail);
  }

  const { data: balance, error: balanceError } = await balanceQuery.maybeSingle();

  if (balanceError) {
    return { balance: null, error: getAdminError(balanceError) };
  }

  return { balance: balance || null, error: null };
}

function findLessonUsageEventInMemory(lessonId) {
  if (!lessonId) return null;

  return adminData.paymentEvents.find((event) =>
    event.event_type === "lesson_credit_used" &&
    event.event_status === "completed" &&
    event.metadata?.lesson_id === lessonId,
  ) || null;
}

async function getLessonUsageEvent(lessonId) {
  if (!lessonId) return { event: null, error: null };

  const existingEvent = findLessonUsageEventInMemory(lessonId);
  if (existingEvent) {
    return { event: existingEvent, error: null };
  }

  const { data, error } = await adminClient
    .from("student_payment_events")
    .select("id,student_id,student_email,event_type,event_status,plan_key,hours_delta,amount_pence,currency,metadata,created_at")
    .eq("event_type", "lesson_credit_used")
    .eq("event_status", "completed")
    .contains("metadata", { lesson_id: lessonId })
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    return { event: null, error: getAdminError(error) };
  }

  return { event: data || null, error: null };
}

async function consumeLessonPaymentCredit(lesson) {
  const studentId = lesson?.student_id || null;
  const studentEmail = String(lesson?.student_email || "").toLowerCase();

  if (!studentId && !studentEmail) {
    return { status: "skipped", message: "No student account was linked to this lesson." };
  }

  const { event: existingUsageEvent, error: usageEventError } = await getLessonUsageEvent(lesson?.id);
  if (usageEventError) {
    return { status: "error", message: usageEventError };
  }

  if (existingUsageEvent) {
    return { status: "skipped", message: "Payment credit was already consumed for this lesson." };
  }

  const { balance, error: balanceError } = await getPaymentBalanceForLesson(lesson);
  if (balanceError) {
    return { status: "error", message: balanceError };
  }

  if (!balance) {
    return { status: "skipped", message: "No paid balance was found for this student yet." };
  }

  const lessonHours = getLessonDurationHours(lesson);
  const remainingHours = getLessonRemainingHours(balance);
  const currentUsedHours = Number(balance.used_hours || 0);
  const currentBalancePence = Math.max(Number(balance.account_balance_pence || 0), 0);
  const creditPenceUsed = calculateCreditPenceUsed(balance, lessonHours);
  const nextBalancePence = Math.max(currentBalancePence - creditPenceUsed, 0);
  const now = new Date().toISOString();

  if (remainingHours <= 0) {
    return { status: "warning", message: "This student had no paid hours remaining, so no payment credit was deducted." };
  }

  const { error: updateError } = await adminClient
    .from("student_payment_balances")
    .update({
      used_hours: currentUsedHours + lessonHours,
      account_balance_pence: nextBalancePence,
      updated_at: now,
    })
    .eq("id", balance.id);

  if (updateError) {
    return { status: "error", message: getAdminError(updateError) };
  }

  const { error: eventError } = await adminClient
    .from("student_payment_events")
    .insert({
      student_id: balance.student_id || studentId,
      student_email: balance.student_email || studentEmail || null,
      event_type: "lesson_credit_used",
      event_status: "completed",
      plan_key: "lesson_complete",
      hours_delta: -lessonHours,
      amount_pence: -creditPenceUsed,
      currency: "gbp",
      metadata: {
        lesson_id: lesson.id,
        starts_at: lesson.starts_at || lesson.lesson_date || null,
        topic: lesson.topic || "Driving lesson",
        delivered_at: lesson.delivered_at || now,
      },
      updated_at: now,
    });

  if (eventError) {
    const { error: revertError } = await adminClient
      .from("student_payment_balances")
      .update({
        used_hours: currentUsedHours,
        account_balance_pence: currentBalancePence,
        updated_at: now,
      })
      .eq("id", balance.id);

    if (revertError) {
      return {
        status: "error",
        message: `Payment history could not be saved and the balance rollback failed. ${getAdminError(revertError)}`,
      };
    }

    return {
      status: "error",
      message: "Payment history could not be saved, so the balance change was rolled back.",
    };
  }

  return { status: "success", message: "Lesson marked as delivered and payment balance updated." };
}

async function restoreLessonPaymentCredit(lesson) {
  const { event: usageEvent, error: usageEventError } = await getLessonUsageEvent(lesson?.id);
  if (usageEventError) {
    return { status: "error", message: usageEventError };
  }

  if (!usageEvent) {
    return { status: "skipped", message: "No payment credit had been consumed for this lesson." };
  }

  const { balance, error: balanceError } = await getPaymentBalanceForLesson(lesson);
  if (balanceError) {
    return { status: "error", message: balanceError };
  }

  if (!balance) {
    return { status: "error", message: "No paid balance record was found to restore this lesson against." };
  }

  const restoredHours = Math.abs(Number(usageEvent.hours_delta || 0));
  const restoredPence = Math.abs(Number(usageEvent.amount_pence || 0));
  const now = new Date().toISOString();
  const currentUsedHours = Number(balance.used_hours || 0);
  const currentBalancePence = Math.max(Number(balance.account_balance_pence || 0), 0);
  const restoredUsedHours = Math.max(currentUsedHours - restoredHours, 0);
  const restoredBalancePence = Math.max(currentBalancePence + restoredPence, 0);

  const { error: updateError } = await adminClient
    .from("student_payment_balances")
    .update({
      used_hours: restoredUsedHours,
      account_balance_pence: restoredBalancePence,
      updated_at: now,
    })
    .eq("id", balance.id);

  if (updateError) {
    return { status: "error", message: getAdminError(updateError) };
  }

  const { error: eventError } = await adminClient
    .from("student_payment_events")
    .insert({
      student_id: balance.student_id || lesson?.student_id || null,
      student_email: balance.student_email || lesson?.student_email || null,
      event_type: "lesson_credit_refunded",
      event_status: "completed",
      plan_key: "lesson_reopened",
      hours_delta: restoredHours,
      amount_pence: restoredPence,
      currency: usageEvent.currency || "gbp",
      metadata: {
        lesson_id: lesson?.id || null,
        reversal_of_event_id: usageEvent.id,
        starts_at: lesson?.starts_at || lesson?.lesson_date || null,
        topic: lesson?.topic || "Driving lesson",
      },
      updated_at: now,
    });

  if (eventError) {
    const { error: revertError } = await adminClient
      .from("student_payment_balances")
      .update({
        used_hours: currentUsedHours,
        account_balance_pence: currentBalancePence,
        updated_at: now,
      })
      .eq("id", balance.id);

    if (revertError) {
      return {
        status: "error",
        message: `Refund history could not be saved and the balance rollback failed. ${getAdminError(revertError)}`,
      };
    }

    return {
      status: "error",
      message: "Refund history could not be saved, so the balance restore was rolled back.",
    };
  }

  return { status: "success", message: "Lesson delivery was undone and the student's paid hours were restored." };
}

async function markLessonDelivered(lessonOrId) {
  const lesson = typeof lessonOrId === "object"
    ? lessonOrId
    : adminData.lessons.find((item) => item.id === lessonOrId);
  const id = lesson?.id || lessonOrId;

  if (!id) return;
  if (isCompletedLessonStatus(lesson?.status)) {
    setAdminDataStatus("This lesson has already been marked as delivered.", "success");
    return;
  }

  const { balance, error: balanceError } = await getPaymentBalanceForLesson(lesson || { id });
  if (balanceError) {
    setAdminDataStatus(balanceError, "error");
    return;
  }

  const remainingHours = getLessonRemainingHours(balance);
  const lessonHours = getLessonDurationHours(lesson);
  const confirmationMessage = !balance
    ? "Mark this lesson as delivered? No paid balance is linked to this student yet."
    : remainingHours <= 0
      ? "Mark this lesson as delivered? This student has no paid hours remaining."
      : remainingHours < lessonHours
        ? `Mark this lesson as delivered? Only ${remainingHours} paid hour${remainingHours === 1 ? "" : "s"} remain for a ${lessonHours}-hour lesson.`
        : "Mark this lesson as delivered? This will reduce the student's remaining paid hours.";
  const confirmed = window.confirm(confirmationMessage);
  if (!confirmed) return;
  const summaryInput = window.prompt("Add a short delivery note or lesson summary (optional).", lesson?.summary || "");

  setAdminDataStatus("Marking lesson as delivered...");
  const deliveredAt = new Date().toISOString();

  const { error } = await adminClient
    .from("lessons")
    .update({
      status: "Delivered",
      delivered_at: deliveredAt,
      summary: summaryInput === null ? (lesson?.summary || null) : summaryInput.trim(),
    })
    .eq("id", id);

  if (error) {
    setAdminDataStatus(getAdminError(error), "error");
    return;
  }

  const paymentResult = await consumeLessonPaymentCredit({
    ...(lesson || { id }),
    delivered_at: deliveredAt,
    summary: summaryInput === null ? (lesson?.summary || null) : summaryInput.trim(),
  });
  await loadAdminData();

  if (paymentResult.status === "error") {
    await adminClient
      .from("lessons")
      .update({
        status: lesson?.status || "Confirmed",
        delivered_at: null,
        summary: lesson?.summary || null,
      })
      .eq("id", id);
    await loadAdminData();
    setAdminDataStatus(`Lesson marked as delivered, but the payment balance could not update. ${paymentResult.message}`, "error");
    return;
  }

  if (paymentResult.status === "warning") {
    setAdminDataStatus(paymentResult.message, "error");
    return;
  }

  if (paymentResult.status === "skipped") {
    setAdminDataStatus(`Lesson marked as delivered. ${paymentResult.message}`, "success");
    return;
  }

  setAdminDataStatus("Lesson marked as delivered and the student's remaining hours were updated.", "success");
}

async function undoLessonDelivered(lessonOrId) {
  const lesson = typeof lessonOrId === "object"
    ? lessonOrId
    : adminData.lessons.find((item) => item.id === lessonOrId);
  const id = lesson?.id || lessonOrId;

  if (!id) return;
  if (!isCompletedLessonStatus(lesson?.status)) {
    setAdminDataStatus("This lesson is not marked as delivered.", "error");
    return;
  }

  const confirmed = window.confirm("Undo this delivered lesson? This will restore the student's paid hours.");
  if (!confirmed) return;

  setAdminDataStatus("Undoing delivered lesson...");

  const { error } = await adminClient
    .from("lessons")
    .update({
      status: "Confirmed",
      delivered_at: null,
    })
    .eq("id", id);

  if (error) {
    setAdminDataStatus(getAdminError(error), "error");
    return;
  }

  const paymentResult = await restoreLessonPaymentCredit(lesson || { id });
  await loadAdminData();

  if (paymentResult.status === "error") {
    await adminClient
      .from("lessons")
      .update({
        status: lesson?.status || "Delivered",
        delivered_at: lesson?.delivered_at || new Date().toISOString(),
      })
      .eq("id", id);
    await loadAdminData();
    setAdminDataStatus(`Lesson reopened, but the payment balance could not be restored. ${paymentResult.message}`, "error");
    return;
  }

  if (paymentResult.status === "warning") {
    setAdminDataStatus(paymentResult.message, "error");
    return;
  }

  if (paymentResult.status === "skipped") {
    setAdminDataStatus(`Lesson reopened. ${paymentResult.message}`, "success");
    return;
  }

  setAdminDataStatus(paymentResult.message, "success");
}

function setAdminSession(session) {
  const userEmail = session?.user?.email || "";
  const isAdmin = isAdminSession(session);

  adminSignedOut?.toggleAttribute("hidden", Boolean(isAdmin));
  adminPanel?.toggleAttribute("hidden", !isAdmin);
  adminLoginCard?.classList.toggle("is-admin-dashboard", isAdmin);

  if (adminEmail && userEmail) {
    adminEmail.textContent = userEmail;
  }

  if (session && !isAdmin) {
    setAdminStatus("This account is signed in, but it is not approved as an admin.", "error");
  }

  if (isAdmin) {
    setAdminStatus("");
    loadAdminData();
  }
}

if (!adminClient) {
  setAdminStatus("Admin login is not connected to Supabase yet.", "error");
} else {
  adminClient.auth.getSession().then(({ data, error }) => {
    if (error) {
      setAdminStatus(getAdminError(error), "error");
      return;
    }

    setAdminSession(data.session);
  });

  adminClient.auth.onAuthStateChange((_event, session) => {
    setAdminSession(session);
  });
}

adminLoginForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!adminClient) {
    setAdminStatus("Admin login is not connected to Supabase yet.", "error");
    return;
  }

  const button = adminLoginForm.querySelector("button[type='submit']");
  const formData = new FormData(adminLoginForm);
  const username = String(formData.get("username") || "").trim();
  const normalisedUsername = username.toLowerCase();
  const normalisedAdminUsername = adminUsername.toLowerCase();
  const email = normalisedUsername === normalisedAdminUsername ? adminUsernameEmail : normalisedUsername;

  if (!adminEmails.includes(email)) {
    setAdminStatus(`Use the admin username "${adminUsername}" or an approved admin email address.`, "error");
    return;
  }

  button.disabled = true;
  button.textContent = "Signing in...";
  setAdminStatus("");

  const { data, error } = await adminClient.auth.signInWithPassword({
    email,
    password: formData.get("password"),
  });

  button.disabled = false;
  button.textContent = "Sign in";

  if (error) {
    setAdminStatus(getAdminError(error), "error");
    return;
  }

  setAdminSession(data.session);
});

adminMagicLinkButton?.addEventListener("click", async () => {
  if (!adminClient) {
    setAdminStatus("Admin login is not connected to Supabase yet.", "error");
    return;
  }

  adminMagicLinkButton.disabled = true;
  adminMagicLinkButton.textContent = "Sending login link...";
  setAdminStatus("");

  const { error } = await adminClient.auth.signInWithOtp({
    email: adminUsernameEmail,
    options: {
      emailRedirectTo: getAdminRedirectUrl(),
    },
  });

  adminMagicLinkButton.disabled = false;
  adminMagicLinkButton.textContent = "Email me an admin login link";

  if (error) {
    setAdminStatus(getAdminError(error), "error");
    return;
  }

  setAdminStatus(`Login link sent to ${adminUsernameEmail}. Open it on this device to access admin.`, "success");
});

adminSignOutButton?.addEventListener("click", async () => {
  if (!adminClient) return;

  await adminClient.auth.signOut();
  setAdminStatus("Signed out.", "success");
});

adminRefreshButton?.addEventListener("click", () => {
  loadAdminData();
});

addStudentButton?.addEventListener("click", () => {
  openStudentManager(null);
});

adminSearchInput?.addEventListener("input", () => {
  applyAdminFiltersFromControls();
  rerenderAdminBoard();
});

adminFocusFilter?.addEventListener("change", () => {
  applyAdminFiltersFromControls();
  rerenderAdminBoard();
});

adminPaymentFilter?.addEventListener("change", () => {
  applyAdminFiltersFromControls();
  rerenderAdminBoard();
});

closeStudentDialog?.addEventListener("click", () => {
  studentManageDialog?.close();
});

studentManageDialog?.addEventListener("click", (event) => {
  if (event.target === studentManageDialog) studentManageDialog.close();
});

studentManageDialog?.addEventListener("close", () => {
  resetStudentPaymentControls();
  activeLessonRecordId = null;
});

studentManageForm?.addEventListener("submit", saveStudentDetails);
createLessonRecordButton?.addEventListener("click", () => {
  const nextLesson = getProgressEligibleLessons(activeStudent).find((lesson) => !lessonHasProgressRecord(lesson))
    || getProgressEligibleLessons(activeStudent)[0];

  if (!nextLesson) {
    resetLessonRecordForm(activeStudent);
    setAdminDataStatus("This student has no eligible lesson to attach a progress record to yet.", "error");
    return;
  }

  loadLessonRecordIntoForm(activeStudent, nextLesson.id);
});
lessonRecordSelect?.addEventListener("change", (event) => {
  const lessonId = String(event.target?.value || "");
  if (lessonId) {
    loadLessonRecordIntoForm(activeStudent, lessonId);
  } else {
    resetLessonRecordForm(activeStudent);
  }
});
lessonRecordTopic?.addEventListener("input", () => refreshLessonSummaryPreview());
lessonRecordNotes?.addEventListener("input", () => refreshLessonSummaryPreview());
lessonRecordHomework?.addEventListener("input", () => refreshLessonSummaryPreview());
saveLessonRecordButton?.addEventListener("click", saveLessonProgressRecord);
applyStudentPaymentButton?.addEventListener("click", applyStudentPaymentAdjustment);
removeStudentButton?.addEventListener("click", () => removeStudentAccess());
availabilityForm?.addEventListener("submit", createAvailabilitySlot);
weeklyAvailabilityForm?.addEventListener("submit", createWeeklyAvailability);
assignSlotForm?.addEventListener("submit", assignSlotToStudent);

if (availabilityWeekStart) {
  availabilityWeekStart.value = formatDateInput(currentDiaryWeekStart);
}

previousDiaryWeek?.addEventListener("click", () => {
  currentDiaryWeekStart.setDate(currentDiaryWeekStart.getDate() - 7);
  if (availabilityWeekStart) availabilityWeekStart.value = formatDateInput(currentDiaryWeekStart);
  renderDiaryWeek(adminData.availabilitySlots);
});

todayDiaryWeek?.addEventListener("click", () => {
  currentDiaryWeekStart = getStartOfWeek(new Date());
  if (availabilityWeekStart) availabilityWeekStart.value = formatDateInput(currentDiaryWeekStart);
  renderDiaryWeek(adminData.availabilitySlots);
});

nextDiaryWeek?.addEventListener("click", () => {
  currentDiaryWeekStart.setDate(currentDiaryWeekStart.getDate() + 7);
  if (availabilityWeekStart) availabilityWeekStart.value = formatDateInput(currentDiaryWeekStart);
  renderDiaryWeek(adminData.availabilitySlots);
});
