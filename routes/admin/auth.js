import express from "express";
import { signin, signup } from "../../controllers/admin/auth.js";
import {
  isRequestValidated,
  validateSigninRequest,
  validateSignupRequest,
} from "../../validators/auth.js";

const router = express.Router();

router.post("/admin/signup", validateSignupRequest, isRequestValidated, signup);
router.post("/admin/signin", validateSigninRequest, isRequestValidated, signin);

export default router;
