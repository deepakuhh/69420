import type { Article } from '@/lib/types';

export type AssistantSource = { title: string; category: string };

export type AssistantReply = {
  content: string;
  sources: AssistantSource[];
};

type Intent = {
  id: string;
  keywords: string[];
  answer: (articles: Article[]) => AssistantReply;
};

const appGuide: Intent[] = [
  {
    id: 'overview',
    keywords: ['what is relay', 'about relay', 'what does relay', 'overview', 'tell me about', 'what can relay do', 'what is this', 'what is this app'],
    answer: () => ({
      content:
        "Relay is a shared customer support workspace. It brings every customer conversation — from email, website chat, and WhatsApp — into one inbox so your team can triage, assign, reply to, and resolve tickets together. The dashboard shows live metrics like open conversations, response times, and customer satisfaction, and a built-in assistant (me!) helps you find answers from your approved knowledge base. There's no sign-in required for this shared workspace prototype, so any agent on the team can jump straight in.",
      sources: [],
    }),
  },
  {
    id: 'inbox',
    keywords: ['inbox', 'where are my tickets', 'find tickets', 'see conversations', 'view tickets', 'ticket list', 'all conversations'],
    answer: () => ({
      content:
        "Your inbox is the 'Inbox' page in the left sidebar. It shows every customer conversation in one list, with the customer name, subject, channel, priority, status, and time. You can use the search bar at the top to search by customer name, subject, or category, and the status dropdown to filter by Open, Pending, or Resolved. Click any row to open the full conversation thread.",
      sources: [],
    }),
  },
  {
    id: 'assigned',
    keywords: ['assigned to me', 'my tickets', 'my conversations', 'what am i working on', 'my assigned'],
    answer: () => ({
      content:
        "The 'Assigned to me' page in the sidebar shows only the conversations assigned to you (Theresa Webb in this workspace). It's a quick way to see exactly what's on your plate. New tickets you create are automatically assigned to Theresa Webb.",
      sources: [],
    }),
  },
  {
    id: 'reply',
    keywords: ['how do i reply', 'send a reply', 'respond to a ticket', 'answer a customer', 'reply to customer', 'write a reply'],
    answer: () => ({
      content:
        "To reply to a customer, open any ticket and use the reply box at the bottom of the drawer. Type your message and press 'Send reply'. Your reply is saved to the conversation thread, the ticket status automatically moves to 'Pending' (waiting for the customer), and an email notification is sent to the customer and the assigned agent if their email addresses are saved on the ticket.",
      sources: [],
    }),
  },
  {
    id: 'status',
    keywords: ['change status', 'ticket status', 'mark resolved', 'mark as resolved', 'open pending resolved', 'update status', 'close a ticket', 'resolve a ticket'],
    answer: () => ({
      content:
        "Each ticket has one of three statuses — Open, Pending, or Resolved. Open means the ticket is new or still needs work. Pending means you've replied and are waiting on the customer. Resolved means the issue is closed. To change a status, open the ticket and use the Status dropdown in the details section. When the status changes, the customer and agent receive an email notification automatically.",
      sources: [],
    }),
  },
  {
    id: 'assign',
    keywords: ['assign', 'assignment', 'who is working', 'reassign', 'assign ticket', 'assign to agent', 'change assignee'],
    answer: () => ({
      content:
        "You can assign or reassign a ticket from the ticket drawer. Open the ticket and use the 'Assigned to' dropdown in the details grid to pick Theresa Webb, Bessie Cooper, or Unassigned. This lets your team balance workload and make sure every conversation has an owner.",
      sources: [],
    }),
  },
  {
    id: 'create-ticket',
    keywords: ['create a ticket', 'new ticket', 'create ticket', 'add a ticket', 'make a ticket', 'start a conversation', 'create new', 'add new ticket'],
    answer: () => ({
      content:
        "To create a new support ticket, click the 'New ticket' button at the top of the Inbox, Assigned, or any channel page (or the + button on the overview). Fill in the customer's name, their email, the agent email for notifications, a subject, the issue description, the channel (Email, Website, or WhatsApp), category, and priority. The ticket is created as Open and assigned to Theresa Webb, and the customer's first message is added to the thread automatically.",
      sources: [],
    }),
  },
  {
    id: 'customers',
    keywords: ['customers', 'customer list', 'customer page', 'see customers', 'who are my customers', 'customer relationships'],
    answer: () => ({
      content:
        "The 'Customers' page in the sidebar shows every customer who has a ticket, grouped by name. Each card shows the customer's avatar, their latest channel and category, the status of their most recent ticket, and when they last contacted you. Click a card to open that conversation.",
      sources: [],
    }),
  },
  {
    id: 'analytics',
    keywords: ['analytics', 'metrics', 'reports', 'stats', 'statistics', 'performance', 'resolution rate', 'customer satisfaction', 'data'],
    answer: () => ({
      content:
        "The 'Analytics' page gives you a performance snapshot: resolution rate, high-priority count, average first reply time, and the customer rating. Below the metric cards you'll find the conversation volume chart (incoming vs resolved over the last 7 days) and the live category breakdown. It's the quickest way to understand workload and team speed.",
      sources: [],
    }),
  },
  {
    id: 'automations',
    keywords: ['automation', 'automations', 'workflow', 'rules', 'auto classify', 'escalate', 'auto close', 'trigger'],
    answer: () => ({
      content:
        "The 'Automations' page shows your workflow rules. Relay comes with three: 'Classify new tickets' (AI assigns category and priority), 'Escalate urgent conversations' (notifies Theresa when a high-priority ticket waits 15 minutes), and 'Close resolved conversations' (moves tickets to closed after 48 hours without a reply). Toggle each rule on or off with the switch on the right. Remember: Relay only suggests — an agent always makes the final decision before anything is sent.",
      sources: [],
    }),
  },
  {
    id: 'integrations',
    keywords: ['integration', 'integrations', 'connect', 'channels', 'email setup', 'website chat widget', 'whatsapp', 'knowledge base connect', 'connections'],
    answer: () => ({
      content:
        "The 'Integrations' page shows the channels connected to your workspace. Website Chat and Email are connected by default, the Knowledge Base powers Relay AI answers, and WhatsApp can be connected to bring those conversations into your shared inbox. This is where you manage how customers reach your team.",
      sources: [],
    }),
  },
  {
    id: 'channels',
    keywords: ['website chat', 'email channel', 'whatsapp channel', 'channels', 'where do messages come from', 'message channels'],
    answer: () => ({
      content:
        "Relay supports three channels: Website Chat, Email, and WhatsApp. Each has its own page in the sidebar under 'Channels' where you see only the conversations that came in through that source. Every ticket is tagged with its channel so you can filter and report on where your customers are reaching you.",
      sources: [],
    }),
  },
  {
    id: 'settings',
    keywords: ['settings', 'preferences', 'workspace settings', 'compact rows', 'sound notifications', 'ai preferences', 'team members'],
    answer: () => ({
      content:
        "The 'Settings' page lets you shape the workspace. Under General you can toggle compact conversation rows, sound notifications, and whether AI replies need agent approval before sending. There are also tabs for Team members, Notifications, and AI preferences. Click 'Save changes' to confirm your choices.",
      sources: [],
    }),
  },
  {
    id: 'notifications',
    keywords: ['email notification', 'notifications', 'notify customer', 'notify agent', 'email alerts', 'ticket update email', 'notification events'],
    answer: () => ({
      content:
        "Relay sends email notifications automatically when you reply to a ticket or change its status. The customer and the assigned agent each receive an email at the addresses saved on the ticket. Every delivery attempt is recorded so you can see whether it was sent, is pending, or failed. Notifications are sent through an email provider configured on the server side — if that provider isn't set up yet, the ticket is still saved but you'll see a notice that the email couldn't be delivered.",
      sources: [],
    }),
  },
  {
    id: 'knowledge',
    keywords: ['knowledge base', 'knowledge article', 'approved answers', 'relay ai answers', 'how does ai answer', 'where do ai answers come from'],
    answer: () => ({
      content:
        "Relay AI answers come from your approved knowledge base — a set of short, specific articles your team has written for common questions. When you ask a question, I search those articles for a match. If I find one, I'll show you the approved answer and the source. If there's no match yet, I'll let you know so you can hand the conversation to a human agent or add a new article. Keeping the knowledge base up to date is the best way to make the assistant more helpful over time.",
      sources: [],
    }),
  },
  {
    id: 'help',
    keywords: ['help', 'support', 'contact support', 'help and support', 'get help', 'reach the team', 'guide', 'getting started'],
    answer: () => ({
      content:
        "The 'Help & Support' page has three quick resources: a getting-started guide for triaging and replying to tickets, knowledge base tips for writing effective AI answers, and a contact support option to reach the Relay team. You can also just ask me — I'm here to answer any question about how Relay works.",
      sources: [],
    }),
  },
  {
    id: 'priority',
    keywords: ['priority', 'high priority', 'low priority', 'medium priority', 'what does priority mean', 'ticket priority'],
    answer: () => ({
      content:
        "Every ticket has a priority — Low, Medium, or High. High priority means the issue is urgent and should be handled first; Medium is the default for normal issues; Low is for non-urgent requests. You set the priority when creating a ticket, and the automations page can escalate high-priority tickets that have been waiting too long.",
      sources: [],
    }),
  },
  {
    id: 'categories',
    keywords: ['category', 'categories', 'ticket category', 'shipping payment refund order technical login', 'what categories'],
    answer: () => ({
      content:
        "Tickets are sorted into six categories: Shipping, Payment, Refund, Order, Technical, and Login (plus General for anything else). The category shows up under the subject in the ticket list and on the Analytics page as a distribution chart, so you can see at a glance what your customers need help with most.",
      sources: [],
    }),
  },
];

