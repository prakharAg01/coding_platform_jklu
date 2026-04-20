import express from "express";
import { getContests, getContestById, getContestBySlug, getActiveContest, getLeaderboard, createContest, updateContest, deleteContest, addProblemsToContest, registerForContest, getMyContests } from "../controllers/contestController.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.get("/", getContests);
router.post("/", isAuthenticated, createContest);
router.put("/:id", isAuthenticated, updateContest);
router.delete("/:id", isAuthenticated, deleteContest);
router.get("/my", isAuthenticated, getMyContests);
router.get("/active", getActiveContest);
router.get("/slug/:slug", getContestBySlug);
router.post("/:id/problems", isAuthenticated, addProblemsToContest);
router.put("/:id/register", isAuthenticated, registerForContest);
router.get("/:id/leaderboard", getLeaderboard);
router.get("/:id", getContestById);

export default router;
