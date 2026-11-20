/*
# Add email notification delivery tracking

1. Modified Tables
- `support_tickets.customer_email` stores the customer address used for reply and status notifications.
- `support_tickets.agent_email` stores the assigned agent address used for team notifications.

2. New Tables
- `notification_events` records every notification request and its delivery result.
- `notification_events.id` identifies the delivery attempt.
- `notification_events.ticket_id` links the event to a support ticket.
- `notification_events.event_type` stores reply or status_change.
- `notification_events.recipient_email` stores the destination address.
- `notification_events.recipient_type` stores customer or agent.
- `notification_events.status` stores pending, sent, or failed.
- `notification_events.provider_id` stores the email provider message id when available.
- `notification_events.error_message` stores a safe delivery error for troubleshooting.
- `notification_events.created_at` records when the event was created.

3. Security
- Row level security is enabled on `notification_events`.
- The shared prototype can create and read delivery records through explicit anon and authenticated policies.
- The server-side notification function also receives service-role access for delivery updates.

4. Important Notes
- Email addresses are optional so existing demo tickets continue to work.
- A notification can only be sent when a recipient address and an email provider key are available.
- This migration is additive and does not delete or rename existing data.
*/

ALTER TABLE public.support_tickets ADD COLUMN IF NOT EXISTS customer_email text;
ALTER TABLE public.support_tickets ADD COLUMN IF NOT EXISTS agent_email text;

CREATE TABLE IF NOT EXISTS public.notification_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  recipient_email text NOT NULL,
  recipient_type text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  provider_id text,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS notification_events_ticket_id_idx ON public.notification_events(ticket_id);
CREATE INDEX IF NOT EXISTS notification_events_status_idx ON public.notification_events(status);

ALTER TABLE public.notification_events ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE ON public.notification_events TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notification_events TO service_role;

DROP POLICY IF EXISTS "shared_workspace_select_notifications" ON public.notification_events;
CREATE POLICY "shared_workspace_select_notifications" ON public.notification_events FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "shared_workspace_insert_notifications" ON public.notification_events;
CREATE POLICY "shared_workspace_insert_notifications" ON public.notification_events FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "shared_workspace_update_notifications" ON public.notification_events;
CREATE POLICY "shared_workspace_update_notifications" ON public.notification_events FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);