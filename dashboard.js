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

  if (!data?.length) {
    setLessonStatus("No lesson requests are linked to this account yet. Use the request button when you are ready.");
    return;
  }

  setLessonStatus("Your latest linked requests:");
  renderLessonRequests(data);
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
  loadLessonRequests(data.session.user.id);
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

initialiseDashboard();
