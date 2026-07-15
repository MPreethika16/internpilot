import {
  chromium,
  type Browser,
  type BrowserContext,
  type Page,
} from "playwright";
import type { BrowserService } from "./browser.interface";
import type { FetchPageOptions } from "./browser.types";



export class PlaywrightBrowserService implements BrowserService{
  private browser: Browser | null = null;

  private async getBrowser(): Promise<Browser> {
    if (this.browser) {
      return this.browser;
    }

    this.browser = await chromium.launch({
      headless: true,
    });

    return this.browser;
  }

  public async fetchHtml(
    url: string,
    options: FetchPageOptions = {},
  ): Promise<string> {
    const browser = await this.getBrowser();

    const context = await browser.newContext({
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
        "AppleWebKit/537.36 (KHTML, like Gecko) " +
        "Chrome/131.0.0.0 Safari/537.36",
    });

    try {
      await this.configureContext(context);

      const page = await context.newPage();

      await this.navigate(page, url, options);

      return await page.content();
    } finally {
      await context.close();
    }
  }

  public async close(): Promise<void> {
    if (!this.browser) {
      return;
    }

    await this.browser.close();
    this.browser = null;
  }

  private async configureContext(
    context: BrowserContext,
  ): Promise<void> {
    await context.route("**/*", async (route) => {
      const resourceType =
        route.request().resourceType();

      const blockedResourceTypes = new Set([
        "image",
        "font",
        "media",
      ]);

      if (blockedResourceTypes.has(resourceType)) {
        await route.abort();
        return;
      }

      await route.continue();
    });
  }

  private async navigate(
    page: Page,
    url: string,
    options: FetchPageOptions,
  ): Promise<void> {
    const timeoutMs =
      options.timeoutMs ?? 30_000;

    await page.goto(url, {
      waitUntil:
        options.waitUntil ?? "domcontentloaded",
      timeout: timeoutMs,
    });

    if (options.waitForSelector) {
      await page.waitForSelector(
        options.waitForSelector,
        {
          timeout: timeoutMs,
        },
      );
    }
  }
}

export const playwrightBrowserService =
  new PlaywrightBrowserService();