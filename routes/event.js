import express from "express";
import {
  createEvent,
  deleteEvent,
  getEvent,
  updateEvent,
} from "../controllers/event.js";

const router = express.Router();

router.post("/events", createEvent);
router.get("/events", getEvent);
router.put("/events/:id", updateEvent);
router.delete("/events/:id", deleteEvent);

export default router;
