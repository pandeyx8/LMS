import jwt, { JwtPayload } from "jsonwebtoken";
import { User } from "../models/user.model";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/apiError";

export const verifyJWT = asyncHandler(
  async (req: any, res: any, next: any) => {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Unauthorized");
    }

    const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;

    if (!accessTokenSecret) {
      throw new ApiError(500, "ACCESS_TOKEN_SECRET is not configured");
    }

    const decodedToken = jwt.verify(
      token,
      accessTokenSecret
    ) as JwtPayload & { _id?: string };

    const user = await User.findById(decodedToken?._id).select("-password");

    if (!user) {
      throw new ApiError(401, "Unauthorized");
    }

    req.user = user;
    next();
  }
);