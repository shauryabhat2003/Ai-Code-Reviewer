import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_KEY);

// Review Model
const reviewModel = genAI.getGenerativeModel({
    model: "gemini-2.5-flash-lite",
    systemInstruction: `You are an expert code reviewer with 7+ years of development experience.
Your role is to analyze, review, and improve code.

You MUST respond ONLY with a valid JSON object matching this exact structure:
{
  "executiveSummary": "A brief overall assessment of the code...",
  "reviewFindings": [
    {
      "type": "error", // Use "error" (red), "warning" (amber), or "success" (green)
      "title": "Short title of the finding",
      "description": "Detailed explanation..."
    }
  ],
  "status": "NEEDS REVISION" // or "APPROVED"
}

Do not include any Markdown wrapping like \`\`\`json. Return purely the JSON object.`
});

// Refactor Model
const refactorModel = genAI.getGenerativeModel({
    model: "gemini-2.5-flash-lite",
    systemInstruction: `You are an expert software engineer.
The user provides a code snippet that needs fixing or improving.
Your job is to refactor it and explain the changes.

You MUST respond ONLY with a valid JSON object matching this exact structure:
{
  "refactorDescription": "A summary of the changes made and why...",
  "refactoredCode": "The fully refactored code snippet here as a string...",
  "language": "TYPESCRIPT" // Specify the language (e.g., TYPESCRIPT, JAVASCRIPT, PYTHON, C#) uppercase
}

Do not include any Markdown wrapping like \`\`\`json. Return purely the JSON object.`
});

export const generateReview = async (prompt) => {
    const result = await reviewModel.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" }
    });
    return result.response.text();
};

export const generateRefactor = async (prompt) => {
    const result = await refactorModel.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" }
    });
    return result.response.text();
};
