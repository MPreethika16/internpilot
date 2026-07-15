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

import {
  evaluateYCJobCandidate,
} from "../scrapers/sources/yc-startups/yc-startups.filter";

async function main(): Promise<void> {
  const client = new YCStartupsClient(
    playwrightBrowserService,
    ycStartupsConfig,
  );

  const extractor = new YCStartupsExtractor();

  try {
    const html = await client.fetchJobsPage();
    const jobs = extractor.extractJobs(html);

    const acceptedJobs = jobs.filter((job) => {
      const result = evaluateYCJobCandidate(job);

      if (!result.accepted && job.jobType === "Intern") {
        console.log("[Rejected internship]", {
          id: job.id,
          title: job.title,
          company: job.companyName,
          location: job.location,
          roleType: job.roleType,
          reasons: result.reasons,
        });
      }

      return result.accepted;
    });

    console.log({
      extracted: jobs.length,
      internshipListings: jobs.filter(
        (job) => job.jobType === "Intern",
      ).length,
      acceptedCandidates: acceptedJobs.length,
    });

    console.log(
      acceptedJobs.map((job) => ({
        id: job.id,
        title: job.title,
        company: job.companyName,
        location: job.location,
        roleType: job.roleType,
      })),
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