# TalentForge — Recruitment Intelligence Platform

A professional recruitment intelligence SaaS that helps HR teams create job openings, upload and analyze PDF resumes, compare candidates against job-specific requirements, and manage a review workflow.

## Features

- **Multi-company workspaces** with role-based access (Owner, Admin, Recruiter, Reviewer)
- **Job management** — create, edit, and track job openings with required/preferred skills
- **Resume analysis** — guided 3-stage workflow: select job, upload PDFs, run AI analysis
- **Candidate ranking** — match scores, matched/missing skills, evidence-based analysis
- **Side-by-side comparison** — select up to 4 candidates and compare in a panel
- **Review workflow** — track candidates through New, Needs Review, Shortlisted, Interview, On Hold, Rejected, Hired
- **Recruiter notes** — add internal notes to candidate records
- **Reports** — score distributions, review progress, job activity, audit trail
- **Team management** — invite members, manage roles, revoke invitations
- **Settings** — workspace profile, account, security, data retention, AI processing disclosure

## Tech Stack

- React + TypeScript (strict)
- Vite
- Tailwind CSS + shadcn/ui
- React Router for navigation
- React Hook Form + Zod for validation
- Supabase (PostgreSQL + Auth + RLS)
- Recharts for reporting charts
- Lucide React for icons

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_BASE_URL=http://localhost:8000
```

- `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` — provided by your Supabase project.
- `VITE_API_BASE_URL` — URL of the Python/FastAPI analysis backend. Leave empty if the backend is not yet running; the UI will show a clear "not configured" message.

### Running the Development Server

```bash
npm run dev
```

### Building for Production

```bash
npm run build
```

## AI Analysis Backend

The resume analysis and ranking logic is handled by a separate Python/FastAPI application. This frontend integrates with two endpoints:

- `GET /health` — health check
- `POST /api/v1/resumes/rank` — accepts a JSON job description in the `job` multipart field and PDF files in the `files` field

The frontend reads the backend URL from `VITE_API_BASE_URL` and sends all requests through a centralized, typed API client. No AI provider keys are exposed to the browser.

### When the Backend is Not Available

If `VITE_API_BASE_URL` is not set or the backend is unreachable, the analysis workflow will display a clear error message instead of fabricating results.

## Database

The app uses Supabase (PostgreSQL) with Row Level Security enforced on every table. Data is scoped to organizations — users can only access data in workspaces where they have authorized membership.

### Schema

- `organizations` — company workspaces (tenant boundary)
- `organization_members` — user-org membership with roles
- `invitations` — pending team invitations
- `jobs` — job openings with skills and requirements
- `candidates` — analyzed candidate records with match scores
- `candidate_notes` — internal recruiter notes
- `audit_events` — audit trail of key actions

## Features Requiring Backend Implementation

The following UI features are designed but require additional backend work:

- **Data retention policies** — settings UI exists; enforcement requires a backend cron job
- **Password changes** — security settings UI exists; requires Supabase auth integration
- **Team member emails** — member list shows user IDs; displaying emails requires a server-side function or admin API
- **Resume file storage** — private Supabase Storage buckets for PDF upload/preview

## Architecture

```
src/
├── components/          # Shared UI components
│   ├── layout/          # App shell (sidebar, topbar, workspace switcher)
│   ├── ui/              # shadcn/ui primitives
│   ├── empty-states.tsx # Loading and empty state components
│   ├── score-display.tsx# Match score rings and bars
│   └── status-badges.tsx# Status badge components
├── contexts/            # React contexts (auth, organization)
├── hooks/               # Custom hooks (use-toast)
├── lib/                 # Core libraries
│   ├── api.ts           # Typed API client for FastAPI backend
│   ├── constants.ts     # App constants and type definitions
│   ├── format.ts        # Date, number, and text formatting utilities
│   ├── services.ts      # Database service layer (Supabase queries)
│   ├── supabase.ts      # Supabase client singleton
│   └── types.ts         # TypeScript interfaces
└── pages/               # Route pages
    ├── auth/            # Sign in, sign up, workspace setup
    ├── jobs/            # Jobs list, form, detail
    ├── candidates/      # Candidates list, detail
    ├── analysis.tsx     # 3-stage resume analysis workflow
    ├── overview.tsx     # Dashboard
    ├── reports.tsx      # Reports and analytics
    ├── team.tsx         # Team & access management
    └── settings.tsx     # Settings
```
