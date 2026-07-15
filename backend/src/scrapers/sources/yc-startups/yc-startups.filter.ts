import type {  YCListingJob } from "./yc-startups.types";

export type YCJobFilterResult = {
  accepted: boolean;
  reasons: string[];
};

const TECHNICAL_ROLE_TYPES = new Set([
  "backend",
  "frontend",
  "full stack",
  "fullstack",
  "machine learning",
  "data science",
  "devops",
  "infrastructure",
  "security",
  "hardware",
  "engineering",
]);

const TELANGANA_LOCATION_KEYWORDS = [
  "telangana",
  "hyderabad",
  "secunderabad",
  "gachibowli",
  "madhapur",
  "hitec city",
  "warangal",
];

const INDIA_REMOTE_PATTERNS = [
  "remote (in)",
  "remote india",
  "india remote",
  "remote - india",
  "in / remote",
];

function normalize(value: string | null | undefined): string {
  return value?.trim().toLowerCase().replace(/\s+/g, " ") ?? "";
}

function isInternship(job:  YCListingJob): boolean {
  return normalize(job.jobType) === "intern";
}

function isTechnicalRole(job:  YCListingJob): boolean {
  const roleType = normalize(job.roleType);

  if (TECHNICAL_ROLE_TYPES.has(roleType)) {
    return true;
  }

  const title = normalize(job.title);

  const technicalTitleKeywords = [
    "software",
    "engineer",
    "developer",
    "backend",
    "frontend",
    "full stack",
    "fullstack",
    "machine learning",
    "data",
    "ai ",
    "artificial intelligence",
    "cloud",
    "devops",
    "security",
    "qa",
    "quality assurance",
  ];

  return technicalTitleKeywords.some((keyword) =>
    title.includes(keyword),
  );
}

function isEligibleLocation(job:  YCListingJob): boolean {
  const location = normalize(job.location);

  const isInTelangana = TELANGANA_LOCATION_KEYWORDS.some(
    (keyword) => location.includes(keyword),
  );

  const isRemoteInIndia = INDIA_REMOTE_PATTERNS.some(
    (pattern) => location.includes(pattern),
  );

  return isInTelangana || isRemoteInIndia;
}

export function evaluateYCJobCandidate(
  job:  YCListingJob,
): YCJobFilterResult {
  const reasons: string[] = [];

  if (!isInternship(job)) {
    reasons.push(`Unsupported job type: ${job.jobType}`);
  }

  if (!isTechnicalRole(job)) {
    reasons.push(`Non-technical role: ${job.roleType}`);
  }

  if (!isEligibleLocation(job)) {
    reasons.push(`Ineligible location: ${job.location}`);
  }

  return {
    accepted: reasons.length === 0,
    reasons,
  };
}

export function isYCJobCandidate(
  job:  YCListingJob,
): boolean {
  return evaluateYCJobCandidate(job).accepted;
}