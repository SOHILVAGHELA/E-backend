import express from "express";
import { isAdmin, requireSignIn } from "../middleware/authMiddleware.js";
import {
  registerController,
  logincontroller,
  testcontroller,
  forgetPasswordController,
  updateProfileController,
} from "../controllers/authController.js";

//routing object
const router = express.Router();
//routing
//Register || method post
router.post("/register", registerController);

//LOGIN || POST
router.post("/login", logincontroller);
// FORGOT PASSWORD ||POST
router.post("/forget-password", forgetPasswordController);
router.get("/test", requireSignIn, isAdmin, testcontroller);
// Protected  User route auth
router.get("/user-auth", requireSignIn, (req, res) => {
  res.status(200).send({ ok: true });
});
//ADMIN ROUTE AUTH
router.get("/admin-auth", requireSignIn, isAdmin, (req, res) => {
  res.status(200).send({ ok: true });
});
//UPDATE PROFILE
router.put("/profile", requireSignIn, updateProfileController);

export default router;
