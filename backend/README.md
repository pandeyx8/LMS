# LMS Backend

This backend uses Express + TypeScript + MongoDB.

Quick start

```bash
cd D:/projects/LMS/backend
npm install
# seed default users
npm run seed
# start dev server
npm run dev
```

Uploads

- Salary slips are stored locally (development): `public/uploads/salary-slips`.
- Accepted types: PDF, JPG, PNG. Max size: 5MB.
- Files are saved by Multer and metadata is stored on the `Loan` document (`salarySlip.filePath`, `fileName`, etc.).
- Files are served through a protected endpoint: `GET /api/v1/loans/:id/salary-slip` (requires authentication and RBAC).

RBAC and Module APIs (Assignment Scope)

- Roles: `admin`, `sales`, `sanction`, `disbursement`, `collection`, `borrower`
- Auth errors:
  - `401` for unauthenticated requests (missing/invalid JWT)
  - `403` for authenticated but unauthorized role

Borrower portal

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/logout`
- `POST /api/v1/loans/apply` (borrower only)
- `GET /api/v1/loans/my` (borrower only)

Dashboard module APIs

- Sales module (`sales`, `admin`):
  - `GET /api/v1/loans/sales/leads`
- Sanction module (`sanction`, `admin`):
  - `GET /api/v1/loans/sanction/queue`
  - `POST /api/v1/loans/:id/approve`
  - `POST /api/v1/loans/:id/reject`
- Disbursement module (`disbursement`, `admin`):
  - `GET /api/v1/loans/disbursement/queue`
  - `POST /api/v1/loans/:id/disburse`
- Collection module (`collection`, `admin`):
  - `GET /api/v1/loans/collection/queue`
  - `POST /api/v1/loans/:id/payments`
    - body: `amount`, `utr`, optional `paidAt`
    - `utr` must be unique
    - payment allowed only for `disbursed` loans
    - loan auto-closes when outstanding reaches zero
- Admin overview (`admin` only):
  - `GET /api/v1/loans/admin/overview`

Salary slip access

- `GET /api/v1/loans/:id/salary-slip`
  - borrower: only own loan file
  - admin/executive roles: accessible for assigned operations

Seed

- Run `npm run seed` to create default users:
  - admin: admin@lms.com / Admin@123
  - sales: sales@lms.com / Sales@123
  - sanction: sanction@lms.com / Sanction@123
  - disbursement: disbursement@lms.com / Disbursement@123
  - collection: collection@lms.com / Collection@123
  - borrower: borrower@lms.com / Borrower@123

Environment

- Copy `.env.example` to `.env` and fill your values.

Cleanup

- A cleanup script is provided to remove old uploads:

```bash
# remove files older than 90 days (default)
npm run cleanup
# to change retention days, set env var
UPLOAD_RETENTION_DAYS=30 npm run cleanup
```

Notes

- Local storage is suitable for evaluation when the server runs as a single instance (local machine, VM, or container). For production or multi-instance deployments, migrate to an object store (S3/GCS/Azure Blob) and use signed URLs.

If you want, I can:
- Add S3 adapter and signed URL flow
- Add borrower endpoints for listing loans (already added `/api/v1/loans/my`)
- Implement CI/tests

*** End of README
