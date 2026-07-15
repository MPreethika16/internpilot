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

function readJobId(): number {
  const rawJobId = process.argv[2];

  if (!rawJobId) {
    throw new Error(
      "Usage: npx ts-node src/scripts/inspect-yc-job-detail.ts <jobId>",
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

  try {
    const html =
      await client.fetchJobDetailPage(jobId);

    const outputPath =
      `yc-job-${jobId}.html`;

    await writeFile(
      outputPath,
      html,
      "utf-8",
    );

    console.log(
      `Fetched ${html.length} characters`,
    );

    console.log(
      `Saved job detail HTML to ${outputPath}`,
    );

    console.log(
      html.slice(0, 1000),
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