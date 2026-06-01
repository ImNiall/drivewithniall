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

let adminData = {
  lessonRequests: [],
  studentProfiles: [],
  slotRequests: [],
  supportRequests: [],
  lessons: [],
};
let activeStudent = null;

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

function findStudentForLesson(lesson, students = [], requests = []) {
  return [...students, ...requests].find((student) => sameStudent(lesson, student));
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

function renderApprovedStudents(students, requests, lessons) {
  clearElement(approvedStudentList);

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

  const approved = [...merged.values()].map((student) => {
    const latestRequest = (requests || []).find((request) => sameStudent(request, student));
    return {
      ...latestRequest,
      ...student,
      latest_request_id: latestRequest?.id,
    };
  });
  setCount(approvedStudentCount, approved.length);

  if (!approved.length) {
    approvedStudentList?.append(createEmptyState("No approved practical students yet."));
    return;
  }

  approved.forEach((student) => {
    const studentLessons = (lessons || []).filter((lesson) => sameStudent(lesson, student));
    const completedHours = studentLessons
      .filter((lesson) => String(lesson.status || "").toLowerCase().includes("complete"))
      .reduce((total, lesson) => total + Number(lesson.hours || lesson.duration_hours || 2), 0);

    const item = buildAdminItem(
      getStudentName(student),
      student.email || "No email saved",
      [
        `Status: ${student.lesson_status || "Approved"}`,
        `Completed hours: ${completedHours}`,
        `Bookings: ${studentLessons.length}`,
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

  if (!lessons.length && !requests.length) {
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
          onClick: () => updateSlotRequestStatus(request.id, "Cancellation declined"),
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
          onClick: () => updateSlotRequestStatus(request.id, "Declined"),
        },
      ]);
    }

    slotRequestList?.append(item);
  });
}

function renderConfirmedLessons(lessons, students = [], requests = []) {
  clearElement(confirmedLessonList);

  const confirmed = (lessons || []).filter((lesson) => {
    const status = String(lesson.status || "").toLowerCase();
    return !status.includes("complete") && !status.includes("cancel");
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
      ],
    );

    addItemActions(item, [
      {
        label: "Mark complete",
        onClick: () => markLessonComplete(lesson.id),
      },
    ]);

    confirmedLessonList?.append(item);
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

  const [lessonRequests, studentProfiles, slotRequests, supportRequests, lessons] = await Promise.all([
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
        .select("id,student_id,student_email,requested_slot,requested_label,status,created_at")
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
        .select("id,student_id,student_email,starts_at,lesson_date,hours,duration_hours,topic,status,notes,created_at")
        .order("starts_at", { ascending: true })
        .limit(100),
    ),
  ]);

  adminData = {
    lessonRequests: lessonRequests.data,
    studentProfiles: studentProfiles.data,
    slotRequests: slotRequests.data,
    supportRequests: supportRequests.data,
    lessons: lessons.data,
  };

  renderPendingLessonRequests(lessonRequests.data);
  renderApprovedStudents(studentProfiles.data, lessonRequests.data, lessons.data);
  renderSlotRequests(slotRequests.data);
  renderSupportRequests(supportRequests.data);
  renderConfirmedLessons(lessons.data, studentProfiles.data, lessonRequests.data);

  const errors = [lessonRequests, studentProfiles, slotRequests, supportRequests, lessons].filter((result) => result.error);
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
  } else if (student.email) {
    const { error: requestError } = await adminClient
      .from("lesson_requests")
      .update({ status: "Removed" })
      .eq("email", student.email);

    if (requestError) {
      setAdminDataStatus(getAdminError(requestError), "error");
      return;
    }
  }

  studentManageDialog?.close();
  await loadAdminData();
  setAdminDataStatus("Student practical access removed. Their history has been kept.", "success");
}

async function updateSlotRequestStatus(id, status) {
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

async function confirmSlotRequest(request) {
  if (!request?.id) return;
  setAdminDataStatus("Confirming lesson...");

  const { error: lessonError } = await adminClient.from("lessons").insert({
    student_id: request.student_id,
    student_email: request.student_email,
    starts_at: request.requested_slot,
    status: "Confirmed",
    hours: 2,
    topic: "Driving lesson",
  });

  if (lessonError) {
    setAdminDataStatus(getAdminError(lessonError), "error");
    return;
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

  await updateSlotRequestStatus(request.id, "Cancellation approved");
}

async function markLessonComplete(id) {
  if (!id) return;
  setAdminDataStatus("Marking lesson complete...");

  const { error } = await adminClient
    .from("lessons")
    .update({ status: "Completed" })
    .eq("id", id);

  if (error) {
    setAdminDataStatus(getAdminError(error), "error");
    return;
  }

  await loadAdminData();
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
