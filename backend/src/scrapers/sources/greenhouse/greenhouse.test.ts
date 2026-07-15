import { greenhouseCompanies } from "./greenhouse.config";
import { GreenhouseScraper } from "./greenhouse.scraper";

async function testGreenhouseScraper(): Promise<void> {
  const config = greenhouseCompanies[0];

  if (!config) {
    throw new Error("No Greenhouse company configuration found");
  }

  const scraper = new GreenhouseScraper(config);

  const internships = await scraper.scrape();

  console.log(`Returned internships: ${internships.length}`);

  for (const internship of internships) {
    console.log({
      title: internship.title,
      companyName: internship.companyName,
      location: internship.location,
      externalId: internship.externalId,
      applicationUrl: internship.applicationUrl,
    });
  }

  
}

testGreenhouseScraper().catch((error: unknown) => {
  const message =
    error instanceof Error ? error.message : "Unknown error";

  console.error(`Greenhouse scraper test failed: ${message}`);
  process.exitCode = 1;
});