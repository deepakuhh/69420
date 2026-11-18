/*
# Create support tickets for the Relay dashboard

1. New Tables
- `support_tickets`
- `id` (uuid, primary key) identifies each ticket.
- `customer_name` (text) stores the customer display name.
- `subject` (text) stores the short issue title.
- `description` (text) stores the customer message.
- `channel` (text) stores the source channel such as Email or WhatsApp.
- `category` (text) stores the support category.
- `priority` (text) stores low, medium, or high priority.
- `status` (text) stores open, pending, or resolved.
- `assigned_to` (text) stores the support owner when assigned.
- `created_at` and `updated_at` (timestamptz) track ticket timing.

2. Security
- Row level security is enabled.
- This prototype intentionally uses a shared workspace with no sign-in screen, so anon and authenticated roles receive CRUD access through explicit policies.
- Policies only allow the fields and rows needed by this shared support workspace.

3. Important Notes
- Seed records are stable demo conversations for the dashboard and can be edited or replaced through the app.
- The table is designed for the core ticket flow from the product brief: creation, filtering, assignment, status updates, and history-ready timestamps.
*/

CREATE TABLE IF NOT EXISTS public.support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  subject text NOT NULL,
  description text NOT NULL DEFAULT '',
  channel text NOT NULL DEFAULT 'Email',
  category text NOT NULL DEFAULT 'General',
  priority text NOT NULL DEFAULT 'Medium',
  status text NOT NULL DEFAULT 'Open',
  assigned_to text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.support_tickets TO anon, authenticated;

DROP POLICY IF EXISTS "shared_workspace_select_tickets" ON public.support_tickets;
CREATE POLICY "shared_workspace_select_tickets"
ON public.support_tickets FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "shared_workspace_insert_tickets" ON public.support_tickets;
CREATE POLICY "shared_workspace_insert_tickets"
ON public.support_tickets FOR INSERT
TO anon, authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "shared_workspace_update_tickets" ON public.support_tickets;
CREATE POLICY "shared_workspace_update_tickets"
ON public.support_tickets FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "shared_workspace_delete_tickets" ON public.support_tickets;
CREATE POLICY "shared_workspace_delete_tickets"
ON public.support_tickets FOR DELETE
TO anon, authenticated
USING (true);

INSERT INTO public.support_tickets (id, customer_name, subject, description, channel, category, priority, status, assigned_to, created_at, updated_at)
VALUES
  ('11111111-1111-4111-8111-111111111111', 'Bessie Cooper', 'Where is my order?', 'I placed an order yesterday and would like to know when it will arrive.', 'WhatsApp', 'Shipping', 'High', 'Open', 'Theresa Webb', now() - interval '2 minutes', now() - interval '2 minutes'),
  ('22222222-2222-4222-8222-222222222222', 'Brooklyn Simmons', 'Payment failed', 'My card was charged but the checkout page showed an error.', 'Website', 'Payment', 'High', 'Resolved', 'Theresa Webb', now() - interval '8 minutes', now() - interval '8 minutes'),
  ('33333333-3333-4333-8333-333333333333', 'Eleanor Pena', 'Refund request', 'Please help me process a refund for my recent purchase.', 'Email', 'Refund', 'Medium', 'Pending', 'Bessie Cooper', now() - interval '14 minutes', now() - interval '14 minutes'),
  ('44444444-4444-4444-8444-444444444444', 'Darlene Robertson', 'Can’t login', 'I have tried resetting my password but still cannot access my account.', 'WhatsApp', 'Login', 'Medium', 'Open', 'Theresa Webb', now() - interval '21 minutes', now() - interval '21 minutes'),
  ('55555555-5555-4555-8555-555555555555', 'Cameron Williamson', 'Product information', 'Can you share more details about the materials used in this product?', 'Email', 'General', 'Low', 'Resolved', 'Bessie Cooper', now() - interval '32 minutes', now() - interval '32 minutes'),
  ('66666666-6666-4666-8666-666666666666', 'Savannah Nguyen', 'Wrong item received', 'The package arrived today but it contains a different item.', 'Website', 'Order', 'High', 'Open', 'Theresa Webb', now() - interval '45 minutes', now() - interval '45 minutes')
ON CONFLICT (id) DO NOTHING;