import type { BrowserService } from "../../../services/browser/browser.interface";
import type { YCStartupsConfig } from "./yc-startups.config";

export class YCStartupsClient {
  constructor(
    private readonly browserService: BrowserService,
    private readonly config: YCStartupsConfig,
  ) {}

  public async fetchJobsPage(): Promise<string> {
    return this.browserService.fetchHtml(
      this.config.jobsUrl,
      {
        waitUntil: "domcontentloaded",
        timeoutMs: this.config.timeoutMs,
        waitForSelector:
          this.config.waitForSelector,
      },
    );
  }

  public async fetchJobDetailPage(
    jobId: number,
  ): Promise<string> {
    if (!Number.isInteger(jobId) || jobId <= 0) {
      throw new Error(
        `Invalid YC job ID: ${jobId}`,
      );
    }

    const detailUrl =
      `${this.config.jobDetailBaseUrl}/${jobId}`;

    return this.browserService.fetchHtml(
      detailUrl,
      {
        waitUntil: "domcontentloaded",
        timeoutMs: this.config.timeoutMs,
      },
    );
  }
}