# Project memory

## Product intent & audience

- Customer support dashboard named "Relay" for managing support tickets in a shared workspace.
- Prototype-stage product; no authentication/sign-in flow — acts as a shared support workspace.
- Audience: internal support agents managing and resolving customer conversations.
- Added a conversational assistant chatbot that answers questions about the entire Relay application.

## Brand personality & voice

- Professional support-tool aesthetic; polished and production-worthy rather than minimal/cookie-cutter.
- Dashboard-oriented UX with data-dense but organized presentation.

## Visual design & UX direction

- Full dashboard layout: sidebar navigation, metrics/KPI cards, charts, AI activity panel, ticket categories, satisfaction metrics, recent conversations list.
- Responsive across screen sizes.
- Supports ticket interactions: search, status filters, ticket detail view, assignment/status updates, and create-ticket form.
- Chat assistant: floating bottom-right button ("Ask Relay Assistant"), full chat window with conversation sidebar, suggested starter questions, typing indicator, cited knowledge-base sources.
- Hotlinked images are acceptable for reference assets during build.

## Decisions, constraints & rationale

- Stack: Vite + React + Tailwind CSS + Lucide React icons; `@/` alias for `src/` imports.
- Backend: Supabase with a `support_tickets` table as the core data model; separate chat history tables added for assistant conversations.
- Assistant replaced the old one-shot AiModal with a full ChatAssistant component (multi-turn chat, history persistence, conversation switching/deletion).
- Assistant knowledge engine covers inbox, replies, statuses, assignments, ticket creation, customers, analytics, automations, integrations, channels, settings, notifications, priorities, categories, and knowledge base.
- Shared types file created for assistant imports.
- Chat window CSS appended to `index.css`.
- Security: row-level access policies enabled on the Supabase table.
- Database seeded with representative support conversations for demo/testing.
- No auth gating in this prototype — dashboard reads/writes directly to Supabase without sign-in.
- Project passes build, type checking, linting, and Supabase security checks.

## Open questions & assumptions

- Auth/multi-user role separation may be needed for production (currently assumed not required).
- Supabase credentials and project URL are expected to be configured in environment variables.
- Schema for `support_tickets` and chat history tables inferred from UI needs; exact migration SQL not confirmed by user.
- Knowledge base articles assumed to exist with an approval status; source-citation depends on that data.
- Hotlinked images may need replacement with locally hosted assets before production deployment.