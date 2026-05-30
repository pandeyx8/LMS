import mongoose, {Schema} from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    fullname: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    role: {
      type: String,
      enum: [
        "admin",
        "sales",
        "sanction",
        "disbursement",
        "collection",
        "borrower",
      ],
      default: "borrower",
    },
  },
  { timestamps: true }
);

//encrypting the password
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10)
});

//verifying the pass 
userSchema.methods.isPasswordCorrect = async function( password : string) {
  return await bcrypt.compare(password, this.password)
};

//generating access token 
userSchema.methods.generateAccessToken = function () {
  const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
  const accessTokenExpiry = process.env.ACCESS_TOKEN_EXPIRY as jwt.SignOptions["expiresIn"] | undefined;

  if (!accessTokenSecret) {
    throw new Error("ACCESS_TOKEN_SECRET is not defined");
  }

  if (!accessTokenExpiry) {
    throw new Error("ACCESS_TOKEN_EXPIRY is not defined");
  }

  return jwt.sign({
    _id: this._id,
    username: this.username,
    email: this.email,
    fullname: this.fullname,
    role: this.role,
  },
    accessTokenSecret,
    { expiresIn: accessTokenExpiry }
  )
}

export const User = mongoose.model("User", userSchema);