import mongoose from "mongoose";

const personalDetailsSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    pan: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    dateOfBirth: {
      type: Date,
      required: true,
    },
    monthlySalary: {
      type: Number,
      required: true,
      min: 0,
    },
    employmentMode: {
      type: String,
      required: true,
      enum: ["salaried", "self-employed", "unemployed"],
    },
    ageAtApplication: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const salarySlipSchema = new mongoose.Schema(
  {
    originalName: {
      type: String,
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    filePath: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
      max: 5 * 1024 * 1024,
    },
  },
  { _id: false }
);

const loanSchema = new mongoose.Schema(
  {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    borrower: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    loanAmount: {
      type: Number,
      required: true,
      min: 50000,
      max: 500000,
    },

    tenureDays: {
      type: Number,
      required: true,
      min: 30,
      max: 365,
    },

    interestRate: {
      type: Number,
      default: 12,
    },

    simpleInterest: {
      type: Number,
      required: true,
    },

    totalRepayment: {
      type: Number,
      required: true,
    },

    totalPaidAmount: {
      type: Number,
      default: 0,
    },

    outstandingAmount: {
      type: Number,
      required: true,
    },

    purpose: {
      type: String,
      required: true,
      trim: true,
      default: "Personal Loan",
    },

    personalDetails: {
      type: personalDetailsSchema,
      required: true,
    },

    salarySlip: {
      type: salarySlipSchema,
      required: true,
    },

    status: {
      type: String,
      enum: [
        "applied",
        "approved",
        "rejected",
        "disbursed",
        "closed",
      ],
      default: "applied",
    },

    collectionStatus: {
      type: String,
      enum: ["pending", "ongoing", "completed", "defaulted"],
      default: "pending",
    },

    rejectionReason: {
      type: String,
      default: "",
    },

    sanctionRemark: {
      type: String,
      default: "",
    },

    sanctionedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    sanctionedAt: {
      type: Date,
    },

    disbursedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    disbursedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export const Loan = mongoose.model("Loan", loanSchema);