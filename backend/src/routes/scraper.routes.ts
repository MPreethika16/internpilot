import { Router } from "express";
import { scraperPipelineService } from "../container";

const router = Router();

router.post("/run", async (_req, res) => {
  console.log("===== ROUTE HIT =====");
  try {
    await scraperPipelineService.run();

    res.status(200).json({
      success: true,
      message: "Scraper pipeline completed",
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unknown pipeline error";

    res.status(500).json({
      success: false,
      message,
    });
  }
});

export default router;

