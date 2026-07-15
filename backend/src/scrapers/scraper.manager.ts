import type { InternshipScraper } from "./scraper.interface";
import type { ScrapedInternship } from "./types";

export class ScraperManager {
  constructor(
    private readonly scrapers: InternshipScraper[],
  ) {}

  public async scrapeAll(): Promise<ScrapedInternship[]> {
    const results = await Promise.allSettled(
      this.scrapers.map((scraper) => scraper.scrape()),
    );



    const internships: ScrapedInternship[] = [];

    results.forEach((result, index) => {
      const scraper = this.scrapers[index];

      if (result.status === "fulfilled") {
        internships.push(...result.value);

        console.log(
          `[ScraperManager] ${scraper.sourceName}: ${result.value.length} internships`,
        );

        return;
      }
      

      const message =
        result.reason instanceof Error
          ? result.reason.message
          : "Unknown scraper error";

      console.error(
        `[ScraperManager] ${scraper.sourceName} failed: ${message}`,
      );
    });

    console.log(
      `[ScraperManager] Combined internships: ${internships.length}`,
    );

    

    return internships;
  }

  
}