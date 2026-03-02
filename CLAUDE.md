# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start Vite dev server with HMR
npm run build      # TypeScript check + Vite production build (tsc -b && vite build)
npm run lint       # ESLint (flat config, eslint.config.js)
npm run preview    # Preview production build locally
```

There is no test framework configured.

## Architecture

**Stack**: React 19 + TypeScript 5.9 + Vite 7 + React Router v7 (DOM) + CSS Modules

**Domain**: Karnataka Municipal Data System (KMDS) — ULB financial management. All data is mock/seed data held in component state; there are no API calls.

### Auth & Roles

`src/context/AuthContext.tsx` provides three roles via localStorage-backed context:
- **DMA_ADMIN** (user: 123/123) — full CRUD access
- **ULB_ADMIN** (user: 456/456) — read-only on most master screens (no create/edit buttons)
- **AEE_CREATOR** (user: 0000/0000)

`LoginGuard` and `AuthGuard` in `App.tsx` handle route protection. `AppLayout` wraps all authenticated routes with Header + Sidebar + Outlet.

### Routing

All routes are defined in `src/App.tsx`. Key patterns:
- `/masters/charts-of-accounts/:tab` — tabbed page (`BankDetails.tsx`) with fund-code, source-subsource-financing, account-code tabs
- `/masters/<page>` — standalone master pages (function-code, vendors, services, etc.)
- `/bill-accounting/file-setup` and `/bill-accounting/file-setup/create` — bill accounting module
- Unbuilt routes use a `Placeholder` component

### Project Structure

- `src/components/common/` — reusable UI primitives (Badge, Breadcrumb, Button, Input, Modal, Pagination, RadioGroup, Select, Table, Tabs, Textarea, Toast). Each has its own folder with `Component.tsx`, `Component.module.css`, `index.ts`.
- `src/components/layout/` — AppLayout (Header + Sidebar + Outlet)
- `src/pages/masters/<Module>/` — each master module follows a consistent pattern:
  - `types.ts` — TypeScript interfaces
  - `data.ts` — mock seed data (when needed)
  - `<Module>.tsx` — page wrapper with Breadcrumb + header
  - `<Module>Tab.tsx` — main tab content with table + state management
  - `<Module>Modal.tsx` — create/edit modal form
  - `DeleteConfirmModal.tsx` — delete confirmation dialog
  - `*.module.css` — scoped styles
  - `index.ts` — barrel export
- `src/design-system/tokens.css` — CSS custom properties for colors, spacing, radius

### Conventions

- **CSS Modules only** — all styling uses `.module.css` files. Use design tokens from `tokens.css` (e.g. `var(--color-primary-500)`, `var(--space-4)`, `var(--radius-md)`).
- **Page layout pattern**: Breadcrumb → pageHeader (title + action buttons) → content (tabs or table)
- **Modal pattern**: `<Modal>` shell wraps a `<form>` with an id; footer has Cancel + Submit buttons referencing the form id.
- **Delete pattern**: `DeleteConfirmModal` component with a message prop.
- **Role gating**: check `useAuth().role` to conditionally hide create/edit/delete buttons for `ULB_ADMIN`.
- **Toast notifications**: use `useToast()` from `src/components/common/Toast` for success/error messages after save/delete.
- **Barrel exports**: every component folder has an `index.ts` re-export.
