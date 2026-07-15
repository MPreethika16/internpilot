import type { InternshipScraper } from "../../scraper.interface";
import type { ScrapedInternship } from "../../types";

import type { BrowserService } from "../../../services/browser/browser.interface";

import { isRelevantInternship } from "../../../services/internship-relevance.service";

import type { YCStartupsConfig } from "./yc-startups.config";
import { YCStartupsClient } from "./yc-startups.client";
import { YCStartupsExtractor } from "./yc-startups.extractor";
import { YCStartupsDetailExtractor } from "./yc-startups-detail.extractor";
import { evaluateYCJobCandidate } from "./yc-startups.filter";
import { mapYCStartupDetail } from "./yc-startups.mapper";

export class YCStartupsScraper implements InternshipScraper {
  public readonly sourceName = "YC_STARTUPS";

  private readonly client: YCStartupsClient;

  private readonly listingExtractor =
    new YCStartupsExtractor();

  private readonly detailExtractor =
    new YCStartupsDetailExtractor();

  constructor(
    browserService: BrowserService,
    config: YCStartupsConfig,
  ) {
    this.client = new YCStartupsClient(
      browserService,
      config,
    );
  }

  public async scrape(): Promise<ScrapedInternship[]> {
    console.log("[YCStartups] Scrape started");

    const listingHtml =
      await this.client.fetchJobsPage();

    const listingJobs =
      this.listingExtractor.extractJobs(listingHtml);

    const candidates = listingJobs.filter((job) => {
      const evaluation =
        evaluateYCJobCandidate(job);

      if (
        !evaluation.accepted &&
        isInternshipType(job.jobType)
      ) {
        console.log(
          "[YCStartups] Rejected candidate",
          {
            id: job.id,
            title: job.title,
            company: job.companyName,
            location: job.location,
            reasons: evaluation.reasons,
          },
        );
      }

      return evaluation.accepted;
    });

    const internships: ScrapedInternship[] = [];

    let processingFailures = 0;
    let finalRelevanceRejections = 0;

    for (const candidate of candidates) {
      try {
        const detailHtml =
          await this.client.fetchJobDetailPage(
            candidate.id,
          );

        const detail =
          this.detailExtractor.extractDetail(
            detailHtml,
          );

        if (detail.job.id !== candidate.id) {
          throw new Error(
            `YC detail ID mismatch: expected ${candidate.id}, received ${detail.job.id}`,
          );
        }

        const internship =
          mapYCStartupDetail(detail);

        if (!isRelevantInternship(internship)) {
          finalRelevanceRejections += 1;

          console.log(
            "[YCStartups] Rejected after detail mapping",
            {
              id: candidate.id,
              title: internship.title,
              company: internship.companyName,
              location: internship.location,
            },
          );

          continue;
        }

        internships.push(internship);
      } catch (error) {
        processingFailures += 1;

        const message =
          error instanceof Error
            ? error.message
            : "Unknown YC job processing error";

        console.error(
          `[YCStartups] Failed job ${candidate.id}: ${message}`,
        );
      }
    }

    console.log("[YCStartups]");
    console.log(
      `Listing jobs: ${listingJobs.length}`,
    );
    console.log(
      `Candidates: ${candidates.length}`,
    );
    console.log(
      `Processing failures: ${processingFailures}`,
    );
    console.log(
      `Final relevance rejections: ${finalRelevanceRejections}`,
    );
    console.log(
      `Relevant: ${internships.length}`,
    );

    return internships;
  }
}

function isInternshipType(
  jobType: string,
): boolean {
  const normalized = jobType
    .trim()
    .toLowerCase();

  return (
    normalized === "intern" ||
    normalized === "internship"
  );
}