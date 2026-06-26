export class BaseAnalyzerStrategy {
    /**
     * Analyzes the code submission.
     * @param {string} code - The submitted code.
     * @param {object} problem - The problem details (title, description).
     * @param {string} verdict - The verdict of the submission (e.g. ACCEPTED, WRONG_ANSWER).
     * @returns {Promise<object>} Returns an object containing timeComplexity, spaceComplexity, and review.
     */
    async analyze(code, problem, verdict) {
        throw new Error("Method 'analyze()' must be implemented.");
    }
}
