/*
# Create chat assistant conversation history

1. New Tables
- `assistant_sessions` stores each chat conversation a user has with the Relay assistant.
  - `id` identifies the session.
  - `title` stores a short label shown in the chat history list (derived from the first user message).
  - `created_at` records when the session started.
  - `updated_at` records the last activity timestamp.
- `assistant_messages` stores every message inside a chat session.
  - `id` identifies the message.
  - `session_id` links the message to its session (cascades on session delete).
  - `role` stores "user" or "assistant" to identify the speaker.
  - `content` stores the message text.
  - `sources` optionally stores a JSON array of knowledge article titles the assistant referenced.
  - `created_at` records when the message was sent.

2. Security
- Row level security enabled on both tables.
- Shared prototype workspace (no sign-in): anon and authenticated can read, insert, update, and delete their own chat sessions.
- service_role access granted for any future server-side cleanup.

3. Important Notes
- This is additive only; no existing tables or data are touched.
- Sessions are intentionally shared (single-tenant prototype) so any agent in the workspace can see the same chat history.
*/

CREATE TABLE IF NOT EXISTS public.assistant_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT 'New conversation',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.assistant_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.assistant_sessions(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  sources jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS assistant_messages_session_id_idx ON public.assistant_messages(session_id);
CREATE INDEX IF NOT EXISTS assistant_sessions_updated_at_idx ON public.assistant_sessions(updated_at DESC);

ALTER TABLE public.assistant_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assistant_messages ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.assistant_sessions TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.assistant_messages TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.assistant_sessions TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.assistant_messages TO service_role;

DROP POLICY IF EXISTS "shared_workspace_select_assistant_sessions" ON public.assistant_sessions;
CREATE POLICY "shared_workspace_select_assistant_sessions" ON public.assistant_sessions
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "shared_workspace_insert_assistant_sessions" ON public.assistant_sessions;
CREATE POLICY "shared_workspace_insert_assistant_sessions" ON public.assistant_sessions
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "shared_workspace_update_assistant_sessions" ON public.assistant_sessions;
CREATE POLICY "shared_workspace_update_assistant_sessions" ON public.assistant_sessions
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "shared_workspace_delete_assistant_sessions" ON public.assistant_sessions;
CREATE POLICY "shared_workspace_delete_assistant_sessions" ON public.assistant_sessions
  FOR DELETE TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "shared_workspace_select_assistant_messages" ON public.assistant_messages;
CREATE POLICY "shared_workspace_select_assistant_messages" ON public.assistant_messages
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "shared_workspace_insert_assistant_messages" ON public.assistant_messages;
CREATE POLICY "shared_workspace_insert_assistant_messages" ON public.assistant_messages
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "shared_workspace_update_assistant_messages" ON public.assistant_messages;
CREATE POLICY "shared_workspace_update_assistant_messages" ON public.assistant_messages
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "shared_workspace_delete_assistant_messages" ON public.assistant_messages;
CREATE POLICY "shared_workspace_delete_assistant_messages" ON public.assistant_messages
  FOR DELETE TO anon, authenticated USING (true);