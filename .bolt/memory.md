# Project memory

## Product intent & audience

- Customer support dashboard named "Relay" for managing support tickets in a shared workspace.
- Prototype-stage product; no authentication/sign-in flow — acts as a shared support workspace.
- Audience: internal support agents managing and resolving customer conversations.

## Brand personality & voice

- Professional support-tool aesthetic; polished and production-worthy rather than minimal/cookie-cutter.
- Dashboard-oriented UX with data-dense but organized presentation.

## Visual design & UX direction

- Full dashboard layout: sidebar navigation, metrics/KPI cards, charts, AI activity panel, ticket categories, satisfaction metrics, recent conversations list.
- Responsive across screen sizes.
- Supports ticket interactions: search, status filters, ticket detail view, assignment/status updates, and create-ticket form.
- Hotlinked images are acceptable for reference assets during build.

## Decisions, constraints & rationale

- Stack: Vite + React + Tailwind CSS + Lucide React icons; `@/` alias for `src/` imports.
- Backend: Supabase with a `support_tickets` table as the core data model.
- Security: row-level access policies enabled on the Supabase table.
- Database seeded with representative support conversations for demo/testing.
- No auth gating in this prototype — dashboard reads/writes directly to Supabase without sign-in.
- Project passes build, type checking, linting, and Supabase security checks.

## Open questions & assumptions

- Auth/multi-user role separation may be needed for production (currently assumed not required).
- Supabase credentials and project URL are expected to be configured in environment variables.
- Schema for `support_tickets` inferred from UI needs (status, assignee, priority, conversation data); exact migration SQL not confirmed by user.
- Hotlinked images may need replacement with locally hosted assets before production deployment.