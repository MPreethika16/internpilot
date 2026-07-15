import { writeFile } from "node:fs/promises";

import { playwrightBrowserService } from "../services/browser/playwright-browser.service";
import { YCStartupsClient } from "../scrapers/sources/yc-startups/yc-startups.client";
import { ycStartupsConfig } from "../scrapers/sources/yc-startups/yc-startups.config";

async function main(): Promise<void> {
  const client = new YCStartupsClient(
    playwrightBrowserService,
    ycStartupsConfig,
  );

  try {
    const html = await client.fetchJobsPage();

    await writeFile(
      "yc-jobs-page.html",
      html,
      "utf-8",
    );

    console.log(`Fetched ${html.length} characters`);
    console.log("Saved HTML to yc-jobs-page.html");
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