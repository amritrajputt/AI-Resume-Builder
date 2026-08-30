# AI Resume Builder & Sandboxed LaTeX Compiler

An enterprise-grade, event-driven platform designed to convert structured resume profile data into publication-quality LaTeX documents and render compiled PDF artifacts within an isolated, zero-trust Docker execution environment.

[![Tech Stack](https://img.shields.io/badge/Stack-Next.js%2016%20%7C%20Express%205%20%7C%20Bun-blue.svg)](https://bun.sh)
[![Database](https://img.shields.io/badge/Database-PostgreSQL%20%7C%20Drizzle-blueviolet.svg)](https://orm.drizzle.team)
[![Orchestration](https://img.shields.io/badge/Pipeline-Inngest-orange.svg)](https://www.inngest.com)
[![Compiler](https://img.shields.io/badge/Sandbox-Docker%20TeX%20Live-0db7ed.svg)](https://www.docker.com)
[![AI Engine](https://img.shields.io/badge/AI-OpenAI%20GPT--4o-412991.svg)](https://openai.com)
[![Auth](https://img.shields.io/badge/Auth-Clerk-6C47FF.svg)](https://clerk.com)

---

## Technical Overview

Traditional resume builders often rely on rigid HTML/CSS templates or fragile web-to-PDF canvas exports that lack typography precision and fail ATS parse checks. 

This platform decouples user profile state from document rendering. Structured user attributes (experiences, technical projects, education, coding profiles, achievements, and skill taxonomies) are processed through an intelligent prompt-engineered pipeline powered by OpenAI GPT-4o. The AI engine synthesizes strict LaTeX markup, which is subsequently queued and compiled inside a hard-sandboxed Docker container running full TeX Live distributions.

### Architectural Core

- **Reactive Client Interface**: Next.js App Router frontend built with React 19 and Tailwind CSS v4, supporting real-time data persistence, authentication state management, and asynchronous job status polling.
- **RESTful API Engine**: Express 5 application built on TypeScript and Bun, providing strict schema-validated API interfaces and Clerk authentication middleware.
- **Event-Driven Workflow Queue**: Inngest event processor orchestrating multi-stage generation, concurrency control, step retries, and asynchronous job lifecycle tracking.
- **Hardened Execution Sandbox**: Docker-isolated compilation service operating under ephemeral container mounts, dropped Linux capabilities, network isolation, and strict CPU/RAM boundaries.
- **Relational Data Storage**: PostgreSQL database powered by Drizzle ORM storing relational user metadata, structured JSON resume profiles, raw TeX files, compiled PDF binary buffers, and generation job tracking.

---

## Core Capabilities

- **Structured Data Modeling**: Manage comprehensive professional profiles covering experiences, achievements, multi-tech projects, education, coding platform handles (LeetCode, GitHub, Codeforces), and dynamic skill sets.
- **AI LaTeX Synthesis**: GPT-4o system prompts transform unstructured or structured updates into clean, compilation-safe TeX markup adhering to professional typography standards.
- **Zero-Trust TeX Sandboxing**: TeX Live compilation runs in containers with network access disabled (`--network none`), prevent malicious command execution (`-no-shell-escape`), and enforce resource quotas.
- **Asynchronous Execution & Status Polling**: Non-blocking job queues allow users to initiate generation workflows without request timeouts, featuring real-time status transitions (`queued` → `generating` → `compiling` → `completed` / `failed`).
- **Resilient Compilation Pipelines**: Inngest functions manage retry policies, job failure capturing, and step isolation to prevent partial state corruption.
- **Identity & Session Security**: End-to-end user authentication backed by Clerk, securing both API route middleware and frontend UI views.

---

## Sandbox Security & Isolation Architecture

Compiling untrusted or AI-generated LaTeX source code introduces potential security vectors such as file system disclosure (`\input`, `\openin`), command execution (`\write18`), and system resource exhaustion attacks.

To address these vulnerabilities, the PDF compilation engine executes inside a strictly confined container environment with the following security constraints:

| Security Domain | Applied Constraint | Risk Mitigation |
| :--- | :--- | :--- |
| **Network Isolation** | `--network none` | Prevents outbound data exfiltration or remote payload retrieval. |
| **Privilege Restriction** | `--cap-drop ALL`, `--security-opt no-new-privileges` | Prevents container privilege escalation and system calls misuse. |
| **Resource Quotas** | `--memory 512m`, `--cpus 1`, `--pids-limit 128` | Prevents CPU starvation and fork-bomb Denial of Service (DoS). |
| **TeX Engine Hardening** | `-no-shell-escape`, `-halt-on-error` | Disables shell command invocation within `pdflatex`. |
| **Execution Timeout** | `25,000ms` hard timeout signal | Prevents infinite compilation loops or hanging processes. |
| **Volume Isolation** | Ephemeral `/tmp` workspace mounts | Compiles within isolated directories wiped immediately post-execution. |

---

## Event-Driven Generation Pipeline

```
[Client UI] ──( POST /data/generate )──> [Express API]
                                            │
                                    (Creates Job Record)
                                            │
                                            ▼
                                  [Inngest Event Bus]
                                            │
                   ┌────────────────────────┴────────────────────────┐
                   │  Event: app/texcode                             │
                   ▼                                                 ▼
        [Step 1: AI TeX Generation]                        [Job Status Update]
         • Fetch structured data                            • Status: "generating"
         • OpenAI GPT-4o Inference
         • Sanitize & format TeX
         • Save TeX file to PostgreSQL
                   │
                   ▼
        (Emits Event: resume/compile.requested)
                   │
                   ▼
        [Step 2: Sandboxed Compiler]                        [Job Status Update]
         • Status: "compiling"                              • Concurrency Limit: 6
         • Spin up Docker pdflatex
         • Render PDF Base64 artifact
         • Store PDF in PostgreSQL
         • Status: "completed"
```

---

## Technology Stack

- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS v4, TypeScript, `@clerk/nextjs`
- **Backend API**: Express 5, TypeScript, Bun, `@clerk/express`, Zod
- **Database & ORM**: PostgreSQL 14, Drizzle ORM, `drizzle-kit`
- **Orchestration & Background Jobs**: Inngest SDK (`inngest`)
- **Containerization**: Docker Engine, Docker Compose, `texlive/texlive:latest`
- **AI & Compiler**: OpenAI API (`gpt-4o`), TeX Live (`pdflatex`)

---

## Prerequisites

Before starting local development or deployment, ensure the following software is installed and running:

- **Bun** (v1.1+) or **Node.js** (v20+)
- **Docker Desktop** or **Docker Engine** (must be active to run LaTeX compilation containers and PostgreSQL)
- **Inngest CLI** (for local event stream dev server)
- **OpenAI Account Key** (access to `gpt-4o`)
- **Clerk Account** (Publishable and Secret keys)

---

## Environment Variables

### Backend Configuration (`.env`)

```env
# Server Setup
PORT=5000
FRONTEND_URL=http://localhost:3000

# PostgreSQL Database Connection
DATABASE_URL=postgres://postgres:postgres@localhost:5555/resume_builder

# Clerk Authentication
CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# AI Services
OPENAI_API_KEY=sk-proj-...

# Inngest Background Processing
INNGEST_EVENT_KEY=your_inngest_event_key
INNGEST_SIGNING_KEY=your_inngest_signing_key
```

### Frontend Configuration (`.env.local`)

```env
# Clerk Authentication Keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Backend API Endpoint
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
```

---

## Quick Start & Local Setup

### 1. Database Provisioning

Start the local PostgreSQL service using Docker Compose:

```bash
docker-compose up -d
```

Push the database schema using Drizzle Kit from the backend directory:

```bash
# Navigate to backend and run migrations
bun run drizzle-kit push
```

### 2. Backend API Service

Install dependencies and start the Express development server:

```bash
# Install backend dependencies
bun install

# Start Express server in watch mode
bun run start
```

The Express API will serve endpoints at `http://localhost:5000`.

### 3. Inngest Event Dev Server

Start the Inngest local development server to monitor and execute background event triggers:

```bash
npx inngest-cli@latest dev -u http://localhost:5000/api/inngest
```

Access the Inngest Dashboard at `http://127.0.0.1:8288` to monitor background functions.

### 4. Frontend Web Interface

Install dependencies and launch the Next.js development server:

```bash
# Install frontend dependencies
bun install

# Run development web server
bun run dev
```

Open `http://localhost:3000` in your browser.

---

## API Endpoint Reference

### Authentication

- `POST /auth/register`
  Registers or synchronizes an authenticated Clerk user into the local database schema.
  - **Auth**: Required (`Bearer Token` / Clerk Session)
  - **Body**: `{ "email": "user@example.com", "name": "John Doe" }`

### Resume Profile Management

- `GET /data/resumes`
  Fetches all resume records owned by the authenticated user.

- `POST /data/resumes`
  Creates a new structured resume record.
  - **Body**: Structured JSON object containing experiences, education, skills, projects, certifications, coding profiles, and achievements.

- `PATCH /data/resumes/:id`
  Updates an existing resume profile by ID.

### LaTeX & PDF Generation Pipeline

- `POST /data/generate`
  Initiates the asynchronous AI generation and PDF compilation process.
  - **Body**: `{ "resumeId": "UUID", "message": "Format summary and emphasize backend engineering projects" }`
  - **Response**: `{ "jobId": "UUID", "status": "queued" }`

- `GET /data/generation/:id`
  Polls the state of an active generation job.
  - **Response**: `{ "id": "UUID", "status": "queued" | "generating" | "compiling" | "completed" | "failed", "errorMessage": null }`

- `GET /data/:id/pdf`
  Retrieves the compiled Base64 PDF string associated with a generated resume.

---

## Production Deployment & Operational Notes

- **Database Migrations**: Run `drizzle-kit push` or generate SQL migration files to apply schema updates safely in production environments.
- **Docker Mount Privileges**: In production Linux/Kubernetes environments, ensure the backend process user has permission to invoke Docker socket commands (`/var/run/docker.sock`) or delegate TeX compilation to a dedicated worker service.
- **Inngest Cloud Production**: Configure `INNGEST_EVENT_KEY` and `INNGEST_SIGNING_KEY` when connecting your deployed backend endpoint to the managed Inngest Cloud platform.
- **Concurrency & Scaling**: The `compile-resume-tex` worker function includes an explicit concurrency limit (default: 6 concurrent jobs) to prevent Docker host CPU saturations during peak generation traffic.

---

## License

This project is released under the **MIT License**.
