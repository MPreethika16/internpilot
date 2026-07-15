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
  YCStartupsDetailExtractor,
} from "../scrapers/sources/yc-startups/yc-startups-detail.extractor";

function readJobId(): number {
  const rawJobId = process.argv[2];

  if (!rawJobId) {
    throw new Error(
      "Usage: npx ts-node src/scripts/test-yc-detail-extractor.ts <jobId>",
    );
  }

  const jobId = Number(rawJobId);

  if (!Number.isInteger(jobId) || jobId <= 0) {
    throw new Error(
      `Invalid YC job ID: ${rawJobId}`,
    );
  }

  return jobId;
}

async function main(): Promise<void> {
  const jobId = readJobId();

  const client = new YCStartupsClient(
    playwrightBrowserService,
    ycStartupsConfig,
  );

  const extractor =
    new YCStartupsDetailExtractor();

  try {
    const html =
      await client.fetchJobDetailPage(jobId);

    const detail =
      extractor.extractDetail(html);

    console.log({
      job: {
        id: detail.job.id,
        title: detail.job.title,
        jobType: detail.job.jobType,
        location: detail.job.location,
        skills: detail.job.skills,
        descriptionLength:
          detail.job.descriptionHtml.length,
      },

      company: {
        name: detail.company.name,
        industry: detail.company.industry,
        website: detail.company.url,
        teamSize: detail.company.teamSize,
      },

      applyUrl: detail.applyUrl,
    });
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