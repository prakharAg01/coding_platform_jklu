import express from "express";
import { getProblems, getProblemById, createProblem, updateProblem, deleteProblem } from "../controllers/problemController.js";
import { isAuthenticated, authorizeRoles } from "../middlewares/auth.js";

const router = express.Router();

router.get("/", getProblems);
router.post("/", isAuthenticated, authorizeRoles("Teacher", "Sadmin", "TA"), createProblem);
router.get("/:id", getProblemById);
router.put("/:id", isAuthenticated, authorizeRoles("Teacher", "Sadmin"), updateProblem);
router.delete("/:id", isAuthenticated, authorizeRoles("Sadmin"), deleteProblem);

export default router;
