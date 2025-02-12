import express from 'express';
import cors from 'cors';
import aiRoutes from './routes/ai.routes.js';

const app = express();

app.use(cors()); // Enable CORS for all routes
app.use(express.json());

app.use('/ai', aiRoutes);

export default app;