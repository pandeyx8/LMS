import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    loan: { type: mongoose.Schema.Types.ObjectId, ref: "Loan", required: true },
    borrower: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true, min: 1 },
    utr: { type: String, required: true, unique: true, trim: true },
    paidAt: { type: Date, default: Date.now },
    recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export const Payment = mongoose.model("Payment", paymentSchema);
