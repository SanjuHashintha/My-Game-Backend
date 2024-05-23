import express from "express";
import { deleteUser, getUsers } from "../controllers/users.js";

const router = express.Router();

router.get("/users", getUsers);
router.delete("/users", deleteUser);

export default router;
