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
const adminDataStatus = document.querySelector("#adminDataStatus");
const pendingLessonRequests = document.querySelector("#pendingLessonRequests");
const slotRequestList = document.querySelector("#slotRequestList");
const approvedStudentList = document.querySelector("#approvedStudentList");
const confirmedLessonList = document.querySelector("#confirmedLessonList");
const deliveredLessonList = document.querySelector("#deliveredLessonList");
const supportRequestList = document.querySelector("#supportRequestList");
const pendingRequestCount = document.querySelector("#pendingRequestCount");
const approvedStudentCount = document.querySelector("#approvedStudentCount");
const slotRequestCount = document.querySelector("#slotRequestCount");
const confirmedLessonCount = document.querySelector("#confirmedLessonCount");
const supportRequestCount = document.querySelector("#supportRequestCount");
const studentManageDialog = document.querySelector("#studentManageDialog");
const studentManageForm = document.querySelector("#studentManageForm");
const closeStudentDialog = document.querySelector("#closeStudentDialog");
const studentDialogTitle = document.querySelector("#studentDialogTitle");
const studentEditName = document.querySelector("#studentEditName");
const studentEditEmail = document.querySelector("#studentEditEmail");
const studentEditStatus = document.querySelector("#studentEditStatus");
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
  slotRequests: [],
  supportRequests: [],
  lessons: [],
  availabilitySlots: [],
  paymentBalances: [],
  paymentEvents: [],
};
let activeStudent = null;
let currentDiaryWeekStart = getStartOfWeek(new Date());

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
  return !["approved", "accepted", "active", "confirmed", "rejected", "declined", "waiting"].some((word) => value.includes(word));
}

function isApprovedStatus(status) {
  const value = String(status || "").toLowerCase();
  return ["approved", "accepted", "active", "confirmed"].some((word) => value.includes(word));
}

function isCancellationRequest(request) {
  const status = String(request?.status || "").toLowerCase();
  const label = String(request?.requested_label || "").toLowerCase();
  return status.includes("cancel") || label.includes("cancel lesson");
}

