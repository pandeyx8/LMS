import { ApiError } from "../utils/apiError";
import { User } from "../models/user.model";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/apiResponse";
import { validationResult } from "express-validator";

//register user
const registerUser = asyncHandler(async (req: any, res: any) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const validationErrors = errors.array();
    throw new ApiError(
      400,
      String(validationErrors[0]?.msg ?? "Validation failed"),
      validationErrors
    );
  }

  const { username, fullname, email, password } = req.body;

  const normalizedFullname = fullname?.trim();
  const normalizedUsername = username?.trim()?.toLowerCase();
  const normalizedEmail = email?.trim()?.toLowerCase();

  if (
    [normalizedEmail, normalizedFullname, password, normalizedUsername].some((field) => !field)
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const existedUser = await User.findOne({
    $or: [{ username: normalizedUsername }, { email: normalizedEmail }]
  });

  if (existedUser) {
    throw new ApiError(409, "User with this email or username already exists");
  }

  const createdUser = await User.create({
    username: normalizedUsername,
    fullname: normalizedFullname,
    email: normalizedEmail,
    password
  });

  const user = await User.findById(createdUser._id).select("-password");

  return res
    .status(201)
    .json(new ApiResponse(201, user, "User registered successfully"));
});

//login user
const loginUser = asyncHandler(async (req: any, res: any) => {
  const { username, email, password } = req.body;

  const normalizedUsername = username?.trim()?.toLowerCase();
  const normalizedEmail = email?.trim()?.toLowerCase();

  if ((!normalizedEmail && !normalizedUsername) || !password) {
    throw new ApiError(400, "Email or username and password are required");
  }

  const user: any = await User.findOne({
  $or: [{ username: normalizedUsername }, { email: normalizedEmail }]
}).select("+password");

  if (!user) {
    throw new ApiError(401, "Invalid credentials");
  }

  const isPasswordCorrect = await user.isPasswordCorrect(password);

  if (!isPasswordCorrect) {
    throw new ApiError(401, "Invalid credentials");
  }

  const accessToken = user.generateAccessToken();
  const loggedInUser = await User.findById(user._id).select("-password");

  return res
    .cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    })
    .status(200)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken
        },
        "User logged in successfully"
      )
    );
});

//logout user
const logoutUser = asyncHandler(async (req : any, res : any) => {
  return res.clearCookie("accessToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  }).status(200).json(new ApiResponse(200, null, "User logged out successfully"));
});

export {
  registerUser,
  loginUser,
  logoutUser
};