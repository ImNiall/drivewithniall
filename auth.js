const authConfig = window.driveAuthConfig || {};
const hasSupabaseConfig =
  authConfig.supabaseUrl &&
  authConfig.supabaseAnonKey &&
  !authConfig.supabaseUrl.includes("PASTE_") &&
  !authConfig.supabaseAnonKey.includes("PASTE_");
const authSharedSupabaseClients = window.__driveSupabaseClients || (window.__driveSupabaseClients = {});
const authClientKey = hasSupabaseConfig
  ? `${authConfig.supabaseUrl}::${authConfig.supabaseAnonKey}`
  : "";

const authClient = hasSupabaseConfig && window.supabase
  ? (authSharedSupabaseClients[authClientKey] ||= window.supabase.createClient(
      authConfig.supabaseUrl,
      authConfig.supabaseAnonKey,
    ))
  : null;

const accountStatus = document.querySelector("#accountStatus");
const accountButtonLabel = document.querySelector("#accountButton");
const signInForm = document.querySelector("#signInForm");
const signUpForm = document.querySelector("#signUpForm");
const signOutButton = document.querySelector("#signOutButton");
const accountSignedIn = document.querySelector("#accountSignedIn");
const accountEmail = document.querySelector("#accountEmail");
const accountTitle = document.querySelector("#accountTitle");
const accountIntro = document.querySelector("#accountIntro");
const accountNote = document.querySelector("#accountNote");
const authTabs = document.querySelectorAll("[data-auth-panel]");

function getAuthRedirectUrl() {
  return authConfig.siteUrl || "https://drivewithniall.co.uk/";
}

function getAuthErrorFromUrl() {
  const params = new URLSearchParams(window.location.hash.replace(/^#/, "") || window.location.search);
  return params.get("error_description") || params.get("error");
}

function getFriendlyAuthError(error) {
  const message = error?.message || String(error || "");
  const normalisedMessage = message.toLowerCase();

  if (normalisedMessage.includes("email rate limit")) {
    return "Too many verification emails have been requested. Wait a few minutes, then try again. Also check your inbox and junk folder for the latest verification email.";
  }

  if (normalisedMessage.includes("invalid login credentials")) {
    return "Those login details do not match an account. Check the email and password, or create an account first.";
  }

  if (normalisedMessage.includes("email not confirmed")) {
    return "Your account exists, but the email has not been verified yet. Open the latest verification email from Supabase.";
  }

  if (normalisedMessage.includes("expired") || normalisedMessage.includes("invalid")) {
    return "That verification link is invalid or has expired. Request a fresh email and use the newest link.";
  }

  return message;
}

function setAccountStatus(message, type = "info") {
  if (!accountStatus) return;
  accountStatus.textContent = message;
  accountStatus.dataset.type = type;
  accountStatus.hidden = !message;
}

function showAuthPanel(panelName) {
  authTabs.forEach((tab) => {
    tab.classList.toggle("is-active", tab.dataset.authPanel === panelName);
  });

  signInForm?.classList.toggle("is-active", panelName === "signin");
  signUpForm?.classList.toggle("is-active", panelName === "signup");
}

function setLoading(form, isLoading, label) {
  const button = form?.querySelector("button[type='submit']");
  if (!button) return;

  if (!button.dataset.originalText) {
    button.dataset.originalText = button.textContent;
  }

  button.disabled = isLoading;
  button.textContent = isLoading ? label : button.dataset.originalText;
}

function setSignedInState(session) {
  const userEmail = session?.user?.email;
  const isSignedIn = Boolean(userEmail);

  signInForm?.toggleAttribute("hidden", isSignedIn);
  signUpForm?.toggleAttribute("hidden", isSignedIn);
  document.querySelector(".account-actions")?.toggleAttribute("hidden", isSignedIn);
  accountSignedIn?.toggleAttribute("hidden", !isSignedIn);

  if (accountTitle) {
    accountTitle.textContent = isSignedIn ? "Your student dashboard is ready" : "Access your account";
  }

  if (accountIntro) {
    accountIntro.textContent = isSignedIn
      ? "Open your dashboard to view lesson requests, course access, and personal support."
      : "Sign in or create an account for dashboard access, lesson requests, and private student resources.";
  }

  if (accountNote) {
    accountNote.hidden = isSignedIn;
  }

  if (accountEmail) {
    accountEmail.textContent = userEmail || "Signed in";
  }

  if (accountButtonLabel) {
    accountButtonLabel.textContent = isSignedIn ? "Dashboard" : "Log in";
    accountButtonLabel.dataset.destination = isSignedIn ? "dashboard" : "login";
  }
}

authTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    showAuthPanel(tab.dataset.authPanel);
    setAccountStatus("");
  });
});

if (!authClient) {
  setAccountStatus("Student accounts are ready to connect. Add your Supabase project URL and public anon key in auth-config.js.", "info");
} else {
  const authError = getAuthErrorFromUrl();
  if (authError) {
    setAccountStatus(getFriendlyAuthError(authError), "error");
  }

  authClient.auth.getSession().then(({ data, error }) => {
    if (error) {
      setAccountStatus(error.message, "error");
      return;
    }

    setSignedInState(data.session);
  });

  authClient.auth.onAuthStateChange((_event, session) => {
    setSignedInState(session);
  });
}

signInForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!authClient) {
    setAccountStatus("Student accounts need the Supabase project details before sign in can work.", "error");
    return;
  }

  const formData = new FormData(signInForm);
  setLoading(signInForm, true, "Signing in...");
  setAccountStatus("");

  const { error } = await authClient.auth.signInWithPassword({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  setLoading(signInForm, false);

  if (error) {
    setAccountStatus(getFriendlyAuthError(error), "error");
    return;
  }

  window.location.href = "dashboard.html";
});

signUpForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!authClient) {
    setAccountStatus("Student accounts need the Supabase project details before sign up can work.", "error");
    return;
  }

  const formData = new FormData(signUpForm);
  setLoading(signUpForm, true, "Creating account...");
  setAccountStatus("");

  const { data, error } = await authClient.auth.signUp({
    email: formData.get("email"),
    password: formData.get("password"),
    options: {
      emailRedirectTo: getAuthRedirectUrl(),
      data: {
        full_name: formData.get("name"),
      },
    },
  });

  setLoading(signUpForm, false);

  if (error) {
    setAccountStatus(getFriendlyAuthError(error), "error");
    return;
  }

  const existingAccount = data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0;

  if (existingAccount) {
    setAccountStatus("This email may already have an account. Try signing in instead, or use password reset if you cannot remember the password.", "info");
    showAuthPanel("signin");
    return;
  }

  if (data.session) {
    setAccountStatus("Account created and signed in.", "success");
  } else {
    setAccountStatus("Check your email to confirm your account. Use the newest verification email if you requested more than one.", "success");
  }
});

signOutButton?.addEventListener("click", async () => {
  if (!authClient) return;

  const { error } = await authClient.auth.signOut();
  if (error) {
    setAccountStatus(getFriendlyAuthError(error), "error");
    return;
  }

  setAccountStatus("Signed out.", "success");
  showAuthPanel("signin");
});
