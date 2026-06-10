@AGENTS.md

# World Knowledge — AI Assistant Guide

## Project Overview

**World Knowledge** is a bilingual (English/Chinese) Markdown-based documentation CMS. It provides a public docs viewer and a protected admin interface for managing documents, users, and categories. The default admin login is `admin` / `admin123`.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, SSR) |
| Language | TypeScript 5 |
| UI | React 19, Tailwind CSS v4 |
| Database | SQLite via `better-sqlite3` |
| Auth | JWT (`jsonwebtoken`) + `bcryptjs` |
| Markdown parsing | `gray-matter` (frontmatter), `react-markdown` |
| Markdown editor | `@uiw/react-md-editor` |
| Code highlighting | `prism-react-renderer` |
| Dark mode | `next-themes` |

`better-sqlite3` is a native module — it requires a Node.js server. **Vercel Serverless is not a reliable deployment target.** Use a VPS with PM2 or Docker instead.

## Development Workflow

```bash
npm run dev      # Start dev server on port 3002
npm run build    # Production build
npm start        # Start production server on port 3002
npm run lint     # Run ESLint
```

No test runner is configured. There are no unit, integration, or E2E tests.

The SQLite database is auto-created at `data/app.db` on first run. The default admin user is seeded automatically by `src/lib/db.ts`.

**Environment variables:**
- `JWT_SECRET` — defaults to `'doc-management-secret-key-change-in-production'`. Override in production.

## Directory Structure

```
src/
├── app/
│   ├── layout.tsx                    # Root layout (ThemeProvider, metadata)
│   ├── page.tsx                      # Home page (redirects to /docs)
│   ├── Providers.tsx                 # Client-side context providers
│   ├── LanguageContext.tsx           # Language state (en/zh)
│   ├── globals.css                   # Global Tailwind styles
│   ├── docs/[[...slug]]/page.tsx     # Public docs viewer (SSR, catch-all)
│   ├── admin/
│   │   ├── layout.tsx                # Admin root layout
│   │   ├── login/page.tsx            # Login form
│   │   └── (dashboard)/
│   │       ├── layout.tsx            # Dashboard layout with AdminSidebar
│   │       ├── page.tsx              # Dashboard stats & recent docs
│   │       ├── documents/page.tsx    # Document list (filterable by category)
│   │       ├── documents/new/page.tsx
│   │       ├── documents/edit/[...slug]/page.tsx
│   │       ├── users/page.tsx        # User CRUD
│   │       ├── categories/page.tsx   # Category reordering
│   │       └── password/page.tsx     # Change password
│   └── api/
│       ├── auth/login/route.ts       # POST — issues JWT cookie
│       ├── auth/register/route.ts    # POST — creates user
│       ├── auth/password/route.ts    # POST — changes password
│       ├── documents/route.ts        # GET list, POST create
│       ├── documents/[...slug]/route.ts  # GET, PUT, DELETE single doc
│       ├── documents/history/[...slug]/route.ts  # GET version history
│       ├── users/route.ts            # GET list, POST create, DELETE user
│       ├── search/route.ts           # GET full-text search
│       └── categories/route.ts       # PUT category order
├── components/
│   ├── Sidebar.tsx                   # Public docs sidebar (category tree)
│   ├── TableOfContents.tsx           # Right-side TOC (h2–h4 anchors)
│   ├── MarkdownRenderer.tsx          # react-markdown with custom components
│   ├── CodeBlock.tsx                 # Syntax-highlighted code via prism-react-renderer
│   ├── SearchDialog.tsx              # Full-text search modal
│   ├── ThemeToggle.tsx               # Dark/light toggle
│   ├── LanguageSwitcher.tsx          # Language toggle (en/zh)
│   ├── ApiEndpoint.tsx               # Badge for API method + path
│   └── admin/
│       ├── AdminSidebar.tsx
│       ├── DocumentEditor.tsx        # @uiw/react-md-editor wrapper
│       └── UserTable.tsx
└── lib/
    ├── db.ts                         # SQLite init, schema, admin seed
    ├── auth.ts                       # JWT sign/verify, bcrypt, user CRUD
    ├── documents.ts                  # Markdown file I/O, slug ↔ path mapping
    ├── search.ts                     # Full-text search (in-memory .includes())
    ├── i18n.ts                       # Translation strings (en/zh)
    └── types.ts                      # Shared TypeScript interfaces

content/
├── categories.json                   # Ordered category list for sidebar
└── docs/
    ├── en/                           # English documents
    └── zh/                           # Chinese documents
```

