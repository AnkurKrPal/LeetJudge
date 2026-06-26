import { jest } from '@jest/globals';

jest.unstable_mockModule('child_process', () => ({
    execSync: jest.fn(() => true),
    execFile: jest.fn()
}));

jest.unstable_mockModule('fs/promises', () => ({
    mkdir: jest.fn().mockResolvedValue(),
    writeFile: jest.fn().mockResolvedValue(),
    rm: jest.fn().mockResolvedValue()
}));

const { run } = await import('../services/sandbox.service.js');

describe('Sandbox Service', () => {
    let childProcess;

    beforeAll(async () => {
        childProcess = await import('child_process');
    });

    it('should successfully execute a valid javascript code', async () => {
        childProcess.execFile.mockImplementationOnce((cmd, args, opts, cb) => {
            cb(null, 'Hello World', '');
            return { stdin: { write: jest.fn(), on: jest.fn(), end: jest.fn() } };
        });
        const result = await run('console.log("Hello World");', 93, '', 1000, 256000);
        expect(result.success).toBe(true);
        expect(result.stdout).toBe('Hello World');
    });

    it('should return error for invalid javascript code', async () => {
        childProcess.execFile.mockImplementationOnce((cmd, args, opts, cb) => {
            cb({ message: 'SyntaxError' }, '', 'SyntaxError');
            return { stdin: { write: jest.fn(), on: jest.fn(), end: jest.fn() } };
        });
        const result = await run('invalid code', 93, '', 1000, 256000);
        expect(result.success).toBe(false);
        expect(result.reason).toBe('RUNTIME_ERROR');
        expect(result.stderr).toContain('SyntaxError');
    });

    it('should timeout for an infinite loop', async () => {
        childProcess.execFile.mockImplementationOnce((cmd, args, opts, cb) => {
            cb({ killed: true }, '', '');
            return { stdin: { write: jest.fn(), on: jest.fn(), end: jest.fn() } };
        });
        const result = await run('while(true) {}', 93, '', 500, 256000);
        expect(result.success).toBe(false);
        expect(result.reason).toBe('TIME_LIMIT_EXCEEDED');
    });
});
