import aiService from '../services/ai.service.js';

export const getReview = async (req, res) => {
    try {
        const code = req.body.code;

        if (!code) {
            return res.status(400).send({ message: "Prompt is required" });
        }

        const response = await aiService(code);

        return res.send(response);
    } catch (error) {
        console.error('AI review failed:', error?.message || error);

        const statusCode = error?.status || 500;
        const message = statusCode === 429
            ? 'AI quota exceeded. Please check Gemini API billing/quota and try again later.'
            : 'Failed to generate code review.';

        return res.status(statusCode).send({
            message,
            details: error?.message || 'Unknown error'
        });
    }
};