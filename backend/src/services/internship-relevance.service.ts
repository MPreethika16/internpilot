import type { ScrapedInternship } from "../scrapers/types";

export type RelevanceEvaluation = {
  relevant: boolean;
  reasons: string[];
};

export function evaluateInternshipRelevance(
  internship: ScrapedInternship,
): RelevanceEvaluation {
  const reasons: string[] = [];

  const title = internship.title.trim().toLowerCase();
  const description = internship.description.trim().toLowerCase();
  const eligibility =
    internship.eligibility?.trim().toLowerCase() ?? "";
  const location =
    internship.location?.trim().toLowerCase() ?? "";

  const searchableRoleText = [
    title,
    description,
    eligibility,
  ].join(" ");

  const internshipKeywords = [
    "intern",
    "internship",
    "co-op",
    "coop",
    "student",
    "graduate",
  ];

  const technicalKeywords = [
    "software",
    "developer",
    "engineering",
    "engineer",
    "backend",
    "frontend",
    "full stack",
    "fullstack",
    "data",
    "machine learning",
    "artificial intelligence",
    "cloud",
    "devops",
    "security",
    "technology",
    "technical",
    "product",
    "qa",
    "quality assurance",
  ];

  const hasInternshipKeyword = internshipKeywords.some(
    (keyword) => searchableRoleText.includes(keyword),
  );

  if (!hasInternshipKeyword) {
    reasons.push("No internship keyword found");
  }

  const hasTechnicalKeyword = technicalKeywords.some(
    (keyword) => searchableRoleText.includes(keyword),
  );

  if (!hasTechnicalKeyword) {
    reasons.push("No technical-role keyword found");
  }

  const indiaLocationKeywords = [
    "india",
    "hyderabad",
    "telangana",
    "bengaluru",
    "bangalore",
    "karnataka",
    "pune",
    "maharashtra",
    "chennai",
    "tamil nadu",
    "gurugram",
    "gurgaon",
    "noida",
    "delhi",
    "mumbai",
  ];

  const isIndiaLocation = indiaLocationKeywords.some(
    (keyword) => location.includes(keyword),
  );

  const isIndiaRemote =
    location.includes("remote") &&
    location.includes("india");

  const hasEligibleLocation =
    isIndiaLocation || isIndiaRemote;

  if (!hasEligibleLocation) {
    reasons.push(
      `Location is not India-eligible: ${
        internship.location ?? "missing"
      }`,
    );
  }

  return {
    relevant:
      hasInternshipKeyword &&
      hasTechnicalKeyword &&
      hasEligibleLocation,
    reasons,
  };
}

export function isRelevantInternship(
  internship: ScrapedInternship,
): boolean {
  return evaluateInternshipRelevance(internship).relevant;
}