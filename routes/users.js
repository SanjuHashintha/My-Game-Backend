import express from "express";
import {
  deleteUser,
  getUsers,
  updateUser,
  upload,
} from "../controllers/users.js";
import { adminMiddleware, requireSignin } from "../middlewares/index.js";

const router = express.Router();

router.get("/users", requireSignin, adminMiddleware, getUsers);
router.delete("/users", requireSignin, deleteUser);
router.put(
  "/users/:id",
  upload.single("profilePic"),
  requireSignin,
  updateUser
);

export default router;
