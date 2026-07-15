import { ScraperManager } from "./scraper.manager";
import { GreenhouseScraper } from "./sources/greenhouse/greenhouse.scraper";
import { greenhouseCompanies } from "./sources/greenhouse/greenhouse.config";

/*
 * Create one Greenhouse scraper for every configured company.
 *
 * Example:
 * greenhouseCompanies = [
 *   {
 *     companyName: "Podium",
 *     boardToken: "podium81",
 *     ...
 *   },
 * ];
 */
const greenhouseScrapers = greenhouseCompanies.map(
  (config) => new GreenhouseScraper(config),
);

/*
 * This is the shared ScraperManager instance used by the application.
 *
 * Later, when MicrosoftScraper is ready:
 *
 * const scrapers = [
 *   ...greenhouseScrapers,
 *   microsoftScraper,
 * ];
 */
export const scraperManager = new ScraperManager([
  ...greenhouseScrapers,
]);