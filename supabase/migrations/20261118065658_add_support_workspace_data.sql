/*
# Add durable conversation and AI workspace data

1. New Tables
- `ticket_messages` stores public customer and agent messages for each support ticket.
- `ticket_messages.id` identifies a message.
- `ticket_messages.ticket_id` links the message to a support ticket.
- `ticket_messages.author_name` stores the visible sender name.
- `ticket_messages.author_type` stores customer, agent, or ai.
- `ticket_messages.body` stores the message text.
- `ticket_messages.created_at` records when the message was sent.
- `knowledge_articles` stores the answers used by Relay AI.
- `knowledge_articles.id` identifies an article.
- `knowledge_articles.title` stores the searchable question or topic.
- `knowledge_articles.content` stores the answer shown to agents and customers.
- `knowledge_articles.category` groups related answers.
- `knowledge_articles.updated_at` records the latest edit.

2. Security
- Row level security is enabled on both new tables.
- This prototype intentionally uses a shared workspace without sign-in, so anon and authenticated roles receive explicit CRUD access.
- Foreign-key deletion removes messages when a ticket is removed, preventing orphaned conversation records.

3. Seed Data
- Existing demo tickets receive representative customer and agent messages.
- A small knowledge base is added so the Ask Relay AI flow can answer common support questions without an external AI service.

4. Important Notes
- All writes are persisted in Supabase and are available after reload.
- The AI experience is deliberately transparent: it searches the maintained knowledge base and offers a human handoff when no answer is found.
*/

CREATE TABLE IF NOT EXISTS public.ticket_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  author_name text NOT NULL,
  author_type text NOT NULL DEFAULT 'agent',
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.knowledge_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  category text NOT NULL DEFAULT 'General',
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ticket_messages_ticket_id_idx ON public.ticket_messages(ticket_id);
CREATE INDEX IF NOT EXISTS knowledge_articles_category_idx ON public.knowledge_articles(category);

ALTER TABLE public.ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_articles ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.ticket_messages TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.knowledge_articles TO anon, authenticated;

DROP POLICY IF EXISTS "shared_workspace_select_messages" ON public.ticket_messages;
CREATE POLICY "shared_workspace_select_messages" ON public.ticket_messages FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "shared_workspace_insert_messages" ON public.ticket_messages;
CREATE POLICY "shared_workspace_insert_messages" ON public.ticket_messages FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "shared_workspace_update_messages" ON public.ticket_messages;
CREATE POLICY "shared_workspace_update_messages" ON public.ticket_messages FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "shared_workspace_delete_messages" ON public.ticket_messages;
CREATE POLICY "shared_workspace_delete_messages" ON public.ticket_messages FOR DELETE TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "shared_workspace_select_articles" ON public.knowledge_articles;
CREATE POLICY "shared_workspace_select_articles" ON public.knowledge_articles FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "shared_workspace_insert_articles" ON public.knowledge_articles;
CREATE POLICY "shared_workspace_insert_articles" ON public.knowledge_articles FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "shared_workspace_update_articles" ON public.knowledge_articles;
CREATE POLICY "shared_workspace_update_articles" ON public.knowledge_articles FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "shared_workspace_delete_articles" ON public.knowledge_articles;
CREATE POLICY "shared_workspace_delete_articles" ON public.knowledge_articles FOR DELETE TO anon, authenticated USING (true);

INSERT INTO public.ticket_messages (ticket_id, author_name, author_type, body, created_at)
SELECT id, 'Bessie Cooper', 'customer', description, created_at
FROM public.support_tickets
WHERE id = '11111111-1111-4111-8111-111111111111'
  AND NOT EXISTS (SELECT 1 FROM public.ticket_messages WHERE ticket_id = id);

INSERT INTO public.ticket_messages (ticket_id, author_name, author_type, body, created_at)
SELECT id, 'Theresa Webb', 'agent', 'I’m checking the latest delivery update for you now. I’ll be back with a confirmed arrival date shortly.', now() - interval '1 minute'
FROM public.support_tickets
WHERE id = '11111111-1111-4111-8111-111111111111'
  AND NOT EXISTS (SELECT 1 FROM public.ticket_messages WHERE ticket_id = id AND author_type = 'agent');

INSERT INTO public.ticket_messages (ticket_id, author_name, author_type, body, created_at)
SELECT id, customer_name, 'customer', description, created_at
FROM public.support_tickets
WHERE id <> '11111111-1111-4111-8111-111111111111'
  AND NOT EXISTS (SELECT 1 FROM public.ticket_messages WHERE ticket_id = id);

INSERT INTO public.knowledge_articles (id, title, content, category)
VALUES
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'Where is my order?', 'Orders usually arrive within 3–5 business days. Customers can find the latest delivery update in their confirmation email. If an order is past the expected date, ask for the order number and check the carrier status.', 'Shipping'),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'Payment failed', 'Ask the customer to confirm their billing address and try the payment again. If the issue continues, recommend another payment method and check whether the bank declined the transaction.', 'Payment'),
  ('cccccccc-cccc-4ccc-8ccc-cccccccccccc', 'How do I request a refund?', 'Refund requests can be reviewed within 30 days of delivery. Ask for the order number and reason, then confirm the refund decision and expected processing time.', 'Refund'),
  ('dddddddd-dddd-4ddd-8ddd-dddddddddddd', 'I cannot log in', 'Send the password reset link and ask the customer to check spam or promotions folders. If the reset link has expired, issue a new one and escalate account verification to an agent.', 'Login')
ON CONFLICT (id) DO NOTHING;