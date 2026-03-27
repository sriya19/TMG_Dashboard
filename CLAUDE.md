@AGENTS.md

# TMG Dashboard - Development Notes

## Tech Stack
- Next.js 16 (App Router) + TypeScript + Tailwind CSS v4
- Prisma ORM + PostgreSQL
- Recharts for charts
- Lucide React for icons
- Claude API (@anthropic-ai/sdk) for AI features

## Project Structure
- `src/app/` - Next.js pages and API routes
- `src/components/` - Reusable UI components (layout/, ui/)
- `src/lib/` - Types, utilities, seed data
- `src/services/` - Integration services (QuickBooks, Google Calendar, Twilio, AI, Automation)
- `prisma/` - Database schema

## Key Patterns
- All pages use seed data from `src/lib/seed-data.ts` for prototype
- Services in `src/services/` are integration-ready with mock implementations
- API routes in `src/app/api/` have Prisma query patterns commented for when DB is connected
- Status model uses 22 main statuses + 8 secondary statuses (see `src/lib/types.ts`)

## Running
```bash
npm run dev    # Start development server
npm run build  # Production build
```
