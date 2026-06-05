const paymentsConfig = window.driveAuthConfig || {};
const hasPaymentsAuthConfig =
  paymentsConfig.supabaseUrl &&
  paymentsConfig.supabaseAnonKey &&
  !paymentsConfig.supabaseUrl.includes("PASTE_") &&
  !paymentsConfig.supabaseAnonKey.includes("PASTE_");

const paymentsClient = hasPaymentsAuthConfig && window.supabase
  ? window.supabase.createClient(paymentsConfig.supabaseUrl, paymentsConfig.supabaseAnonKey)
  : null;

const themeToggle = document.querySelector("#themeToggle");
const signedOutPayments = document.querySelector("#signedOutPayments");
const signedInPayments = document.querySelector("#signedInPayments");
const paymentsStatus = document.querySelector("#paymentsStatus");
const paymentsIntro = document.querySelector("#paymentsIntro");
const paymentBalanceMessage = document.querySelector("#paymentBalanceMessage");
const paymentAccountStatus = document.querySelector("#paymentAccountStatus");
const remainingHours = document.querySelector("#remainingHours");
const purchasedHours = document.querySelector("#purchasedHours");
const usedHours = document.querySelector("#usedHours");
const accountBalance = document.querySelector("#accountBalance");
const stripeSetupMessage = document.querySelector("#stripeSetupMessage");
const paymentHistoryList = document.querySelector("#paymentHistoryList");
const paymentReturnNotice = document.querySelector("#paymentReturnNotice");
const checkoutButtons = Array.from(document.querySelectorAll(".stripe-checkout-button"));

let currentPaymentsSession = null;

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

function setPaymentsStatus(message, type = "info") {
  if (!paymentsStatus) return;
  paymentsStatus.textContent = message;
  paymentsStatus.dataset.type = type;
  paymentsStatus.hidden = !message;
}

function setReturnNotice(message, type = "info") {
  if (!paymentReturnNotice) return;
  paymentReturnNotice.textContent = message;
  paymentReturnNotice.dataset.type = type;
  paymentReturnNotice.hidden = !message;
}