function sameStudent(record, student) {
  if (!record || !student) return false;
  const studentId = student.student_id;
  const studentEmail = String(student.email || "").toLowerCase();
  const recordEmail = String(record.email || record.student_email || "").toLowerCase();

  return Boolean(
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

function getApprovedStudentRecords(students = adminData.studentProfiles, requests = adminData.lessonRequests) {
  const approvedProfiles = (students || []).filter((student) => isApprovedStatus(student.lesson_status));
  const approvedFromRequests = (requests || [])
    .filter((request) => isApprovedStatus(request.status))
    .map((request) => ({
      student_id: request.student_id,
      email: request.email,
      name: request.name,
      lesson_status: request.status,
    }));

  const merged = new Map();
  [...approvedProfiles, ...approvedFromRequests].forEach((student) => {
    const key = getStudentMergeKey(student);
    if (!key) return;
    const existing = merged.get(key) || {};
    merged.set(key, {
      ...existing,
      ...student,
      student_id: existing.student_id || student.student_id,
      name: existing.name || existing.full_name || student.name || student.full_name,
      full_name: existing.full_name || existing.name || student.full_name || student.name,
      email: existing.email || student.email,
    });
  });

  return [...merged.values()].map((student) => {
    const latestRequest = (requests || []).find((request) => sameStudent(request, student));
    return {
      ...latestRequest,
      ...student,
      latest_request_id: latestRequest?.id,
    };
  });
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
  const type = String(event?.event_type || "payment").replaceAll("_", " ");
  return type.charAt(0).toUpperCase() + type.slice(1);
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

  const pending = (requests || []).filter((request) => isPendingStatus(request.status));
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

  const approved = getApprovedStudentRecords(students, requests);
  setCount(approvedStudentCount, approved.length);

  if (!approved.length) {
    approvedStudentList?.append(createEmptyState("No approved practical students yet."));
    return;
  }

  approved.forEach((student) => {
    const studentLessons = (lessons || []).filter((lesson) => sameStudent(lesson, student));
    const paymentBalance = findPaymentBalanceForStudent(student, paymentBalances);
    const completedHours = studentLessons
      .filter((lesson) => isCompletedLessonStatus(lesson.status))
      .reduce((total, lesson) => total + Number(lesson.hours || lesson.duration_hours || 2), 0);
    const purchasedHours = Number(paymentBalance?.purchased_hours || 0);
    const usedHours = Number(paymentBalance?.used_hours || 0);
    const remainingHours = Math.max(0, purchasedHours - usedHours);

    const item = buildAdminItem(
      getStudentName(student),
      student.email || "No email saved",
      [
        `Status: ${student.lesson_status || "Approved"}`,
        `Completed hours: ${completedHours}`,
        `Bookings: ${studentLessons.length}`,
        paymentBalance
          ? `Paid remaining: ${formatAdminHours(remainingHours)} hour${remainingHours === 1 ? "" : "s"}`
          : "Paid remaining: No paid hours recorded",
        paymentBalance ? `Paid used: ${formatAdminHours(usedHours)} of ${formatAdminHours(purchasedHours)} hours` : "",
        paymentBalance ? `Account balance: ${formatPoundsFromPence(paymentBalance.account_balance_pence)}` : "",
      ],
    );

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
    const item = buildAdminItem(
      formatPaymentEventTitle(event),
      `${event.event_status || "Recorded"} · ${formatAdminDate(event.created_at)}`,
      [
        event.plan_key ? `Plan: ${event.plan_key}` : "",
        hours ? `Hours: ${formatAdminHours(hours)}` : "",
        amount ? `Amount: ${formatPoundsFromPence(amount)}` : "",
      ],
    );
    studentHistoryList?.append(item);
  });
}

function openStudentManager(student) {
  activeStudent = student;

  if (studentDialogTitle) studentDialogTitle.textContent = getStudentName(student);
  if (studentEditName) studentEditName.value = student.name || student.full_name || "";
  if (studentEditEmail) studentEditEmail.value = student.email || "";
  if (studentEditStatus) studentEditStatus.value = student.lesson_status || "Approved";

  renderStudentHistory(student);
  studentManageDialog?.showModal();
}

function renderSlotRequests(slotRequests) {
  clearElement(slotRequestList);

  const activeRequests = (slotRequests || []).filter((request) => isPendingStatus(request.status) || String(request.status || "").toLowerCase().includes("requested"));
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
    return !isCompletedLessonStatus(lesson.status) && !isCancelledLessonStatus(lesson.status);
  });
  setCount(confirmedLessonCount, confirmed.length);

  if (!confirmed.length) {
    confirmedLessonList?.append(createEmptyState("No confirmed lessons yet."));
    return;
  }

  confirmed.forEach((lesson) => {
    const student = findStudentForLesson(lesson, students, requests);
    const item = buildAdminItem(
      student ? getStudentName(student) : lesson.student_email || lesson.topic || "Driving lesson",
      formatAdminDate(lesson.starts_at || lesson.lesson_date),
      [
        lesson.student_email ? `Email: ${lesson.student_email}` : "",
        `Status: ${lesson.status || "Confirmed"}`,
        `Hours: ${lesson.hours || lesson.duration_hours || 2}`,
        lesson.topic ? `Focus: ${lesson.topic}` : "",
        lesson.summary ? `Summary: ${lesson.summary}` : "",
      ],
    );

    addItemActions(item, [
      {
        label: "Mark as delivered",
        className: "primary-button",
        onClick: () => markLessonDelivered(lesson),
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
    .filter((lesson) => isCompletedLessonStatus(lesson.status))
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
        `Status: ${lesson.status || "Delivered"}`,
        `Hours: ${lesson.hours || lesson.duration_hours || 2}`,
        lesson.delivered_at ? `Delivered: ${formatAdminDate(lesson.delivered_at)}` : "",
        lesson.topic ? `Focus: ${lesson.topic}` : "",
        lesson.summary ? `Summary: ${lesson.summary}` : "",
      ],
    );

    addItemActions(item, [
      {
        label: "Undo delivered",
        onClick: () => undoLessonDelivered(lesson),
      },
    ]);

    deliveredLessonList?.append(item);
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

  const activeRequests = (requests || []).filter((request) => isPendingStatus(request.status));
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

async function loadTable(table, queryBuilder) {
  const { data, error } = await queryBuilder(adminClient.from(table));
  if (error) {
    console.warn(`Admin table failed to load: ${table}`, error);
    return { table, data: [], error };
  }

  return { table, data: data || [], error: null };
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
    slotRequests,
    supportRequests,
    lessons,
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
        .select("id,student_id,student_email,availability_slot_id,starts_at,lesson_date,hours,duration_hours,topic,status,notes,summary,delivered_at,created_at")
        .order("starts_at", { ascending: true })
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
    slotRequests: slotRequests.data,
    supportRequests: supportRequests.data,
    lessons: lessons.data,
    availabilitySlots: availabilitySlots.data,
    paymentBalances: paymentBalances.data,
    paymentEvents: paymentEvents.data,
  };

  renderPendingLessonRequests(lessonRequests.data);
  renderAvailabilitySlots(availabilitySlots.data);
  renderApprovedStudents(studentProfiles.data, lessonRequests.data, lessons.data, paymentBalances.data);
  renderSlotRequests(slotRequests.data);
  renderSupportRequests(supportRequests.data);
  renderConfirmedLessons(lessons.data, studentProfiles.data, lessonRequests.data);
  renderDeliveredLessons(lessons.data, studentProfiles.data, lessonRequests.data);

  const errors = [
    lessonRequests,
    studentProfiles,
    slotRequests,
    supportRequests,
    lessons,
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

  if (request.student_id) {
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
  }

  await updateLessonRequestStatus(request.id, "Approved");
}

async function saveStudentDetails(event) {
  event.preventDefault();

  if (!activeStudent) return;

  const name = String(studentEditName?.value || "").trim();
  const email = String(studentEditEmail?.value || "").trim();
  const lessonStatus = String(studentEditStatus?.value || "Approved").trim();
  const studentId = activeStudent.student_id;
  const originalEmail = activeStudent.email;

  setAdminDataStatus("Saving student details...");

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

    await adminClient
      .from("lesson_requests")
      .update({ name, email, status: lessonStatus })
      .eq("student_id", studentId);
  } else if (originalEmail) {
    const { error: requestError } = await adminClient
      .from("lesson_requests")
      .update({ name, email, status: lessonStatus })
      .eq("email", originalEmail);

    if (requestError) {
      setAdminDataStatus(getAdminError(requestError), "error");
      return;
    }
  }

  studentManageDialog?.close();
  await loadAdminData();
  setAdminDataStatus("Student details saved.", "success");
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

  if (student.student_id) {
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

    await adminClient
      .from("lesson_requests")
      .update({ status: "Removed" })
      .eq("student_id", student.student_id);

    await adminClient
      .from("lesson_slot_requests")
      .update({ status: "Removed" })
      .eq("student_id", student.student_id);
  } else if (student.email) {
    const { error: requestError } = await adminClient
      .from("lesson_requests")
      .update({ status: "Removed" })
      .eq("email", student.email);

    if (requestError) {
      setAdminDataStatus(getAdminError(requestError), "error");
      return;
    }

    await adminClient
      .from("lesson_slot_requests")
      .update({ status: "Removed" })
      .eq("student_email", student.email);
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

  const date = availabilityDate?.value;
  const time = availabilityTime?.value;
  const hours = Number(availabilityHours?.value || 2);
  const notes = String(availabilityNotes?.value || "").trim();

  if (!date || !time) {
    setAdminDataStatus("Choose a date and time before adding a diary slot.", "error");
    return;
  }

  const startsAt = `${date}T${time}:00`;
  setAdminDataStatus("Adding available diary slot...");

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
}

async function createWeeklyAvailability(event) {
  event.preventDefault();

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

  setAdminDataStatus(`Publishing ${newSlots.length} diary slot${newSlots.length === 1 ? "" : "s"}...`);

  const { error } = await adminClient.from("lesson_availability_slots").insert(newSlots);

  if (error) {
    setAdminDataStatus(getAdminError(error), "error");
    return;
  }

  currentDiaryWeekStart = weekStart;
  await loadAdminData();
  setAdminDataStatus(`${newSlots.length} diary slot${newSlots.length === 1 ? "" : "s"} published.`, "success");
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

  const slotId = assignSlotSelect?.value;
  const studentKey = assignStudentSelect?.value;
  const slot = adminData.availabilitySlots.find((item) => item.id === slotId);
  const student = getApprovedStudentRecords().find((item) => getStudentMergeKey(item) === studentKey);

  if (!slot || !student) {
    setAdminDataStatus("Choose both an available slot and an approved student before booking.", "error");
    return;
  }

  setAdminDataStatus("Booking selected student...");

  const { error: lessonError } = await adminClient.from("lessons").insert({
    student_id: student.student_id || null,
    student_email: student.email,
    availability_slot_id: slot.id,
    starts_at: slot.starts_at,
    status: "Confirmed",
    hours: Number(slot.hours || 2),
    topic: "Driving lesson",
    notes: slot.notes || "",
  });

  if (lessonError) {
    setAdminDataStatus(getAdminError(lessonError), "error");
    return;
  }

  await updateAvailabilitySlot(slot.id, {
    status: "Booked",
    assigned_student_id: student.student_id || null,
    assigned_student_email: student.email,
  });

  setAdminDataStatus("Student booked into that diary slot.", "success");
}

async function confirmSlotRequest(request) {
  if (!request?.id) return;
  setAdminDataStatus("Confirming lesson...");

  const availabilitySlot = request.availability_slot_id
    ? adminData.availabilitySlots.find((slot) => slot.id === request.availability_slot_id)
    : null;

  const { error: lessonError } = await adminClient.from("lessons").insert({
    student_id: request.student_id,
    student_email: request.student_email,
    availability_slot_id: availabilitySlot?.id || request.availability_slot_id || null,
    starts_at: availabilitySlot?.starts_at || request.requested_slot,
    status: "Confirmed",
    hours: Number(availabilitySlot?.hours || 2),
    topic: "Driving lesson",
    notes: availabilitySlot?.notes || "",
  });

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
      setAdminDataStatus(getAdminError(slotError), "error");
      return;
    }
  }

  await updateSlotRequestStatus(request.id, "Confirmed");
}

async function approveCancellationRequest(request) {
  if (!request?.id) return;
  setAdminDataStatus("Approving cancellation...");

  let lessonUpdate = adminClient
    .from("lessons")
    .update({ status: "Cancelled" })
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
      setAdminDataStatus(getAdminError(slotError), "error");
      return;
    }
  }

  await updateSlotRequestStatus(request.id, "Cancellation approved");
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

  const { error: lessonError } = await adminClient
    .from("lessons")
    .update({ status: "Cancelled" })
    .eq("id", id);

  if (lessonError) {
    if (!options.silent) {
      setAdminDataStatus(getAdminError(lessonError), "error");
    }
    return false;
  }

  const { error: slotError } = await releaseLessonAvailabilitySlot(lesson);
  if (slotError) {
    if (!options.silent) {
      setAdminDataStatus(getAdminError(slotError), "error");
    }
    return false;
  }

  if (!options.silent) {
    await loadAdminData();
    setAdminDataStatus("Lesson cancelled and diary slot released.", "success");
  }

  return true;
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
    return {
      status: "warning",
      message: "Lesson was delivered and the balance was updated, but the payment history entry could not be saved.",
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

  const { error: updateError } = await adminClient
    .from("student_payment_balances")
    .update({
      used_hours: Math.max(Number(balance.used_hours || 0) - restoredHours, 0),
      account_balance_pence: Math.max(Number(balance.account_balance_pence || 0) + restoredPence, 0),
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
    return {
      status: "warning",
      message: "The lesson credit was restored, but the refund history entry could not be saved.",
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

closeStudentDialog?.addEventListener("click", () => {
  studentManageDialog?.close();
});

studentManageDialog?.addEventListener("click", (event) => {
  if (event.target === studentManageDialog) studentManageDialog.close();
});

studentManageForm?.addEventListener("submit", saveStudentDetails);
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
