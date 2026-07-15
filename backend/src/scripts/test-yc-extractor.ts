import { writeFile } from "node:fs/promises";

import {
  playwrightBrowserService,
} from "../services/browser/playwright-browser.service";

import {
  YCStartupsClient,
} from "../scrapers/sources/yc-startups/yc-startups.client";

import {
  ycStartupsConfig,
} from "../scrapers/sources/yc-startups/yc-startups.config";

import {
  YCStartupsExtractor,
} from "../scrapers/sources/yc-startups/yc-startups.extractor";

async function main(): Promise<void> {
  const client = new YCStartupsClient(
    playwrightBrowserService,
    ycStartupsConfig,
  );

  const extractor = new YCStartupsExtractor();

  try {
    const html = await client.fetchJobsPage();

    const jobs = extractor.extractJobs(html);

    console.log(`Extracted ${jobs.length} jobs`);

    console.log(
      jobs.slice(0, 5).map((job) => ({
        id: job.id,
        title: job.title,
        jobType: job.jobType,
        companyName: job.companyName,
        location: job.location,
      })),
    );

    await writeFile(
      "yc-extracted-jobs.json",
      JSON.stringify(jobs, null, 2),
      "utf-8",
    );

    console.log(
      "Saved extracted jobs to yc-extracted-jobs.json",
    );
  } finally {
    await playwrightBrowserService.close();
  }
}

void main().catch((error: unknown) => {
  console.error(
    error instanceof Error
      ? error.message
      : error,
  );

  process.exit(1);
});