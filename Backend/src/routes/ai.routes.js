import express from 'express';
import { getReview, getRefactor } from '../controllers/ai.controller.js';

const router = express.Router();

router.post("/get-review", getReview);
router.post("/get-refactor", getRefactor);

export default router;