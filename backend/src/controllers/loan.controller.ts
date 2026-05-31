import { validationResult } from "express-validator";
import { ApiError } from "../utils/apiError";
import { ApiResponse } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { Loan } from "../models/loan.model";
import { Payment } from "../models/payment.model";
import { User } from "../models/user.model";
import path from "path";
import fs from "fs";

const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
type EmploymentMode = "salaried" | "self-employed" | "unemployed";
const MIN_SALARY = 25000;
const MIN_LOAN_AMOUNT = 50000;
const MAX_LOAN_AMOUNT = 500000;
const MIN_TENURE_DAYS = 30;
const MAX_TENURE_DAYS = 365;
const INTEREST_RATE = 12;

const calculateAge = (dateOfBirth: Date) => {
  const today = new Date();
  let age = today.getFullYear() - dateOfBirth.getFullYear();
  const monthDifference = today.getMonth() - dateOfBirth.getMonth();

  if (
    monthDifference < 0 ||
    (monthDifference === 0 && today.getDate() < dateOfBirth.getDate())
  ) {
    age -= 1;
  }

  return age;
};

//loan creation by borrower
const createLoan = asyncHandler(async (req: any, res: any) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const validationErrors = errors.array();
    throw new ApiError(
      400,
      String(validationErrors[0]?.msg ?? "Validation failed"),
      validationErrors
    );
  }

  const userId = req.user?._id;
  if (!userId) {
    throw new ApiError(401, "Unauthorized");
  }

  const file = req.file;
  if (!file) {
    throw new ApiError(400, "Salary slip is required");
  }

  const fullName = String(req.body.fullName ?? req.body.fullname ?? "").trim();
  const pan = String(req.body.pan ?? "").trim().toUpperCase();
  const employmentMode = String(req.body.employmentMode ?? "")
    .trim()
    .toLowerCase();
  const purpose = String(req.body.purpose ?? "Personal Loan").trim() || "Personal Loan";

  const monthlySalary = Number(req.body.monthlySalary);
  const loanAmount = Number(req.body.loanAmount);
  const tenureDays = Number(req.body.tenureDays);
  const dateOfBirth = new Date(req.body.dateOfBirth);

  if (!fullName || !pan || !employmentMode || Number.isNaN(dateOfBirth.getTime())) {
    throw new ApiError(400, "Full name, PAN, date of birth, and employment mode are required");
  }

  if (!PAN_REGEX.test(pan)) {
    throw new ApiError(400, "PAN format is invalid");
  }

  const age = calculateAge(dateOfBirth);
  if (age < 23 || age > 50) {
    throw new ApiError(400, "Applicant age must be between 23 and 50");
  }

  if (employmentMode === "unemployed") {
    throw new ApiError(400, "Unemployed applicants are not eligible");
  }

  if (!Number.isFinite(monthlySalary) || monthlySalary < MIN_SALARY) {
    throw new ApiError(400, "Monthly salary must be at least 25000");
  }

  if (!Number.isFinite(loanAmount) || loanAmount < MIN_LOAN_AMOUNT || loanAmount > MAX_LOAN_AMOUNT) {
    throw new ApiError(400, "Loan amount must be between 50000 and 500000");
  }

  if (!Number.isFinite(tenureDays) || tenureDays < MIN_TENURE_DAYS || tenureDays > MAX_TENURE_DAYS) {
    throw new ApiError(400, "Tenure must be between 30 and 365 days");
  }

  if (!["salaried", "self-employed", "unemployed"].includes(employmentMode)) {
    throw new ApiError(400, "Employment mode is invalid");
  }

  const normalizedEmploymentMode = employmentMode as EmploymentMode;

  const existingActiveLoan = await Loan.findOne({
    borrower: userId,
    status: { $in: ["applied", "approved", "disbursed"] },
  });

  if (existingActiveLoan) {
    throw new ApiError(400, "An active loan already exists for this borrower");
  }

  const simpleInterest = Number(
    ((loanAmount * INTEREST_RATE * tenureDays) / (365 * 100)).toFixed(2)
  );
  const totalRepayment = Number((loanAmount + simpleInterest).toFixed(2));

  const loan = await Loan.create({
    borrower: userId,
    createdBy: userId,
    loanAmount,
    tenureDays,
    interestRate: INTEREST_RATE,
    simpleInterest,
    totalRepayment,
    outstandingAmount: totalRepayment,
    purpose,
    personalDetails: {
      fullName,
      pan,
      dateOfBirth,
      monthlySalary,
      employmentMode: normalizedEmploymentMode,
      ageAtApplication: age,
    },
    salarySlip: {
      originalName: file.originalname,
      fileName: file.filename,
      filePath: file.path,
      mimeType: file.mimetype,
      size: file.size,
    },
    status: "applied",
    collectionStatus: "pending",
  });

  return res.status(201).json(
    new ApiResponse(
      201,
      {
        loan,
        bre: {
          approved: true,
          age,
          pan,
          employmentMode: normalizedEmploymentMode,
        },
      },
      "Loan application submitted successfully"
    )
  );
});

