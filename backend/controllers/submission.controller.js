import * as submissionService from '../services/submission.service.js';
import * as contestRepo from '../repositories/contest.repository.js';

const stripAiAnalysisIfContestLive = async (submission) => {
    if (!submission?.ai_analysis) return submission;
    const isLive = await contestRepo.hasLiveContest();
    if (!isLive) return submission;
    const { ai_analysis, ...rest } = submission;
    return rest;
};

export const submitCode = async (req, res) => {
    try {
        const { problemId, code, lang } = req.body;
        const userId = req.user.id;

        if (!problemId || !code || lang === undefined) {
            return res.status(400).json({ error: "problemId, code, and lang are required" });
        }

        const submission = await submissionService.createSubmissionService({
            userId, problemId, code, lang
        });

        res.status(201).json({ message: "Submission received", submission });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "An internal server error occurred" });
    }
};

export const getSubmissionById = async (req, res) => {
    try {
        const { submissionsId } = req.params;
        const submission = await submissionService.getSubmissionByIdService(submissionsId);

        if (!submission) {
            return res.status(404).json({ error: "Submission not found" });
        }

        // Optional: Check if the user is the owner or an admin
        if (submission.user_id !== req.user.id && req.user.role !== 'ADMIN') {
             return res.status(403).json({ error: "Forbidden: Not your submission" });
        }

        const sanitizedSubmission = await stripAiAnalysisIfContestLive(submission);
        res.status(200).json({ submission: sanitizedSubmission });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "An internal server error occurred" });
    }
};

export const getMySubmissions = async (req, res) => {
    try {
        const userId = req.user.id;
        const submissions = await submissionService.getMySubmissionsService(userId);
        res.status(200).json({ submissions });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "An internal server error occurred" });
    }
};

export const getUserSubmissionsForProblem = async (req, res) => {
    try {
        const { problemId, userId } = req.params;

        // Ensure users can only see their own submissions unless they are admin
        if (userId !== req.user.id && req.user.role !== 'ADMIN') {
            return res.status(403).json({ error: "Forbidden: Cannot view other user's submissions" });
        }

        const submissions = await submissionService.getUserSubmissionsForProblemService(userId, problemId);
        res.status(200).json({ submissions });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "An internal server error occurred" });
    }
};

export const getAiAnalysis = async (req, res) => {
    try {
        const { submissionsId } = req.params;
        const submission = await submissionService.getSubmissionByIdService(submissionsId);

        if (!submission) {
            return res.status(404).json({ error: "Submission not found" });
        }

        // Ensure users can only analyze their own submissions unless they are admin
        if (submission.user_id !== req.user.id && req.user.role !== 'ADMIN') {
            return res.status(403).json({ error: "Forbidden: Not your submission" });
        }

        const analysis = await submissionService.getAiAnalysisForSubmissionService(submissionsId);
        res.status(200).json({ analysis });
    } catch (error) {
        console.error(error);
        if (error.message.includes('unavailable while a contest is in progress')) {
            return res.status(403).json({ error: error.message });
        }
        const status = error.message.includes('still being judged') ? 400 : 500;
        res.status(status).json({ error: error.message || "An internal server error occurred" });
    }
};