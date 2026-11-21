export type TicketStatus = 'Open' | 'Pending' | 'Resolved';
export type View = 'overview' | 'inbox' | 'assigned' | 'customers' | 'analytics' | 'automations' | 'integrations' | 'website' | 'email' | 'whatsapp' | 'settings' | 'help';
export type Ticket = { id: string; customer_name: string; customer_email: string | null; agent_email: string | null; subject: string; description: string; channel: string; category: string; priority: string; status: TicketStatus; assigned_to: string | null; created_at: string; updated_at: string };
export type Message = { id: string; ticket_id: string; author_name: string; author_type: 'customer' | 'agent' | 'ai'; body: string; created_at: string };
export type Article = { id: string; title: string; content: string; category: string; updated_at: string };
export type NewTicket = Pick<Ticket, 'customer_name' | 'customer_email' | 'agent_email' | 'subject' | 'description' | 'channel' | 'category' | 'priority'>;