//loan approval by sanction role and admin
const approveLoan = asyncHandler(async (req: any, res: any) => {
  const loanId = req.params.id;
  const userId = req.user?._id;
  if (!userId) throw new ApiError(401, "Unauthorized");

  const loan = await Loan.findById(loanId);
  if (!loan) throw new ApiError(404, "Loan not found");

  if (loan.status !== "applied") {
    throw new ApiError(400, "Only applied loans can be approved");
  }

  loan.status = "approved";
  loan.sanctionedBy = userId;
  loan.sanctionedAt = new Date();
  loan.rejectionReason = "";
  if (req.body.sanctionRemark) loan.sanctionRemark = String(req.body.sanctionRemark);

  await loan.save();

  return res.status(200).json(new ApiResponse(200, loan, "Loan approved successfully"));
});

//loan rejection by sanction role and admin
const rejectLoan = asyncHandler(async (req: any, res: any) => {
  const loanId = req.params.id;
  const userId = req.user?._id;
  if (!userId) throw new ApiError(401, "Unauthorized");

  const { rejectionReason } = req.body;
  if (!rejectionReason) throw new ApiError(400, "Rejection reason is required");

  const loan = await Loan.findById(loanId);
  if (!loan) throw new ApiError(404, "Loan not found");

  if (loan.status !== "applied") {
    throw new ApiError(400, "Only applied loans can be rejected");
  }

  loan.status = "rejected";
  loan.rejectionReason = String(rejectionReason);
  loan.sanctionedBy = userId;
  loan.sanctionedAt = new Date();

  await loan.save();

  return res.status(200).json(new ApiResponse(200, loan, "Loan rejected"));
});

export { createLoan, approveLoan, rejectLoan };

//get salary slip by loan id only accessible by borrower (for their own loans) and admin/executives (for any loan)
const getSalarySlip = asyncHandler(async (req: any, res: any) => {
  const loanId = req.params.id;
  const user = req.user;

  if (!user) throw new ApiError(401, "Unauthorized");

  const loan = await Loan.findById(loanId);
  if (!loan) throw new ApiError(404, "Loan not found");

  // borrower can access only their own salary slip
  if (user.role === "borrower" && String(loan.borrower) !== String(user._id)) {
    throw new ApiError(403, "Forbidden");
  }

  const slip = loan.salarySlip;
  const filePath = slip?.filePath;
  if (!filePath || !fs.existsSync(filePath)) {
    throw new ApiError(404, "Salary slip file not found");
  }

  // Send file securely
  return res.sendFile(path.resolve(filePath));
});

export { getSalarySlip };

//disburse loan by disbursement role and admin
const disburseLoan = asyncHandler(async (req: any, res: any) => {
  const loanId = req.params.id;
  const userId = req.user?._id;
  if (!userId) throw new ApiError(401, "Unauthorized");

  const loan = await Loan.findById(loanId);
  if (!loan) throw new ApiError(404, "Loan not found");

  if (loan.status !== "approved") {
    throw new ApiError(400, "Only approved loans can be disbursed");
  }

  loan.status = "disbursed";
  loan.disbursedBy = userId;
  loan.disbursedAt = new Date();
  loan.collectionStatus = "ongoing";

  await loan.save();

  return res.status(200).json(new ApiResponse(200, loan, "Loan disbursed successfully"));
});

