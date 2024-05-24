import express from "express";
import {
  createTeam,
  deleteTeam,
  getTeams,
  removeUserFromTeam,
  updateTeam,
} from "../controllers/team.js";

const router = express.Router();

router.get("/teams", getTeams);
router.post("/teams", createTeam);
router.put("/teams/:id", updateTeam);
router.delete("/teams/:id", deleteTeam);
router.delete("/teams/:teamId/users/:userId", removeUserFromTeam);

export default router;
