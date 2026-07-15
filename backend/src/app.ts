import express, {
  type Request,
  type Response,
} from "express";
import cors from "cors";

import scraperRoutes from "./routes/scraper.routes";
import { startScraperScheduler } from "./cron/scraper.scheduler";
import { scraperPipelineService } from "./container";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/scraper", scraperRoutes);

app.get(
  "/health",
  (_req: Request, res: Response) => {
    res.status(200).json({
      status: "ok",
      message: "InternPilot backend is running",
    });
  },
);

if (process.env.NODE_ENV !== "test") {
  startScraperScheduler(
    () => scraperPipelineService.run(),
  );
}

export default app;