export { disburseLoan };


const getBorrowerLoans = asyncHandler(async (req: any, res: any) => {
  const user = req.user;
  if (!user) throw new ApiError(401, "Unauthorized");

  // Only borrowers can list their loans via this endpoint
  if (user.role !== "borrower") throw new ApiError(403, "Forbidden");

  const loans = await Loan.find({ borrower: user._id }).sort({ createdAt: -1 });

  const result = loans.map((l) => ({
    id: l._id,
    borrower: l.borrower,
    createdBy: l.createdBy,
    loanAmount: l.loanAmount,
    tenureDays: l.tenureDays,
    interestRate: l.interestRate,
    simpleInterest: l.simpleInterest,
    totalRepayment: l.totalRepayment,
    totalPaidAmount: l.totalPaidAmount,
    status: l.status,
    createdAt: l.createdAt,
    updatedAt: l.updatedAt,
    outstandingAmount: l.outstandingAmount,
    purpose: l.purpose,
    personalDetails: l.personalDetails,
    salarySlip: l.salarySlip
      ? {
        originalName: l.salarySlip.originalName,
        size: l.salarySlip.size,
        mimeType: l.salarySlip.mimeType,
        downloadUrl: `/api/v1/loans/${l._id}/salary-slip`,
      }
      : null,
  }));

  return res.status(200).json(new ApiResponse(200, result, "Borrower loans"));
});

export { getBorrowerLoans };

const getBorrowerLoansByUsername = asyncHandler(async (req: any, res: any) => {
  const user = req.user;
  if (!user) throw new ApiError(401, "Unauthorized");

  const requestedUsername = String(req.params.username ?? "").trim().toLowerCase();
  if (!requestedUsername) {
    throw new ApiError(400, "Username is required");
  }

  if (user.role !== "admin" && String(user.username).toLowerCase() !== requestedUsername) {
    throw new ApiError(403, "Forbidden");
  }

  const borrower = await User.findOne({ username: requestedUsername });
  if (!borrower) {
    throw new ApiError(404, "Borrower not found");
  }

  const loans = await Loan.find({ borrower: borrower._id }).sort({ createdAt: -1 });

  const result = loans.map((l) => ({
    id: l._id,
    borrower: l.borrower,
    createdBy: l.createdBy,
    loanAmount: l.loanAmount,
    tenureDays: l.tenureDays,
    interestRate: l.interestRate,
    simpleInterest: l.simpleInterest,
    totalRepayment: l.totalRepayment,
    totalPaidAmount: l.totalPaidAmount,
    status: l.status,
    createdAt: l.createdAt,
    updatedAt: l.updatedAt,
    outstandingAmount: l.outstandingAmount,
    purpose: l.purpose,
    personalDetails: l.personalDetails,
    salarySlip: l.salarySlip
      ? {
        originalName: l.salarySlip.originalName,
        size: l.salarySlip.size,
        mimeType: l.salarySlip.mimeType,
        downloadUrl: `/api/v1/loans/${l._id}/salary-slip`,
      }
      : null,
  }));

  return res.status(200).json(new ApiResponse(200, result, "Borrower loans"));
});

export { getBorrowerLoansByUsername };

