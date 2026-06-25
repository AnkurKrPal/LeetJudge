import { BaseAnalyzerStrategy } from './base.strategy.js';
import logger from '../../../utils/logger.js';
import Groq from "groq-sdk";

export class GroqAnalyzerStrategy extends BaseAnalyzerStrategy {
    async analyze(code, problem, verdict) {
        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
            throw new Error("GROQ_API_KEY is not set in environment variables");
        }

        const prompt = `
You are an expert programming judge and code reviewer.
I have a submission for a problem. I need you to analyze the code and return a review.

Problem Title: ${problem.title}
Problem Description: 
${problem.description}

User Code:
\`\`\`
${code}
\`\`\`

Submission Verdict: ${verdict}

Analyze the user's code and provide:
1. Time Complexity (e.g. O(N), O(N^2))
2. Space Complexity (e.g. O(1), O(N))
3. Review: 
   - If the verdict is ACCEPTED (or similar), provide a short review of the code (is it optimal? is there a better approach?).
   - If the verdict is WRONG_ANSWER, TIME_LIMIT_EXCEEDED, or similar, provide a short review explaining what is likely wrong or inefficient. Do not give the direct solution, just hints.

Respond strictly in valid JSON format without markdown blocks, with the following keys:
{
  "timeComplexity": "...",
  "spaceComplexity": "...",
  "review": "..."
}
`;

        try {
            const groq = new Groq({ apiKey });

            const response = await groq.chat.completions.create({
                messages: [
                    {
                        role: "user",
                        content: prompt,
                    },
                ],
                model: "llama-3.3-70b-versatile",
                response_format: { type: "json_object" },
            });

            let jsonText = response.choices[0]?.message?.content || '';
            
            // Clean up any potential markdown formatting
            jsonText = jsonText.trim();
            if (jsonText.startsWith('```json')) {
                jsonText = jsonText.replace(/^```json\n?/, '').replace(/```\s*$/, '');
            } else if (jsonText.startsWith('```')) {
                jsonText = jsonText.replace(/^```\n?/, '').replace(/```\s*$/, '');
            }
            
            if (!jsonText) {
                throw new Error("Unexpected empty response from Groq");
            }
            
            return JSON.parse(jsonText.trim());
            
        } catch (error) {
            logger.error('GroqStrategy', `Failed to analyze code: ${error.message}`);
            throw error;
        }
    }
}
