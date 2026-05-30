import { ApiError } from "../utils/apiError";

export const authorizeRoles = (...allowedRoles : string[]) => {
  return (req : any, res : any, next : any) => {

    if (!req.user) {
      throw new ApiError(401, "Unauthorized");
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new ApiError(403, "you are not allowed to access this resource");
    }

    next();
  };
};
