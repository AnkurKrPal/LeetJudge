import { jest } from '@jest/globals';

jest.unstable_mockModule('../services/sandbox.service.js', () => ({
    run: jest.fn()
}));

const { compareOutputs, generateVerdict, judgeSubmission } = await import('../services/judge.service.js');
const sandbox = await import('../services/sandbox.service.js');
import Verdict from '../models/verdict.js';

describe('Judge Service', () => {
    describe('compareOutputs', () => {
        it('should return true for identical outputs', () => {
            expect(compareOutputs('hello', 'hello')).toBe(true);
        });

        it('should handle trailing spaces and newlines correctly', () => {
            expect(compareOutputs('hello \nworld\n', 'hello\nworld')).toBe(true);
        });

        it('should return false for different outputs', () => {
            expect(compareOutputs('hello', 'world')).toBe(false);
        });
    });

    describe('generateVerdict', () => {
        it('should create a correct verdict object for WRONG_ANSWER', () => {
            const verdict = generateVerdict('WRONG_ANSWER', 2, 'expected', 'actual', 150);
            expect(verdict.verdict).toBe('WRONG_ANSWER');
            expect(verdict.errorTestCase).toBe(2);
            expect(verdict.verdictMessage).toBe('Failed on test case 2');
            expect(verdict.executionTimeMs).toBe(150);
        });

        it('should handle COMPILATION_ERROR message differently', () => {
            const verdict = generateVerdict('COMPILATION_ERROR', 1, null, 'Syntax Error at line 1', 0);
            expect(verdict.verdict).toBe('COMPILATION_ERROR');
            expect(verdict.verdictMessage).toBe('Syntax Error at line 1');
        });
    });

    describe('judgeSubmission', () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });

        it('should return ACCEPTED if all test cases pass', async () => {
            sandbox.run.mockResolvedValue({
                success: true,
                stdout: 'correct',
                executionTimeMs: 10
            });

            const testCases = [
                { input: 'in1', output: 'correct' },
                { input: 'in2', output: 'correct' }
            ];

            const result = await judgeSubmission('code', 93, testCases, 1000, 256000);
            expect(result.verdict).toBe(Verdict.ACCEPTED);
            expect(sandbox.run).toHaveBeenCalledTimes(2);
        });

        it('should return WRONG_ANSWER if a test case fails output matching', async () => {
            sandbox.run.mockResolvedValueOnce({
                success: true,
                stdout: 'wrong',
                executionTimeMs: 10
            });

            const testCases = [
                { input: 'in1', output: 'correct' }
            ];

            const result = await judgeSubmission('code', 93, testCases, 1000, 256000);
            expect(result.verdict).toBe(Verdict.WRONG_ANSWER);
            expect(result.errorTestCase).toBe(1);
        });
    });
});
