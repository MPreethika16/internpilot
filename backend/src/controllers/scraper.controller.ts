import { Request, Response } from "express";
import { IngestionService } from "../scrapers/ingestion.service";
import { MicrosoftScraper } from "../scrapers/sources/microsoft.scraper";

export const testMicrosoftScraper = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const scraper = new MicrosoftScraper();
    const internships = await scraper.scrape();

    const ingestionService = new IngestionService();
    await ingestionService.ingest(internships);

    res.status(200).json({
      success: true,
      count: internships.length,
      data: internships,
    });
  } catch (error) {
    console.error("Microsoft scraper failed:", error);

    res.status(500).json({
      success: false,
      message: "Failed to scrape Microsoft internships",
    });
  }
};