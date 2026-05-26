const adminConfig = window.driveAuthConfig || {};
const adminEmails = (adminConfig.adminEmails || []).map((email) => email.toLowerCase());
const adminStatus = document.querySelector("#adminStatus");
const adminLoginForm = document.querySelector("#adminLoginForm");
const adminSignedOut = document.querySelector("#adminSignedOut");
const adminPanel = document.querySelector("#adminPanel");
const adminEmail = document.querySelector("#adminEmail");
const adminSignOutButton = document.querySelector("#adminSignOutButton");

const hasAdminConfig =
  adminConfig.supabaseUrl &&
  adminConfig.supabaseAnonKey &&
  !adminConfig.supabaseUrl.includes("PASTE_") &&
  !adminConfig.supabaseAnonKey.includes("PASTE_");

const adminClient = hasAdminConfig && window.supabase
  ? window.supabase.createClient(adminConfig.supabaseUrl, adminConfig.supabaseAnonKey)
  : null;

function setAdminStatus(message, type = "info") {
  if (!adminStatus) return;
  adminStatus.textContent = message;
  adminStatus.dataset.type = type;
  adminStatus.hidden = !message;
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

function setAdminSession(session) {
  const userEmail = session?.user?.email || "";
  const isAdmin = adminEmails.includes(userEmail.toLowerCase());

  adminSignedOut?.toggleAttribute("hidden", Boolean(isAdmin));
  adminPanel?.toggleAttribute("hidden", !isAdmin);

  if (adminEmail && userEmail) {
    adminEmail.textContent = userEmail;
  }

  if (session && !isAdmin) {
    setAdminStatus("This account is signed in, but it is not approved as an admin.", "error");
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
  const email = String(formData.get("email") || "").toLowerCase();

  if (!adminEmails.includes(email)) {
    setAdminStatus("This email is not approved for admin access.", "error");
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

adminSignOutButton?.addEventListener("click", async () => {
  if (!adminClient) return;

  await adminClient.auth.signOut();
  setAdminStatus("Signed out.", "success");
});
