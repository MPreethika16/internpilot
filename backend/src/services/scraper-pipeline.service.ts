import { ScraperManager } from "../scrapers/scraper.manager";
import {
  IngestionService,
  type IngestionResult,
} from "./ingestion.service";

export class ScraperPipelineService {
  constructor(
    private readonly manager: ScraperManager,
    private readonly ingestionService: IngestionService,
  ) {}

  public async run(): Promise<void> {
    const startedAt = Date.now();

    console.log("[ScraperPipeline] Pipeline started");

    const internships =
      await this.manager.scrapeAll();

    console.log(
      `[ScraperPipeline] ${internships.length} relevant internships collected`,
    );

    const ingestionResult: IngestionResult =
      await this.ingestionService.ingest(
        internships,
      );

    console.log("[ScraperPipeline] Ingestion result", {
      received: ingestionResult.received,
      created: ingestionResult.created,
      updated: ingestionResult.updated,
      unchanged: ingestionResult.unchanged,
      failed: ingestionResult.failed,
    });

    if (ingestionResult.errors.length > 0) {
      console.error(
        "[ScraperPipeline] Ingestion completed with errors",
        ingestionResult.errors,
      );
    }

    console.log(
      `[ScraperPipeline] Pipeline completed in ${
        Date.now() - startedAt
      } ms`,
    );
  }
}