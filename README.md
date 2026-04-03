<div align="center">

# 🔥 DevRoast

**Paste your code. Get roasted.**

A code review platform that scores submitted snippets, returns detailed findings and a suggested diff — with an optional full-sarcasm **roast mode**.

<br />

[![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=flat&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06B6D4?style=flat&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![tRPC](https://img.shields.io/badge/tRPC-11-2596BE?style=flat&logo=trpc&logoColor=white)](https://trpc.io/)
[![Drizzle](https://img.shields.io/badge/Drizzle-ORM-C5F74F?style=flat&logo=drizzle&logoColor=black)](https://orm.drizzle.team/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-4169E1?style=flat&logo=postgresql&logoColor=white)](https://neon.tech/)
[![Biome](https://img.shields.io/badge/Biome-2-60A5FA?style=flat&logo=biome&logoColor=white)](https://biomejs.dev/)

</div>

---

## 📋 Table of Contents

- [✨ Features](#-features)
- [⚙️ How It Works](#️-how-it-works)
- [🛠 Tech Stack](#-tech-stack)
- [🏗 Architecture](#-architecture)
- [🗄 Database Schema](#-database-schema)
- [🚀 Getting Started](#-getting-started)
- [🔐 Environment Variables](#-environment-variables)
- [📜 Scripts](#-scripts)

---

## ✨ Features

| Feature | Description |
| --- | --- |
| 🎨 **Syntax Highlighting** | Real-time highlighting in the code editor, powered by Shiki with auto-detection via highlight.js |
| 🔥 **Roast Mode** | Toggle between honest analysis and maximum-sarcasm mode |
| 📊 **Scored Feedback** | Every submission receives a score from 0 to 10 alongside categorized findings (`critical`, `warning`, `good`) |
| 🔀 **Suggested Diff** | Each result includes a before/after diff of the recommended fix |
| 🏆 **Shame Leaderboard** | Publicly ranks submissions by score with a live code preview |
| 📈 **Animated Stats** | Homepage metrics animate from zero on load via NumberFlow |

---

## ⚙️ How It Works

```mermaid
flowchart LR
    A["📝 Paste Code\n(editor)"] --> B["🎛 Choose Mode\n(honest / 🔥 roast)"]
    B --> C["🚀 Submit\n(tRPC mutation)"]
    C --> D["🤖 AI Analyzes\nthe snippet"]
    D --> E["📊 Score + Findings\n+ Suggested Diff"]
    E --> F["📄 Result Page"]
    F --> G["🏆 Shame Leaderboard\n(if public)"]
```

---

## 🛠 Tech Stack

| Layer | Technology |
| --- | --- |
| **Framework** | Next.js 16 — App Router, React Compiler, Turbopack |
| **UI** | React 19, Tailwind CSS v4, Shiki, NumberFlow |
| **API** | tRPC v11, TanStack React Query v5 |
| **Database** | Drizzle ORM, PostgreSQL (Neon) |
| **Validation** | Zod v4 |
| **Linter / Formatter** | Biome 2 |
| **Package Manager** | pnpm |

---

## 🏗 Architecture

```mermaid
graph TD
    User["User"]

    subgraph Frontend["Next.js 16 — App Router"]
        Page["page.tsx · Server Component"]
        Editor["CodeInput · Client Component"]
        Stats["StatsHint · Client Component"]
        Result["roast/[id] · Server Component"]
        LB["Leaderboard · Server Component"]
    end

    subgraph API["tRPC v11"]
        Router["AppRouter"]
        LBRouter["leaderboard\nstats · list"]
        SubRouter["submissions\ngetById · create"]
    end

    subgraph DB["Drizzle ORM · Neon PostgreSQL"]
        Submissions[("submissions")]
        Findings[("analysis_findings")]
    end

    User --> Page
    Page --> Editor
    Page --> Stats
    User --> Result
    User --> LB

    Stats -->|"useQuery"| Router
    Editor -->|"useMutation"| Router
    Result -->|"caller.getById"| Router
    LB -->|"prefetch"| Router

    Router --> LBRouter
    Router --> SubRouter

    LBRouter --> Submissions
    SubRouter --> Submissions
    SubRouter --> Findings
    Submissions -->|"cascade delete"| Findings
```

---

## 🗄 Database Schema

```mermaid
erDiagram
    submissions {
        uuid id PK
        text code
        varchar code_preview
        text lang
        enum roast_mode
        numeric score
        text roast_text
        boolean is_public
        timestamptz created_at
    }

    analysis_findings {
        uuid id PK
        uuid submission_id FK
        enum severity
        text title
        text description
        integer sort_order
    }

    submissions ||--o{ analysis_findings : "has"
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [pnpm](https://pnpm.io/) 9+
- A PostgreSQL database — either a [Neon](https://neon.tech/) cloud instance **or** a local container via Docker Compose

### Installation

#### 1. Clone the repository

```bash
git clone https://github.com/andersonkaiti/devroast.git
cd devroast
```

#### 2. Install dependencies

```bash
pnpm install
```

#### 3. Set up the database

Choose one of the options below and set `DATABASE_URL` in your `.env`:

```bash
cp .env.example .env
```

> **Option A — Neon (cloud)**
>
> ```env
> DATABASE_URL=postgresql://<user>:<password>@<host>.neon.tech/<db>?sslmode=require
> ```

> **Option B — Docker Compose (local)**
>
> ```bash
> docker compose up -d
> ```
>
> ```env
> DATABASE_URL=postgresql://devroast:devroast@localhost:5432/devroast
> ```

#### 4. Apply the database schema

```bash
pnpm db:push
```

#### 5. Seed sample data _(optional)_

```bash
pnpm db:seed
```

#### 6. Start the development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔐 Environment Variables

| Variable | Description | Required |
| --- | --- | --- |
| `DATABASE_URL` | PostgreSQL connection string (Neon **or** local Docker) | ✅ |

Copy `.env.example` to `.env` and fill in the values before starting the server.