function formatHours(value) {
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

function getPlan(planKey) {
  return paymentsConfig.payments?.plans?.[planKey] || null;
}

function showPaymentReturnNotice() {
  const params = new URLSearchParams(window.location.search);
  const result = params.get("payment");

  if (result === "success") {
    setReturnNotice("Payment submitted. Your lesson balance will update once Stripe confirms the payment.", "success");
  } else if (result === "cancelled") {
    setReturnNotice("Payment cancelled. No lesson credit has been added.", "error");
  }

  if (result) {
    const cleanUrl = `${window.location.pathname}${window.location.hash || ""}`;
    window.history.replaceState({}, document.title, cleanUrl);
  }
}

function showSignedOut(message = "") {
  signedOutPayments?.removeAttribute("hidden");
  signedInPayments?.setAttribute("hidden", "");
  if (paymentsIntro) {
    paymentsIntro.textContent = "Sign in to view lesson payment options and your remaining balance.";
  }
  setPaymentsStatus(message);
}

function showSignedIn(session) {
  currentPaymentsSession = session;
  signedOutPayments?.setAttribute("hidden", "");
  signedInPayments?.removeAttribute("hidden");
  if (paymentAccountStatus) {
    paymentAccountStatus.textContent = session?.user?.email || "Signed in";
  }
  setPaymentsStatus("");
}

function renderPaymentBalance(balance) {
  const purchased = Number(balance?.purchased_hours || 0);
  const used = Number(balance?.used_hours || 0);
  const remaining = Math.max(purchased - used, 0);

  if (remainingHours) remainingHours.textContent = formatHours(remaining);
  if (purchasedHours) purchasedHours.textContent = formatHours(purchased);
  if (usedHours) usedHours.textContent = formatHours(used);
  if (accountBalance) accountBalance.textContent = formatPoundsFromPence(balance?.account_balance_pence || 0);

  if (paymentBalanceMessage) {
    paymentBalanceMessage.textContent = balance
      ? "Your paid lesson hours and account balance are shown below."
      : "No payment balance has been added to this account yet. Once Stripe confirms a payment, your remaining hours will appear here.";
  }
}

function renderPaymentHistory(events = []) {
  if (!paymentHistoryList) return;

  if (!events.length) {
    paymentHistoryList.innerHTML = "<li>No payment activity has been recorded yet.</li>";
    return;
  }

  paymentHistoryList.innerHTML = events
    .map((event) => {
      const date = event.created_at
        ? new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(new Date(event.created_at))
        : "Date unavailable";
      const isLessonUsage = event.event_type === "lesson_credit_used";
      const amount = formatPoundsFromPence(Math.abs(Number(event.amount_pence || 0)));
      const hours = formatHours(Math.abs(Number(event.hours_delta || 0)));
      const status = String(event.event_status || "pending").replaceAll("_", " ");

      if (isLessonUsage) {
        return `
          <li>
            <strong>Lesson credit used</strong>
            <span>${hours} hour${Number(hours) === 1 ? "" : "s"} used · ${date}</span>
          </li>
        `;
      }

      return `
        <li>
          <strong>${amount} · ${hours} hour${Number(event.hours_delta) === 1 ? "" : "s"}</strong>
          <span>${status} · ${date}</span>
        </li>
      `;
    })
    .join("");
}

async function loadPaymentBalance(userId) {
  renderPaymentBalance(null);

  if (!paymentsClient) return;

  const { data, error } = await paymentsClient
    .from("student_payment_balances")
    .select("purchased_hours,used_hours,account_balance_pence,last_payment_at,updated_at")
    .eq("student_id", userId)
    .maybeSingle();

  if (error) {
    setPaymentsStatus("Payment tracking is ready in the app, but the Supabase payment balance table still needs to be added.", "error");
    return;
  }

  renderPaymentBalance(data);
}

async function loadPaymentHistory(userId) {
  renderPaymentHistory([]);

  if (!paymentsClient) return;

  const { data, error } = await paymentsClient
    .from("student_payment_events")
    .select("event_type,event_status,plan_key,hours_delta,amount_pence,currency,created_at")
    .eq("student_id", userId)
    .order("created_at", { ascending: false })
    .limit(8);

  if (error) {
    if (!paymentsStatus?.textContent) {
      setPaymentsStatus("Payment history will appear after the Stripe payment events table is added.", "info");
    }
    return;
  }

  renderPaymentHistory(data || []);
}

function setCheckoutButtonsBusy(isBusy) {
  checkoutButtons.forEach((button) => {
    button.disabled = isBusy;
    button.classList.toggle("is-loading", isBusy);
  });
}

function configureCheckoutButtons() {
  checkoutButtons.forEach((button) => {
    const plan = getPlan(button.dataset.plan);
    if (!plan) {
      button.disabled = true;
      button.classList.add("is-disabled");
      return;
    }

    button.textContent = plan.label || button.textContent;
    button.disabled = false;
    button.classList.remove("is-disabled");
  });

  if (stripeSetupMessage) {
    stripeSetupMessage.textContent = "Stripe Checkout will open securely once the Supabase Edge Function secrets are set and the functions are deployed.";
  }
}

async function startCheckout(planKey) {
  if (!paymentsClient || !currentPaymentsSession) {
    setPaymentsStatus("Sign in before starting a payment.", "error");
    return;
  }

  const plan = getPlan(planKey);
  if (!plan) {
    setPaymentsStatus("This payment option is not configured yet.", "error");
    return;
  }

  setCheckoutButtonsBusy(true);
  setPaymentsStatus("Opening secure Stripe Checkout...", "info");

  try {
    const response = await fetch(
      `${paymentsConfig.supabaseUrl}/functions/v1/${paymentsConfig.payments?.createCheckoutFunction || "create-checkout-session"}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: paymentsConfig.supabaseAnonKey,
          Authorization: `Bearer ${currentPaymentsSession.access_token}`,
        },
        body: JSON.stringify({ planKey }),
      },
    );

    const payload = await response.json().catch(() => ({}));

    if (!response.ok || !payload.url) {
      throw new Error(payload.error || "Stripe Checkout is not available yet.");
    }

    window.location.href = payload.url;
  } catch (error) {
    const message = error?.message || "Stripe Checkout could not be opened.";
    setPaymentsStatus(`${message} Check the Supabase Edge Function deployment and Stripe secrets.`, "error");
    setCheckoutButtonsBusy(false);
  }
}

async function initialisePayments() {
  const savedTheme = localStorage.getItem("driveTheme");
  const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
  setTheme(savedTheme || (prefersDark ? "dark" : "light"));
  configureCheckoutButtons();
  showPaymentReturnNotice();

  if (!paymentsClient) {
    showSignedOut("Student payments need the Supabase project details before account balances can load.");
    return;
  }

  const { data, error } = await paymentsClient.auth.getSession();
  if (error) {
    showSignedOut("There was a problem checking your account. Sign in again from the homepage.");
    return;
  }

  if (!data.session) {
    showSignedOut("");
    return;
  }

  showSignedIn(data.session);
  await Promise.all([
    loadPaymentBalance(data.session.user.id),
    loadPaymentHistory(data.session.user.id),
  ]);
}

themeToggle?.addEventListener("click", () => {
  setTheme(document.body.classList.contains("dark-mode") ? "light" : "dark");
});

checkoutButtons.forEach((button) => {
  button.addEventListener("click", () => startCheckout(button.dataset.plan));
});

initialisePayments();
