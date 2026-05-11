# Project Context: Vidita Cafe Monorepo

> [!IMPORTANT]
> **PRIMARY FOCUS: Web PWA.** The Next.js Web application is the sole frontend platform. All features, UI refinements, and business logic are implemented and validated here.

## Foundation
Vidita Cafe is an ecosystem for coffee discovery and journaling...

- **Web**: Next.js / TypeScript static application (Served via Backend).
- **Backend**: High-performance C++ server (Drogon + Glaze + PostgreSQL).

## Critical Documents
When starting any task, ALWAYS read these files first to ensure consistency:
1.  **GOALS.md**: High-level vision and objectives.
2.  **SPECIFICATION.md**: The single source of truth for features, business logic, and data models.
3.  **business/BREWING_PLAN.md**: Roadmap for brewing features.
4.  **backend/API.md**: High-performance RESTful API specification.
5.  **business/MODEL.md**: The business model, revenue streams, and growth strategy.
6.  **business/DECISIONS.md**: Log of key architectural and business decisions.

## AI Directives
- **Web-First**: Ensure all UI behaviors (like the scroll hint bounce) and business logic match the `SPECIFICATION.md`.
- **Modern Standards**:
  - **Web**: Next.js with Tailwind CSS.
  - **Backend**: Modern C++ (C++20/23) with Drogon and Glaze.
- **Localization**: All languages (en, es-419, pt-BR, ru, ka, it) must be supported in all UI changes.
- **Environment**: Use the provided `flake.nix` in each subdirectory for a reproducible development environment.
- **Performance**: Prioritize speed and efficiency, especially in the C++ backend.

## Manual Access & Database
- **Direct Access**: You can SSH into `root@vidita1`.
- **Database Operations**: From the SSH session, you can query and modify the PostgreSQL database directly using `psql -d viditacafe`.

## CI/CD & Monitoring (GitHub CLI)
To prevent slow interactive prompts, always target the latest run ID using a subshell. These commands are **strictly non-interactive**:

- **Monitor Status**: `gh run list --limit 1`
- **Watch Progress**: `gh run watch $(gh run list --limit 1 --json databaseId --jq '.[0].databaseId') --exit-status`
- **Deep Debugging**: `gh run view $(gh run list --limit 1 --json databaseId --jq '.[0].databaseId') --log-failed`
- **Specific Job Logs**: `gh run view $(gh run list --limit 1 --json databaseId --jq '.[0].databaseId') --log --job [JOB_ID]`

*Tip: Using `$(gh run list ...)` ensures you never have to manually select a run from a list.*
