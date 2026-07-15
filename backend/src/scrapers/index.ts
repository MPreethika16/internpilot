import { ScraperManager } from "./scraper.manager";

import { GreenhouseScraper } from "./sources/greenhouse/greenhouse.scraper";
import { greenhouseCompanies } from "./sources/greenhouse/greenhouse.config";

import { YCStartupsScraper } from "./sources/yc-startups/yc-startups.scraper";
import { ycStartupsConfig } from "./sources/yc-startups/yc-startups.config";

import { playwrightBrowserService } from "../services/browser/playwright-browser.service";

const greenhouseScrapers = greenhouseCompanies.map(
  (config) => new GreenhouseScraper(config),
);

const ycStartupsScraper = new YCStartupsScraper(
  playwrightBrowserService,
  ycStartupsConfig,
);

export const scraperManager = new ScraperManager([
  ...greenhouseScrapers,
  ycStartupsScraper,
]);