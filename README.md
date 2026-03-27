# TMG Dashboard - Top Marble & Granite

A production-style AI-integrated project management dashboard built for **Top Marble & Granite**, a marble and granite countertop fabrication and installation business.

## Features

### Core Modules
- **Executive Dashboard** - Visual KPIs, charts, urgent actions, contractor performance
- **Project Pipeline** - List and Kanban board views with 22-status lifecycle workflow
- **Project Detail** - Tabs for overview, scope, payments, schedule, files, communications, AI assistant
- **Customers** - Direct and contractor-referred customer management
- **Contractors** - Profiles with project history, revenue tracking, ratings
- **Consultation Form** - Digital intake form replacing paper process
- **Calendar** - Day/2-day/week views with color-coded events
- **Repairs** - Dedicated repair job tracking
- **Commercial Projects** - Milestone-based large project management
- **Payments & Finance** - Payment tracking, overdue alerts, revenue summaries
- **Reports & Analytics** - Operations, financial, and performance charts
- **Team** - Staff cards with role-based workload visibility

### Integrations (Service Layer Ready)
- **QuickBooks Online** - Invoice sync, payment status, customer references
- **Google Calendar** - Event creation for measurements, installations, fabrication
- **Twilio** - SMS and WhatsApp customer/team notifications
- **Email** - SendGrid-based notifications with pre-built templates
- **Claude AI** - Project summaries, next-step suggestions, message drafting, natural language search

### Automation Engine
- 8 pre-built automation rules for the project lifecycle
- Event-driven notification system with message templates
- Automation logging per project

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Database | PostgreSQL + Prisma ORM |
| Charts | Recharts |
| Icons | Lucide React |
| AI | Anthropic Claude API |

## Project Structure

```
src/
├── app/                        # Next.js pages and API routes
│   ├── page.tsx                # Executive Dashboard
│   ├── projects/               # Pipeline + Detail pages
│   ├── customers/              # Customer management
│   ├── contractors/            # Contractor list + detail
│   ├── consultation/           # Intake form
│   ├── calendar/               # Schedule & calendar
│   ├── repairs/                # Repair jobs
│   ├── commercial/             # Commercial projects
│   ├── payments/               # Finance & payments
│   ├── reports/                # Analytics
│   ├── team/                   # Team management
│   └── api/                    # REST API routes
├── components/
│   ├── layout/                 # Sidebar, Header
│   └── ui/                     # Card, Badge, Button, Table, Modal, Input, Select, Tabs
├── lib/
│   ├── types.ts                # TypeScript types, enums, status labels/colors
│   ├── utils.ts                # Utility functions
│   └── seed-data.ts            # Realistic mock data
├── services/
│   ├── quickbooks.ts           # QuickBooks Online
│   ├── google-calendar.ts      # Google Calendar
│   ├── messaging.ts            # SMS/WhatsApp/Email + templates
│   ├── ai.ts                   # Claude AI + prompt templates
│   └── automation.ts           # Event-driven automation engine
└── prisma/
    └── schema.prisma           # 15 models, 17 enums
```

## Getting Started

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start development server
npm run dev
```

The app runs at `http://localhost:3000` with seed data - no database required for the prototype.

### Database Setup (when ready)

```bash
npm run db:generate   # Generate Prisma client
npm run db:push       # Push schema to database
npm run db:migrate    # Run migrations
npm run db:studio     # Open Prisma Studio
```

## Environment Variables

See `.env.example` for all required variables including database, AI, QuickBooks, Google Calendar, Twilio, and SendGrid configuration.

## Status Model

22 main statuses from `New Lead` through `Closed`, plus 8 secondary statuses (On Hold, Repair Job, Commercial Project, etc.). Full status history with timestamps.

## Job Types

1. **Countertop** - Kitchen/bath/outdoor countertop installations
2. **Repair** - Chip repairs, seam fixes, polishing
3. **Cabinet Install** - Cabinet-only jobs
4. **Commercial** - Large projects with milestone tracking
