import type { InternshipScraper } from "../../scraper.interface";
import type { ScrapedInternship } from "../../types";

import { GreenhouseClient } from "./greenhouse.client";
import type { GreenhouseCompanyConfig } from "./greenhouse.config";
import { mapGreenhouseJob } from "./greenhouse.mapper";

import {
  evaluateInternshipRelevance,
} from "../../../services/internship-relevance.service";

export class GreenhouseScraper implements InternshipScraper {
  public readonly sourceName = "GREENHOUSE";

  private readonly client = new GreenhouseClient();

  constructor(
    private readonly config: GreenhouseCompanyConfig,
  ) {}

  public async scrape(): Promise<ScrapedInternship[]> {
    const jobs = await this.client.fetchJobs(
      this.config.boardToken,
    );

    const mappedInternships: ScrapedInternship[] = [];

    for (const job of jobs) {
      try {
        const internship = mapGreenhouseJob(
          job,
          this.config,
        );

        mappedInternships.push(internship);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Unknown mapping error";

        console.error(
          `[Greenhouse:${this.config.boardToken}] Skipped job ${job.id}: ${message}`,
        );
      }
    }

    const relevantInternships =
  mappedInternships.filter((internship) => {
    const evaluation =
      evaluateInternshipRelevance(internship);

    if (!evaluation.relevant) {
      console.log(
        `[Greenhouse:${this.config.boardToken}] Rejected`,
        {
          title: internship.title,
          location: internship.location,
          reasons: evaluation.reasons,
        },
      );
    }

    return evaluation.relevant;
  });

    console.log(
      `[Greenhouse:${this.config.boardToken}]`,
    );
    console.log(`Fetched: ${jobs.length}`);
    console.log(`Mapped: ${mappedInternships.length}`);
    console.log(`Relevant: ${relevantInternships.length}`);

    return relevantInternships;
  }
}