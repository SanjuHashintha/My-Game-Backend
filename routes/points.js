import express from "express";
import {
  addPoints,
  deletePoints,
  getPoints,
  updatePoints,
} from "../controllers/points.js";

const router = express.Router();

router.post("/points", addPoints);
router.get("/points", getPoints);
router.put("/points", updatePoints);
router.delete("/points", deletePoints);

export default router;
