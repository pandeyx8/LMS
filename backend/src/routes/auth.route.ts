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


export default router;
