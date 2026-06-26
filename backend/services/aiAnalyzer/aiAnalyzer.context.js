export class AiAnalyzerContext {
    constructor(strategy) {
        this.strategy = strategy;
    }

    setStrategy(strategy) {
        this.strategy = strategy;
    }

    async analyze(code, problem, verdict) {
        if (!this.strategy) {
            throw new Error("AI Analyzer Strategy not set.");
        }
        return await this.strategy.analyze(code, problem, verdict);
    }
}
