import cron, {
  type ScheduledTask,
} from "node-cron";

export function startScraperScheduler(
  runPipeline: () => Promise<void>,
): ScheduledTask {
  const task = cron.schedule(
    "0 */6 * * *",
    async () => {
      const startedAt = Date.now();

      console.log(
        "[Scheduler] Scheduled scraper pipeline started",
      );

      try {
        await runPipeline();

        console.log(
          `[Scheduler] Scheduled scraper pipeline completed in ${
            Date.now() - startedAt
          } ms`,
        );
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Unknown scheduler error";

        console.error(
          `[Scheduler] Scheduled scraper pipeline failed: ${message}`,
        );
      }
    },
    {
      noOverlap: true,
      timezone: "Asia/Kolkata",
    },
  );

  console.log(
    "[Scheduler] Scraper scheduler registered: every 6 hours",
  );

  return task;
}