function scoreIntent(text: string, intent: Intent): number {
  const lower = text.toLowerCase();
  return intent.keywords.reduce((total, keyword) => (lower.includes(keyword) ? total + 1 : total), 0);
}

function searchArticles(question: string, articles: Article[]): Article[] {
  const terms = question.toLowerCase().split(/\s+/).filter((term) => term.length > 2);
  return articles
    .map((article) => {
      const haystack = `${article.title} ${article.content} ${article.category}`.toLowerCase();
      const hits = terms.filter((term) => haystack.includes(term)).length;
      return { article, hits };
    })
    .filter((entry) => entry.hits > 0)
    .sort((a, b) => b.hits - a.hits)
    .slice(0, 2)
    .map((entry) => entry.article);
}

export function getAssistantReply(question: string, articles: Article[]): AssistantReply {
  const trimmed = question.trim();
  if (!trimmed) return { content: "I didn't catch that. Could you rephrase your question?", sources: [] };

  const scored = appGuide
    .map((intent) => ({ intent, score: scoreIntent(trimmed, intent) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score);

  const matchedArticles = searchArticles(trimmed, articles);

  if (scored.length > 0 && scored[0].score >= 1) {
    const guideReply = scored[0].intent.answer(articles);
    if (matchedArticles.length > 0) {
      const articleText = matchedArticles
        .map((article) => `From the knowledge base — ${article.title}: ${article.content}`)
        .join('\n\n');
      return {
        content: `${guideReply.content}\n\n${articleText}`,
        sources: matchedArticles.map((article) => ({ title: article.title, category: article.category })),
      };
    }
    return guideReply;
  }

  if (matchedArticles.length > 0) {
    return {
      content: matchedArticles.map((article) => `${article.title}: ${article.content}`).join('\n\n'),
      sources: matchedArticles.map((article) => ({ title: article.title, category: article.category })),
    };
  }

  return {
    content:
      "I'm not sure I have an exact answer for that yet. I can help with how Relay works — creating and replying to tickets, statuses, assignments, channels, analytics, automations, integrations, settings, notifications, and the knowledge base. Try asking something like 'How do I reply to a customer?' or 'What does the Inbox do?' If it's a customer-specific question, consider adding it to the knowledge base so I can answer it next time.",
    sources: [],
  };
}

export const suggestedQuestions = [
  'What is Relay?',
  'How do I reply to a customer?',
  'How do I change a ticket status?',
  'How do email notifications work?',
  'What does the Analytics page show?',
  'How do I create a new ticket?',
];
