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

import {
  mapYCStartupDetail,
} from "../scrapers/sources/yc-startups/yc-startups.mapper";

async function main(): Promise<void> {
  const jobId = Number(process.argv[2]);

  if (!Number.isInteger(jobId) || jobId <= 0) {
    throw new Error(
      "Usage: npx ts-node src/scripts/test-yc-mapper.ts <jobId>",
    );
  }

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

    const internship =
      mapYCStartupDetail(detail);

    console.dir(internship, {
      depth: null,
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