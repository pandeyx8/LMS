# LMS Backend

This repository contains the implemented backend for the LMS application. The backend is built with Express, TypeScript, and MongoDB and includes authentication, role-based access control, loan workflow endpoints, file upload handling, data seeding, and maintenance scripts.

Quick start

```bash
cd D:/projects/LMS/backend
npm install
# seed default users
npm run seed
# start dev server
npm run dev
```

Implemented features

- Tech stack: Express + TypeScript + MongoDB.
- Authentication: JWT-based auth with protected API routes and standard `401`/`403` responses for unauthenticated and unauthorized requests.
- RBAC: role definitions and enforcement for `admin`, `sales`, `sanction`, `disbursement`, `collection`, and `borrower` roles.

File uploads

- Salary slips storage: `public/uploads/salary-slips` (local storage).
- Accepted file types: PDF, JPG, PNG. Maximum file size: 5MB.
- Upload handling: files are saved via Multer; file metadata is persisted on the `Loan` document (fields include `salarySlip.filePath`, `fileName`, etc.).
- File access: salary slip files are served via a protected endpoint `GET /api/v1/loans/:id/salary-slip` with authentication and role checks.

APIs and endpoints

Borrower portal endpoints:

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/logout`
- `POST /api/v1/loans/apply` (restricted to `borrower` role)
- `GET /api/v1/loans/my` (restricted to `borrower` role)

Dashboard and workflow endpoints:

- Sales module (roles: `sales`, `admin`):
  - `GET /api/v1/loans/sales/leads`
- Sanction module (roles: `sanction`, `admin`):
  - `GET /api/v1/loans/sanction/queue`
  - `POST /api/v1/loans/:id/approve`
  - `POST /api/v1/loans/:id/reject`
- Disbursement module (roles: `disbursement`, `admin`):
  - `GET /api/v1/loans/disbursement/queue`
  - `POST /api/v1/loans/:id/disburse`
- Collection module (roles: `collection`, `admin`):
  - `GET /api/v1/loans/collection/queue`
  - `POST /api/v1/loans/:id/payments` — request body expects `amount`, `utr`, and optional `paidAt`.
    - `utr` is enforced as unique.
    - Payments are accepted only for loans in `disbursed` state.
    - Loans transition to closed when outstanding amount reaches zero.
- Admin overview (role: `admin`):
  - `GET /api/v1/loans/admin/overview`

Salary slip access rules

- Borrower role: access to salary slip only for the borrower's own loan.
- Admin and operational roles: access to salary slips as required by assigned operations and role permissions.

Data seeding

- `npm run seed` creates default users and roles with seeded credentials:
  - admin: admin@lms.com / Admin@123
  - sales: sales@lms.com / Sales@123
  - sanction: sanction@lms.com / Sanction@123
  - disbursement: disbursement@lms.com / Disbursement@123
  - collection: collection@lms.com / Collection@123
  - borrower: borrower@lms.com / Borrower@123

Environment

- Copy `.env.example` to `.env` and provide environment-specific values.

Maintenance

- `npm run cleanup` is available to remove old uploads. Default retention is 90 days; retention days are configurable via the `UPLOAD_RETENTION_DAYS` environment variable.

