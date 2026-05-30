import { Router } from "express";
import { body } from "express-validator";
import {
  createLoan,
  getBorrowerLoans,
  getSalesLeads,
  getSanctionQueue,
  getDisbursementQueue,
  getCollectionQueue,
  getAdminOverview,
} from "../controllers/loan.controller";
import { verifyJWT } from "../middleware/auth.middleware";
import { authorizeRoles } from "../middleware/authorizeRoles";
import { uploadSalarySlip } from "../middleware/upload.middleware";
import { approveLoan, rejectLoan } from "../controllers/loan.controller";
import { getSalarySlip, disburseLoan } from "../controllers/loan.controller";
import { addPayment } from "../controllers/loan.controller";

const router = Router();

router.post(
  "/apply",
  verifyJWT,
  authorizeRoles("borrower"),
  uploadSalarySlip.single("salarySlip"),
  [
    body("fullName").trim().notEmpty().withMessage("Full name is required"),
    body("pan").trim().notEmpty().withMessage("PAN is required"),
    body("dateOfBirth").isISO8601().withMessage("Date of birth is required"),
    body("monthlySalary").isFloat({ min: 25000 }).withMessage("Monthly salary must be at least 25000"),
    body("employmentMode")
      .trim()
      .notEmpty()
      .isIn(["salaried", "self-employed", "unemployed"])
      .withMessage("Employment mode must be salaried, self-employed, or unemployed"),
    body("loanAmount").isFloat({ min: 50000, max: 500000 }).withMessage("Loan amount must be between 50000 and 500000"),
    body("tenureDays").isInt({ min: 30, max: 365 }).withMessage("Tenure must be between 30 and 365 days"),
  ],
  createLoan
);

// borrower: list own loans
router.get("/my", verifyJWT, authorizeRoles("borrower"), getBorrowerLoans);

// dashboard module queues
router.get("/sales/leads", verifyJWT, authorizeRoles("sales", "admin"), getSalesLeads);
router.get("/sanction/queue", verifyJWT, authorizeRoles("sanction", "admin"), getSanctionQueue);
router.get(
  "/disbursement/queue",
  verifyJWT,
  authorizeRoles("disbursement", "admin"),
  getDisbursementQueue
);
router.get(
  "/collection/queue",
  verifyJWT,
  authorizeRoles("collection", "admin"),
  getCollectionQueue
);
router.get("/admin/overview", verifyJWT, authorizeRoles("admin"), getAdminOverview);

// sanction routes
router.post(
  "/:id/approve",
  verifyJWT,
  authorizeRoles("sanction", "admin"),
  approveLoan
);

router.post(
  "/:id/reject",
  verifyJWT,
  authorizeRoles("sanction", "admin"),
  [body("rejectionReason").trim().notEmpty().withMessage("Rejection reason is required")],
  rejectLoan
);

// download/view salary slip (borrower can access own, executives/admin can access any)
router.get(
  "/:id/salary-slip",
  verifyJWT,
  authorizeRoles("borrower", "admin", "sanction", "disbursement", "collection"),
  getSalarySlip
);

// disbursement action
router.post(
  "/:id/disburse",
  verifyJWT,
  authorizeRoles("disbursement", "admin"),
  disburseLoan
);

// record a payment (collection or borrower)
router.post(
  "/:id/payments",
  verifyJWT,
  authorizeRoles("collection", "admin"),
  [
    body("amount").isFloat({ gt: 0 }).withMessage("Amount must be a positive number"),
    body("utr").trim().notEmpty().withMessage("UTR is required"),
    body("paidAt").optional().isISO8601().withMessage("paidAt must be a valid date"),
  ],
  addPayment
);

export default router;