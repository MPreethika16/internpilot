import type { ScrapedInternship } from "../scrapers/types";

const INTERNSHIP_KEYWORDS = [
  "intern",
  "internship",
  "co-op",
  "coop",
  "trainee",
];

const TECHNICAL_KEYWORDS = [
  "software",
  "developer",
  "engineering",
  "backend",
  "frontend",
  "front end",
  "full stack",
  "fullstack",
  "mobile",
  "android",
  "ios",
  "data",
  "machine learning",
  "artificial intelligence",
  "ai",
  "ml",
  "cloud",
  "devops",
  "security",
  "cybersecurity",
  "qa",
  "quality assurance",
];

const ELIGIBLE_LOCATION_KEYWORDS = [
  "hyderabad",
  "telangana",
  "india",
  "remote india",
  "india remote",
  "remote - india",
];

const RESTRICTED_LOCATION_KEYWORDS = [
  "us only",
  "united states only",
  "canada only",
  "uk only",
  "emea only",
];

function includesAny(value: string, keywords: string[]): boolean {
  const normalizedValue = value.toLowerCase();

  return keywords.some((keyword) =>
    normalizedValue.includes(keyword.toLowerCase()),
  );
}

export function isInternship(
  internship: ScrapedInternship,
): boolean {
  return includesAny(internship.title, INTERNSHIP_KEYWORDS);
}

export function isTechnicalInternship(
  internship: ScrapedInternship,
): boolean {
  const searchableText = [
    internship.title,
    internship.description,
    ...(internship.skills ?? []),
  ].join(" ");

  return includesAny(searchableText, TECHNICAL_KEYWORDS);
}

export function isEligibleLocation(
  internship: ScrapedInternship,
): boolean {
  const searchableText = [
    internship.location ?? "",
    internship.eligibility ?? "",
    internship.description,
  ].join(" ");

  if (includesAny(searchableText, RESTRICTED_LOCATION_KEYWORDS)) {
    return false;
  }

  return includesAny(searchableText, ELIGIBLE_LOCATION_KEYWORDS);
}

export function isRelevantInternship(
  internship: ScrapedInternship,
): boolean {
  return (
    isInternship(internship) &&
    isTechnicalInternship(internship) &&
    isEligibleLocation(internship)
  );
}