import type { Request, Response } from "express";

import { ScraperManager } from "../scrapers/scraper.manager";
import { MicrosoftScraper } from "../scrapers/sources/microsoft/microsoft.scraper";
import { GreenhouseScraper } from "../scrapers/sources/greenhouse/greenhouse.scraper";
import { greenhouseCompanies } from "../scrapers/sources/greenhouse/greenhouse.config";
import { IngestionService } from "../services/ingestion.service";

export async function runScrapers(req: Request, res: Response): Promise<void> {
  try {
    const greenhouseConfig = greenhouseCompanies[0];

    if (!greenhouseConfig) {
      throw new Error("No Greenhouse company configuration found");
    }

    const manager = new ScraperManager([
      new MicrosoftScraper(),
      new GreenhouseScraper(greenhouseConfig),
    ]);

    const internships = await manager.scrapeAll();

    const ingestionService = new IngestionService();

    const result = await ingestionService.ingest(internships);

    res.status(200).json({
      success: true,
      scraped: internships.length,
      ingestion: result,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown scraper pipeline error";

    res.status(500).json({
      success: false,
      message,
    });
  }
}
