import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, jsonResponse } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    return jsonResponse({ error: "Payment history reconciliation is not configured yet." }, 500);
  }

  const authHeader = req.headers.get("Authorization") || "";
  const accessToken = authHeader.replace("Bearer ", "").trim();

  if (!accessToken) {
    return jsonResponse({ error: "Sign in before reconciling payment history." }, 401);
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

  const { data: events, error: eventsError } = await supabaseAdmin
    .from("student_payment_events")
    .select("id,event_type,event_status,plan_key,hours_delta,amount_pence,stripe_checkout_session_id,metadata,created_at")
    .eq("student_id", user.id)
    .order("created_at", { ascending: true });

  if (eventsError) {
    return jsonResponse({ error: eventsError.message }, 500);
  }

  const pendingEvents = (events || []).filter((event) =>
    event.event_type === "checkout_session_created" &&
    event.event_status === "pending",
  );

  const completedEvents = (events || []).filter((event) =>
    event.event_type === "checkout_session_completed" &&
    event.event_status === "completed",
  );

  let reconciled = 0;

  for (const pendingEvent of pendingEvents) {
    const match = completedEvents.find((completedEvent) =>
      completedEvent.plan_key === pendingEvent.plan_key &&
      Number(completedEvent.hours_delta || 0) === Number(pendingEvent.hours_delta || 0) &&
      Number(completedEvent.amount_pence || 0) === Number(pendingEvent.amount_pence || 0) &&
      new Date(completedEvent.created_at || 0).getTime() >= new Date(pendingEvent.created_at || 0).getTime(),
    );

    if (!match) continue;

    const { error: updateError } = await supabaseAdmin
      .from("student_payment_events")
      .update({
        event_status: "superseded",
        metadata: {
          ...(pendingEvent.metadata || {}),
          superseded_by_event_id: match.id,
          superseded_by_checkout_session_id: match.stripe_checkout_session_id || null,
          superseded_at: new Date().toISOString(),
        },
        updated_at: new Date().toISOString(),
      })
      .eq("id", pendingEvent.id);

    if (updateError) {
      return jsonResponse({ error: updateError.message }, 500);
    }

    reconciled += 1;
  }

  return jsonResponse({ reconciled });
});