## Content: Markdown Documents

Documents live at `content/docs/{lang}/{category}/{slug}.md`. Subdirectories are supported; the URL slug mirrors the path.

**Required frontmatter (gray-matter):**
```yaml
---
title: Page Title
category: Category Name   # must match an entry in content/categories.json
order: 1                  # controls sort order within category
tags: [tag1, tag2]
api_method: GET           # optional, renders ApiEndpoint badge
api_path: /api/v1/route   # optional
---
```

Adding a new category requires adding it to `content/categories.json` as well. Category order in that file controls sidebar order.

## Database Schema

Auto-created at `data/app.db`:

```sql
CREATE TABLE users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  username      TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role          TEXT DEFAULT 'viewer'
                  CHECK(role IN ('admin', 'editor', 'viewer')),
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE document_history (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  file_path  TEXT NOT NULL,
  content    TEXT NOT NULL,
  edited_by  INTEGER REFERENCES users(id),
  version    INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

All user queries go through `src/lib/auth.ts`. All document history queries are in the API route handlers.

## Authentication

- **Mechanism:** JWT stored in an `httpOnly` cookie named `auth_token`. Also stored in `localStorage` for client-side checks.
- **Secret:** `process.env.JWT_SECRET` (see environment variables above).
- **Expiry:** 24 hours.
- **Payload:** `{ id, username, role }`.
- **Middleware:** `middleware.ts` at the repo root guards all `/admin/*` routes (except `/admin/login`) by checking that the cookie contains a valid JWT (three dot-separated parts).

**Roles:**
- `admin` — full CRUD on documents and users
- `editor` — create and edit documents only
- `viewer` — read-only

## Key Patterns

### API Routes
All API routes in `src/app/api/` are Next.js Route Handlers. They return `Response` or `NextResponse` objects. Auth is enforced in each handler by calling `verifyToken()` from `src/lib/auth.ts` — there is no centralized API middleware.

### Slug Handling
Document slugs are derived from the file path relative to `content/docs/{lang}/`, with the `.md` extension stripped. The helpers `encodeSlug()` / `decodeSlug()` in `src/lib/documents.ts` handle URL encoding for paths containing non-ASCII characters (e.g., Chinese category names).

### Multilingual
Language is determined by a `lang` cookie (`en` or `zh`). The `LanguageContext` in `src/app/LanguageContext.tsx` exposes it client-side. SSR pages read the cookie from request headers. UI strings are keyed in `src/lib/i18n.ts`.

### Markdown Rendering
The public viewer (`src/app/docs/[[...slug]]/page.tsx`) fetches document content server-side and passes it to `MarkdownRenderer`. Custom components in `MarkdownRenderer.tsx` replace default HTML elements — notably `code` (→ `CodeBlock`) and `a` (→ Next.js `Link`).

### Search
Search is real-time and in-memory: `src/lib/search.ts` reads all markdown files, parses frontmatter, and runs `.includes()` on title, content, category, tags, and `api_path`. There is no search index or database backing.

---

## Behavioral Guidelines

These guidelines reduce common LLM coding mistakes. Bias toward caution over speed; use judgment for trivial tasks.

### 1. Think Before Coding

Before implementing, state assumptions explicitly. If multiple interpretations exist, present them — don't pick silently. If a simpler approach exists, say so. If something is unclear, stop and ask.

### 2. Simplicity First

Write the minimum code that solves the problem. No features beyond what was asked. No abstractions for single-use code. No error handling for impossible scenarios. If 200 lines could be 50, rewrite it.

### 3. Surgical Changes

Touch only what you must. Don't improve adjacent code or formatting. Match existing style. If you notice unrelated dead code, mention it — don't delete it. Remove only imports/variables/functions that *your* changes made unused.

### 4. Goal-Driven Execution

Transform tasks into verifiable goals before starting. For multi-step tasks, state a brief plan with explicit verification steps.
