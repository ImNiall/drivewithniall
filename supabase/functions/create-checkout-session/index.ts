import Stripe from "https://esm.sh/stripe@16.12.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, jsonResponse } from "../_shared/cors.ts";

const paymentPlans = {
  payPerLesson: {
    name: "Drive with Niall 2 hour lesson",
    description: "Two hours of manual driving lesson credit.",
    amountPence: 7400,
    hours: 2,
  },
  tenHourPackage: {
    name: "Drive with Niall 10 hour lesson package",
    description: "Ten hours of manual driving lesson credit.",
    amountPence: 35000,
    hours: 10,
  },
};

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
  const siteUrl = (Deno.env.get("SITE_URL") || "https://drivewithniall.co.uk").replace(/\/$/, "");

  if (!stripeSecretKey || !supabaseUrl || !serviceRoleKey) {
    return jsonResponse({ error: "Stripe Checkout is not configured yet." }, 500);
  }

  const authHeader = req.headers.get("Authorization") || "";
  const accessToken = authHeader.replace("Bearer ", "").trim();

  if (!accessToken) {
    return jsonResponse({ error: "Sign in before starting a payment." }, 401);
  }

  const body = await req.json().catch(() => ({ planKey: "" }));
  const planKey = String(body?.planKey || "");
  const plan = paymentPlans[planKey as keyof typeof paymentPlans];

  if (!plan) {
    return jsonResponse({ error: "Unknown payment option." }, 400);
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
    session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: user.email || undefined,
      client_reference_id: user.id,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "gbp",
            unit_amount: plan.amountPence,
            product_data: {
              name: plan.name,
              description: plan.description,
            },
          },
        },
      ],
      success_url: `${siteUrl}/payments.html?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/payments.html?payment=cancelled`,
      metadata: {
        student_id: user.id,
        student_email: user.email || "",
        plan_key: planKey,
        hours: String(plan.hours),
        amount_pence: String(plan.amountPence),
      },
    });
  } catch (error) {
    return jsonResponse(
      { error: error instanceof Error ? error.message : "Stripe Checkout could not be created." },
      500,
    );
  }

  if (!session.url) {
    return jsonResponse({ error: "Stripe did not return a checkout URL." }, 500);
  }

  const { error: eventError } = await supabaseAdmin
    .from("student_payment_events")
    .upsert(
      {
        student_id: user.id,
        student_email: user.email,
        event_type: "checkout_session_created",
        event_status: "pending",
        plan_key: planKey,
        hours_delta: plan.hours,
        amount_pence: plan.amountPence,
        currency: "gbp",
        stripe_checkout_session_id: session.id,
        metadata: {
          checkout_url_created: Boolean(session.url),
        },
        updated_at: new Date().toISOString(),
      },
      { onConflict: "stripe_checkout_session_id" },
    );

  if (eventError) {
    return jsonResponse({ error: eventError.message }, 500);
  }

  return jsonResponse({ url: session.url, sessionId: session.id });
});
