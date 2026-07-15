import { scraperManager } from "./scrapers";
import { IngestionService } from "./services/ingestion.service";
import { ScraperPipelineService } from "./services/scraper-pipeline.service";

const ingestionService = new IngestionService();

export const scraperPipelineService =
  new ScraperPipelineService(
    scraperManager,
    ingestionService,
  );