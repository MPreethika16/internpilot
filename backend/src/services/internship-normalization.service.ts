import type { ScrapedInternship } from "../scrapers/types";
import {
  normalizeInlineText,
  normalizeMultilineText,
  normalizeStringArray,
} from "../utils/normalize";

export class InternshipNormalizationService {
  normalize(internship: ScrapedInternship): ScrapedInternship {
    const title = normalizeInlineText(internship.title);
    const companyName = normalizeInlineText(internship.companyName);
    const description = normalizeMultilineText(internship.description);
    const applicationUrl = normalizeInlineText(internship.applicationUrl);
    const sourcePlatform = normalizeInlineText(internship.sourcePlatform);
    const externalId = normalizeInlineText(internship.externalId);

    if (!title) {
      throw new Error("Internship title is required");
    }

    if (!companyName) {
      throw new Error("Company name is required");
    }

    if (!description) {
      throw new Error("Internship description is required");
    }

    if (!applicationUrl) {
      throw new Error("Application URL is required");
    }

    if (!sourcePlatform) {
      throw new Error("Source platform is required");
    }

    if (!externalId) {
      throw new Error("External ID is required");
    }

    return {
      ...internship,

      title,
      companyName,
      description,
      applicationUrl,
      sourcePlatform,
      externalId,

      eligibility:
        normalizeMultilineText(internship.eligibility) ?? undefined,
      stipend: normalizeInlineText(internship.stipend) ?? undefined,
      benefits: normalizeMultilineText(internship.benefits) ?? undefined,
      location: normalizeInlineText(internship.location) ?? undefined,
      sourceUrl: normalizeInlineText(internship.sourceUrl) ?? undefined,

      skills: normalizeStringArray(internship.skills),

      companyWebsite:
        normalizeInlineText(internship.companyWebsite) ?? undefined,
      companyIndustry:
        normalizeInlineText(internship.companyIndustry) ?? undefined,
      companyHeadquarters:
        normalizeInlineText(internship.companyHeadquarters) ?? undefined,
      companyLogoUrl:
        normalizeInlineText(internship.companyLogoUrl) ?? undefined,
      companyAbout:
        normalizeMultilineText(internship.companyAbout) ?? undefined,
    };
  }
}