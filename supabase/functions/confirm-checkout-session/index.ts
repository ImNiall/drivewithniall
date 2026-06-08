import Stripe from "https://esm.sh/stripe@16.12.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, jsonResponse } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!stripeSecretKey || !supabaseUrl || !serviceRoleKey) {
    return jsonResponse({ error: "Stripe payment confirmation is not configured yet." }, 500);
  }

  const authHeader = req.headers.get("Authorization") || "";
  const accessToken = authHeader.replace("Bearer ", "").trim();

  if (!accessToken) {
    return jsonResponse({ error: "Sign in before confirming a payment." }, 401);
  }

  const { sessionId } = await req.json().catch(() => ({ sessionId: "" }));
  const checkoutSessionId = String(sessionId || "").trim();

  if (!checkoutSessionId) {
    return jsonResponse({ error: "Missing Stripe Checkout session id." }, 400);
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  const {
    data: { user },
    error: userError,
  } = await supabaseAdmin.auth.getUser(accessToken);

  if (userError || !user) {
    return jsonResponse({ error: "Your session has expired. Sign in again." }, 401);
  }

  const stripe = new Stripe(stripeSecretKey, {
    apiVersion: "2024-06-20",
    httpClient: Stripe.createFetchHttpClient(),
  });

  let session;
  try {
    session = await stripe.checkout.sessions.retrieve(checkoutSessionId);
  } catch (error) {
    return jsonResponse(
      { error: error instanceof Error ? error.message : "Stripe Checkout session could not be loaded." },
      500,
    );
  }

  if (!session || session.object !== "checkout.session") {
    return jsonResponse({ error: "Stripe Checkout session could not be found." }, 404);
  }

  const metadata = session.metadata || {};
  const studentId = metadata.student_id || session.client_reference_id || null;
  const studentEmail = metadata.student_email || session.customer_details?.email || session.customer_email || null;
  const planKey = metadata.plan_key || null;
  const hours = Number(metadata.hours || 0);
  const amountPence = Number(session.amount_total || metadata.amount_pence || 0);
  const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id || null;
  const paymentIntentId =
    typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id || null;

  if (!studentId || studentId !== user.id) {
    return jsonResponse({ error: "This payment does not belong to the signed-in student account." }, 403);
  }

  if (session.payment_status !== "paid") {
    return jsonResponse({ error: "Stripe has not marked this checkout session as paid yet." }, 409);
  }

  if (!Number.isFinite(hours) || hours < 0) {
    return jsonResponse({ error: "Checkout session is missing valid lesson hours metadata." }, 400);
  }

  const completedAt = new Date().toISOString();

  const { data: existingEvent, error: existingEventError } = await supabaseAdmin
    .from("student_payment_events")
    .select("event_status")
    .eq("stripe_checkout_session_id", session.id)
    .maybeSingle();

  if (existingEventError) {
    return jsonResponse({ error: existingEventError.message }, 500);
  }

  if (existingEvent?.event_status === "completed") {
    return jsonResponse({ confirmed: true, duplicate: true, sessionId: session.id });
  }

  const { error: eventError } = await supabaseAdmin
    .from("student_payment_events")
    .upsert(
      {
        student_id: studentId,
        student_email: studentEmail,
        event_type: "checkout_session_completed",
        event_status: "completed",
        plan_key: planKey,
        hours_delta: hours,
        amount_pence: amountPence,
        currency: session.currency || "gbp",
        stripe_customer_id: customerId,
        stripe_checkout_session_id: session.id,
        stripe_payment_intent_id: paymentIntentId,
        metadata: {
          confirmation_source: "return_url",
          payment_status: session.payment_status,
        },
        updated_at: completedAt,
      },
      { onConflict: "stripe_checkout_session_id" },
    );

  if (eventError) {
    return jsonResponse({ error: eventError.message }, 500);
  }

  const { data: balance, error: balanceReadError } = await supabaseAdmin
    .from("student_payment_balances")
    .select("purchased_hours,account_balance_pence")
    .eq("student_id", studentId)
    .maybeSingle();

  if (balanceReadError) {
    return jsonResponse({ error: balanceReadError.message }, 500);
  }

  const purchasedHours = Number(balance?.purchased_hours || 0) + hours;
  const accountBalancePence = Number(balance?.account_balance_pence || 0) + amountPence;

  const { error: balanceError } = await supabaseAdmin
    .from("student_payment_balances")
    .upsert(
      {
        student_id: studentId,
        student_email: studentEmail,
        stripe_customer_id: customerId,
        purchased_hours: purchasedHours,
        account_balance_pence: accountBalancePence,
        last_payment_at: completedAt,
        updated_at: completedAt,
      },
      { onConflict: "student_id" },
    );

  if (balanceError) {
    return jsonResponse({ error: balanceError.message }, 500);
  }

  return jsonResponse({ confirmed: true, sessionId: session.id });
});
