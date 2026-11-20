import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const jsonHeaders = { ...corsHeaders, "Content-Type": "application/json" };

type NotificationPayload = {
  ticketId: string;
  eventType: "reply" | "status_change";
  status?: string;
  body: string;
};

function isPayload(value: unknown): value is NotificationPayload {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<NotificationPayload>;
  return typeof candidate.ticketId === "string" &&
    (candidate.eventType === "reply" || candidate.eventType === "status_change") &&
    typeof candidate.body === "string";
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 200, headers: corsHeaders });

  try {
    const payload: unknown = await req.json();
    if (!isPayload(payload)) {
      return new Response(JSON.stringify({ error: "A valid notification payload is required." }), { status: 400, headers: jsonHeaders });
    }

    const apiKey = Deno.env.get("RESEND_API_KEY");
    const fromEmail = Deno.env.get("RESEND_FROM_EMAIL");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!apiKey || !fromEmail || !supabaseUrl || !serviceRoleKey) {
      return new Response(JSON.stringify({ error: "Email delivery is not configured yet." }), { status: 503, headers: jsonHeaders });
    }

    const admin = createClient(supabaseUrl, serviceRoleKey);
    const { data: ticket, error: ticketError } = await admin.from("support_tickets").select("subject, customer_name, customer_email, agent_email").eq("id", payload.ticketId).maybeSingle();
    if (ticketError || !ticket) {
      return new Response(JSON.stringify({ error: "Ticket not found." }), { status: 404, headers: jsonHeaders });
    }
    const recipients = [
      ticket.customer_email ? { email: ticket.customer_email, type: "customer" as const } : null,
      ticket.agent_email ? { email: ticket.agent_email, type: "agent" as const } : null,
    ].filter((recipient): recipient is { email: string; type: "customer" | "agent" } => recipient !== null);
    if (recipients.length === 0) {
      return new Response(JSON.stringify({ results: [], skipped: true, reason: "No recipient email addresses are saved on this ticket." }), { status: 200, headers: jsonHeaders });
    }
    const results = await Promise.all(recipients.map(async (recipient) => {
      const { data: event, error: eventError } = await admin.from("notification_events").insert({
        ticket_id: payload.ticketId,
        event_type: payload.eventType,
        recipient_email: recipient.email,
        recipient_type: recipient.type,
        status: "pending",
      }).select("id").maybeSingle();
      if (eventError || !event) throw new Error("Could not create notification record.");

      const statusLine = payload.eventType === "status_change" ? `The ticket status is now ${payload.status ?? "updated"}.` : "There is a new reply on your support ticket.";
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: fromEmail,
          to: [recipient.email],
          subject: `${ticket.subject} · Relay support update`,
          text: `Hi ${recipient.type === "customer" ? ticket.customer_name : "there"},\n\n${statusLine}\n\n${payload.body}\n\n— Relay Support`,
        }),
      });
      const result: unknown = await response.json();
      if (!response.ok || !result || typeof result !== "object" || !("id" in result)) {
        const message = result && typeof result === "object" && "message" in result && typeof result.message === "string" ? result.message : "Email provider rejected the message.";
        await admin.from("notification_events").update({ status: "failed", error_message: message }).eq("id", event.id);
        throw new Error(message);
      }

      const providerId = (result as { id: string }).id;
      await admin.from("notification_events").update({ status: "sent", provider_id: providerId }).eq("id", event.id);
      return { recipient: recipient.email, status: "sent" };
    }));

    return new Response(JSON.stringify({ results }), { status: 200, headers: jsonHeaders });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Notification delivery failed.";
    return new Response(JSON.stringify({ error: message }), { status: 500, headers: jsonHeaders });
  }
});
