import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
} from "../controllers/auth.controller";
import { verifyJWT } from "../middleware/auth.middleware";
import { body } from "express-validator";
import { authorizeRoles } from "../middleware/authorizeRoles";

const router = Router();

// public routes
router.post(
  "/register",
  [
    body("username").trim().notEmpty().withMessage("Username is required"),
    body("fullname").trim().notEmpty().withMessage("Fullname is required"),
    body("email").trim().isEmail().withMessage("Invalid email format"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  registerUser
);
router.post("/login", loginUser);
router.post("/logout", verifyJWT, logoutUser);

router.get(
  "/admin",
  verifyJWT,
  authorizeRoles("admin"),
  (req, res) => {
    res.json({ message: "Welcome Admin" });
  }
);

// //protected routes
// router.get("/", verifyJWT, checkRole("admin"), getallUsers);
// router.patch("/:userId/role", verifyJWT, checkRole("admin"), updateUserRole);
// router.patch("/:userId/status", verifyJWT, checkRole("admin"), updateUserStatus);
// router.patch(
//   "/password",
//   verifyJWT,
//   [
//     body("oldPassword").notEmpty().withMessage("Old password is required"),
//     body("newPassword").notEmpty().withMessage("New password is required"),
//   ],
//   changeCurrentPassword
// );
// router.patch(
//   "/account/update",
//   verifyJWT,
//   [
//     body("fullname").notEmpty().withMessage("Fullname is required"),
//     body("email").isEmail().withMessage("Invalid email format"),
//   ],
//   updateAccountDetails
// );


export default router;
