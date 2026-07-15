import { readFile } from "node:fs/promises";
import * as cheerio from "cheerio";

function readJobId(): number {
  const rawJobId = process.argv[2];

  if (!rawJobId) {
    throw new Error(
      "Usage: npx ts-node src/scripts/inspect-yc-detail-data.ts <jobId>",
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

  const html = await readFile(
    `yc-job-${jobId}.html`,
    "utf-8",
  );

  const $ = cheerio.load(html);

  const dataPage = $("[data-page]")
    .first()
    .attr("data-page");

  if (!dataPage) {
    console.log(
      "No data-page attribute was found",
    );

    return;
  }

  const parsedData: unknown =
    JSON.parse(dataPage);

  console.dir(parsedData, {
    depth: 5,
    maxArrayLength: 10,
  });
}

void main().catch((error: unknown) => {
  console.error(
    error instanceof Error
      ? error.message
      : error,
  );

  process.exit(1);
});