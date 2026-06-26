import express from 'express';
import { submitCode, getSubmissionById, getMySubmissions, getUserSubmissionsForProblem, getAiAnalysis } from '../controllers/submission.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validateSubmission } from '../validators/submission.validator.js';
import { strictLimiter } from '../middleware/rateLimit.middleware.js';

const router = express.Router();

// All submission routes require authentication
router.use(authenticate);

router.post("/", strictLimiter, validateSubmission, submitCode);
router.get("/mySubmissions", getMySubmissions);
router.get("/:submissionsId", getSubmissionById);
router.get("/:submissionsId/analyze", getAiAnalysis);
router.get("/problem/:problemId/user/:userId", getUserSubmissionsForProblem);

export default router;