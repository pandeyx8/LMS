Frontend logic overview

This document describes the implemented frontend logic for the LMS application (routes, components, client API, state, forms, and auth-related behavior). It omits general Next.js boilerplate and deployment notes.

Routes (app router)

- `/signup` — registration form that calls the auth service to create a borrower account.
- `/borrower/apply` — loan application form; sends a multipart `FormData` payload (including salary slip file) to the loan apply API.
- `/borrower/loans` — lists loans for the current borrower using `getMyLoans()` from the loan service.
- `/borrower/[username]/loans` — lists loans for a specific borrower (used by admin/ops views).
- `/ops/*` — operations dashboard pages for roles: `sales`, `sanction`, `disbursement`, `collection`, and `overview`. These pages display queues and actions driven by service calls (approve, reject, disburse, record payments).

Components (key UI building blocks)

- `AppShell`, `Navbar`, `Sidebar` — layout and navigation.
- Form controls: `Input`, `Textarea`, `Select`, `Button` — used across auth and loan forms.
- `Table`, `EmptyState`, `Spinner`, `Modal`, `Badge` — used for lists, loading states, and CRUD actions.

Client state & auth

- `src/store/useAuth.ts` — Zustand store that persists `user`, `accessToken`, and `role` to `localStorage` and exposes `setAuth()` and `logout()`.
- `src/hooks/useRequireAuth.ts` — client-side guard that redirects unauthenticated users and enforces role-based access (allows `admin` override).
- `src/lib/session.ts` — helper for setting/clearing a role cookie used by some UI flows.

API client and services

- `src/lib/axios.ts` — Axios instance used across services; reads `NEXT_PUBLIC_API_URL` and injects `Authorization: Bearer <token>` from the auth store via a request interceptor.
- `src/lib/api.ts` — `unwrapResponse()` helper that extracts the `data` payload from API responses.
- `src/services/auth.service.ts` — `login()`, `logout()`, `register()` wrappers around `/auth` endpoints.
- `src/services/loan.service.ts` — loan-related calls: `applyLoan(formData)`, `getMyLoans()`, queue fetchers (`getSanctionQueue()`, `getDisbursementQueue()`, `getCollectionQueue()`), `approveLoan()`, `rejectLoan()`, `disburseLoan()`, and admin overview.
- `src/services/payment.service.ts` — `recordPayment()` and `getLoanPayments()` for recording and listing payments.

Forms and uploads

- Loan application uses `FormData` and sets `Content-Type: multipart/form-data` when calling `applyLoan()`.
- Client-side validation includes accepted file types and size checks before upload (handled in the apply form component).

Role-based UI behavior

- Pages under `/ops/*` check the current user's role (via `useRequireAuth` and `useAuth` store) and render action buttons (approve/reject/disburse/record payment) only when the user's role permits.
- UI actions call the corresponding service methods; services map directly to backend endpoints and return typed responses used to update local UI state.

Environment

- `NEXT_PUBLIC_API_URL` — base URL used by the Axios client (`src/lib/axios.ts`).

Files to inspect for logic

- Routes/components: `src/app` and `app` folders.
- API & services: `src/lib/axios.ts`, `src/lib/api.ts`, `src/services/*`.
- State & hooks: `src/store/useAuth.ts`, `src/hooks/useRequireAuth.ts`, `src/lib/session.ts`.

This README intentionally focuses on implemented frontend logic only.
