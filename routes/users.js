import express from "express";
import { deleteUser, getUsers } from "../controllers/users.js";
import { adminMiddleware, requireSignin } from "../middlewares/index.js";

const router = express.Router();

router.get("/users", requireSignin, adminMiddleware, getUsers);
router.delete("/users", requireSignin, deleteUser);

export default router;
