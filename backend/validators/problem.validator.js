import Difficulty from '../models/difficulty.js';
import { getAllTags } from '../models/tag.js';

const validateTags = (tags) => {
    if (tags === undefined || tags === null) {
        return null;
    }

    if (!Array.isArray(tags)) {
        return 'Tags must be an array';
    }

    const validTags = getAllTags();
    for (const tag of tags) {
        if (!validTags.includes(tag)) {
            return `Invalid tag: ${tag}. Must be one of: ${validTags.join(', ')}`;
        }
    }

    return null;
};

export const validateCreateProblem = (req, res, next) => {
    const { title, description, difficulty, timelimit, memorylimit, tags } = req.body;

    if (!title || !description || !difficulty || !timelimit || !memorylimit) {
        return res.status(400).json({
            error: 'Required fields: title, description, difficulty, timelimit, memorylimit'
        });
    }

    // Check that difficulty is one of the allowed enum values
    const validDifficulties = Object.values(Difficulty);
    if (!validDifficulties.includes(difficulty)) {
        return res.status(400).json({
            error: `Invalid difficulty. Must be one of: ${validDifficulties.join(', ')}`
        });
    }

    if (typeof timelimit !== 'number' || timelimit <= 0) {
        return res.status(400).json({ error: 'timelimit must be a positive number (ms)' });
    }

    if (typeof memorylimit !== 'number' || memorylimit <= 0) {
        return res.status(400).json({ error: 'memorylimit must be a positive number (KB)' });
    }

    const tagError = validateTags(tags);
    if (tagError) {
        return res.status(400).json({ error: tagError });
    }

    next();
};

export const validateTestCases = (req, res, next) => {
    const { testCases } = req.body;

    if (!Array.isArray(testCases) || testCases.length === 0) {
        return res.status(400).json({
            error: 'testCases must be a non-empty array'
        });
    }

    // Validate each test case has input and output
    for (let i = 0; i < testCases.length; i++) {
        const tc = testCases[i];
        if (tc.input === undefined || tc.output === undefined) {
            return res.status(400).json({
                error: `Test case at index ${i} must have both input and output`
            });
        }
    }

    next();
};