const addPayment = asyncHandler(async (req: any, res: any) => {
  const loanId = req.params.id;
  const user = req.user;
  if (!user) throw new ApiError(401, "Unauthorized");

  const { amount, utr, paidAt } = req.body;
  const numericAmount = Number(amount);
  if (!utr || typeof utr !== "string" || !utr.trim()) {
    throw new ApiError(400, "UTR is required");
  }
  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    throw new ApiError(400, "Amount must be a positive number");
  }

  const paidAtDate = paidAt ? new Date(paidAt) : new Date();
  if (paidAt && Number.isNaN(paidAtDate.getTime())) {
    throw new ApiError(400, "paidAt must be a valid date");
  }

  const existingPayment = await Payment.findOne({ utr: utr.trim() });
  if (existingPayment) {
    throw new ApiError(409, "UTR already exists");
  }

  const loan = await Loan.findById(loanId);
  if (!loan) throw new ApiError(404, "Loan not found");

  if (loan.status !== "disbursed") {
    throw new ApiError(400, "Payments can only be recorded for disbursed loans");
  }

  if (numericAmount > loan.outstandingAmount) {
    throw new ApiError(400, "Payment amount cannot exceed outstanding amount");
  }

  // Create payment UTR must be unique (index enforces this)
  const payment = await Payment.create({
    loan: loan._id,
    borrower: loan.borrower,
    amount: numericAmount,
    utr: utr.trim(),
    paidAt: paidAtDate,
    recordedBy: user._id,
  });

  loan.totalPaidAmount = Number((loan.totalPaidAmount + numericAmount).toFixed(2));
  loan.outstandingAmount = Number((loan.outstandingAmount - numericAmount).toFixed(2));

  if (loan.outstandingAmount <= 0) {
    loan.outstandingAmount = 0;
    loan.status = "closed";
    loan.collectionStatus = "completed";
  }

  await loan.save();

  return res.status(201).json(new ApiResponse(201, { payment, loan }, "Payment recorded"));
});

export { addPayment };

const getLoanPayments = asyncHandler(async (req: any, res: any) => {
  const loanId = req.params.id;
  const user = req.user;

  if (!user) throw new ApiError(401, "Unauthorized");

  const loan = await Loan.findById(loanId).populate("borrower", "username fullname email");
  if (!loan) throw new ApiError(404, "Loan not found");

  const payments = await Payment.find({ loan: loan._id })
    .populate("borrower", "username fullname email")
    .populate("recordedBy", "username fullname email")
    .sort({ paidAt: -1, createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        loan,
        payments,
      },
      "Loan payments"
    )
  );
});

const getSalesLeads = asyncHandler(async (_req: any, res: any) => {
  const appliedBorrowerIds = await Loan.distinct("borrower");

  const leads = await User.find({
    role: "borrower",
    _id: { $nin: appliedBorrowerIds },
  })
    .select("username fullname email createdAt")
    .sort({ createdAt: -1 });

  return res.status(200).json(new ApiResponse(200, leads, "Sales leads"));
});

const getSanctionQueue = asyncHandler(async (_req: any, res: any) => {
  const loans = await Loan.find({ status: "applied" })
    .populate("borrower", "username fullname email")
    .sort({ createdAt: -1 });

  return res.status(200).json(new ApiResponse(200, loans, "Sanction queue"));
});

const getDisbursementQueue = asyncHandler(async (_req: any, res: any) => {
  const loans = await Loan.find({ status: "approved" })
    .populate("borrower", "username fullname email")
    .sort({ sanctionedAt: -1, createdAt: -1 });

  return res.status(200).json(new ApiResponse(200, loans, "Disbursement queue"));
});

const getCollectionQueue = asyncHandler(async (_req: any, res: any) => {
  const loans = await Loan.find({
    status: "disbursed",
    outstandingAmount: { $gt: 0 },
  })
    .populate("borrower", "username fullname email")
    .sort({ disbursedAt: -1, createdAt: -1 });

  return res.status(200).json(new ApiResponse(200, loans, "Collection queue"));
});

const getAdminOverview = asyncHandler(async (_req: any, res: any) => {
  const [statusCounts, totalUsers, totalBorrowers, totalLoans, recentApplications] = await Promise.all([
    Loan.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    User.countDocuments({}),
    User.countDocuments({ role: "borrower" }),
    Loan.countDocuments({}),
    Loan.find({})
      .populate("borrower", "username fullname email")
      .sort({ createdAt: -1 })
      .limit(5),
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        totalUsers,
        totalBorrowers,
        totalLoans,
        statusCounts,
        recentApplications,
      },
      "Admin overview"
    )
  );
});

export {
  getSalesLeads,
  getSanctionQueue,
  getDisbursementQueue,
  getCollectionQueue,
  getAdminOverview,
  getLoanPayments,
};