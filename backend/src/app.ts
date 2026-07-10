import express, { Request, Response } from 'express';
import cors from 'cors';
import scraperRoutes from "./routes/scraper.routes";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

app.use("/api/scraper", scraperRoutes);
// Routes
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    message: 'InternPilot backend is running'
  });
});

export default app;
