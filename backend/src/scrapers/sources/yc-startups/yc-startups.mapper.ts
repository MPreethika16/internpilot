import type { ScrapedInternship } from "../../types";

import type {
  YCDetailPageProps,
} from "./yc-startups.types";

import {
  htmlToText,
} from "../../../utils/html-to-text";

const YC_SOURCE_PLATFORM = "YC_STARTUPS";

export function mapYCStartupDetail(
  detail: YCDetailPageProps,
): ScrapedInternship {
  const { job, company, applyUrl } = detail;

  if (!Number.isInteger(job.id) || job.id <= 0) {
    throw new Error(
      `Invalid YC job ID: ${job.id}`,
    );
  }

  const title = normalizeRequiredInlineText(
    job.title,
    "job title",
  );

  const companyName = normalizeRequiredInlineText(
    company.name,
    "company name",
  );

  const description = htmlToText(
    normalizeRequiredHtml(
      job.descriptionHtml,
      "job description",
    ),
  );

  const applicationUrl =
    normalizeRequiredInlineText(
      applyUrl,
      "application URL",
    );

  return {
    title,
    companyName,
    description,

    eligibility:
      normalizeOptionalInlineText(
        buildEligibility(job),
      ),

    stipend:
      normalizeOptionalInlineText(
        job.salaryRange,
      ),

    benefits:
      normalizeOptionalMultilineText(
        job.interviewProcessHtml
          ? htmlToText(job.interviewProcessHtml)
          : undefined,
      ),

    skills: normalizeSkills(job.skills),

    location:
      normalizeOptionalInlineText(
        job.location,
      ),

    applicationUrl,

    sourceUrl: buildJobDetailUrl(job.id),

    sourcePlatform: YC_SOURCE_PLATFORM,

    externalId: String(job.id),

    companyWebsite:
      normalizeOptionalInlineText(
        company.url,
      ),

    companyIndustry:
      normalizeOptionalInlineText(
        company.industry,
      ),

    companyHeadquarters:
      normalizeOptionalInlineText(
        company.location,
      ),

    companyLogoUrl:
      normalizeOptionalInlineText(
        company.logoUrl,
      ),

    companyAbout:
      buildCompanyAbout(detail),
  };
}

function buildEligibility(
  job: YCDetailPageProps["job"],
): string | undefined {
  const values = [
    job.sponsorsVisa,
    job.minExperience,
  ]
    .map(normalizeOptionalInlineText)
    .filter(
      (value): value is string =>
        value !== undefined,
    );

  return values.length > 0
    ? values.join(" | ")
    : undefined;
}

function buildCompanyAbout(
  detail: YCDetailPageProps,
): string | undefined {
  const { company } = detail;

  const values = [
    company.description,
    company.hiringDescriptionHtml
      ? htmlToText(company.hiringDescriptionHtml)
      : undefined,
    company.techDescriptionHtml
      ? htmlToText(company.techDescriptionHtml)
      : undefined,
  ]
    .map(normalizeOptionalMultilineText)
    .filter(
      (value): value is string =>
        value !== undefined,
    );

  return values.length > 0
    ? values.join("\n\n")
    : undefined;
}

function buildJobDetailUrl(
  jobId: number,
): string {
  return `https://www.workatastartup.com/jobs/${jobId}`;
}

function normalizeRequiredInlineText(
  value: string | null | undefined,
  fieldName: string,
): string {
  const normalized =
    normalizeOptionalInlineText(value);

  if (!normalized) {
    throw new Error(
      `YC job is missing ${fieldName}`,
    );
  }

  return normalized;
}

function normalizeRequiredHtml(
  value: string | null | undefined,
  fieldName: string,
): string {
  if (!value?.trim()) {
    throw new Error(
      `YC job is missing ${fieldName}`,
    );
  }

  return value;
}

function normalizeOptionalInlineText(
  value: string | null | undefined,
): string | undefined {
  if (value == null) {
    return undefined;
  }

  const normalized = value
    .trim()
    .replace(/\s+/g, " ");

  return normalized.length > 0
    ? normalized
    : undefined;
}

function normalizeOptionalMultilineText(
  value: string | null | undefined,
): string | undefined {
  if (value == null) {
    return undefined;
  }

  const normalized = value
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return normalized.length > 0
    ? normalized
    : undefined;
}

function normalizeSkills(
  skills: string[] | null | undefined,
): string[] | undefined {
  if (!skills) {
    return undefined;
  }

  const normalizedSkills = Array.from(
    new Set(
      skills
        .map(normalizeOptionalInlineText)
        .filter(
          (skill): skill is string =>
            skill !== undefined,
        ),
    ),
  ).sort((first, second) =>
    first.localeCompare(second),
  );

  return normalizedSkills.length > 0
    ? normalizedSkills
    : undefined;
}