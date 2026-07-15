import type {
  Company,
  Internship,
} from "@prisma/client";

import prisma from "../config/prisma";
import type { ScrapedInternship } from "../scrapers/types";

export type IngestionErrorType =
  | "VALIDATION_ERROR"
  | "DATABASE_ERROR"
  | "UNKNOWN_ERROR";

export type IngestionError = {
  sourcePlatform?: string;
  externalId?: string;
  companyName?: string;
  type: IngestionErrorType;
  message: string;
};

export type IngestionResult = {
  received: number;
  created: number;
  updated: number;
  unchanged: number;
  failed: number;
  errors: IngestionError[];
};

export class IngestionService {
  public async ingest(
    internships: ScrapedInternship[],
  ): Promise<IngestionResult> {
    const result: IngestionResult = {
      received: internships.length,
      created: 0,
      updated: 0,
      unchanged: 0,
      failed: 0,
      errors: [],
    };

    console.log(
      `[IngestionService] Received ${internships.length} internships`,
    );

    for (const scrapedInternship of internships) {
      try {
        this.validateInternship(scrapedInternship);

        const normalizedInternship =
          this.normalizeInternship(scrapedInternship);

        const existingInternship =
          await this.findExistingInternship(
            normalizedInternship.sourcePlatform,
            normalizedInternship.externalId,
          );

        const company = await this.upsertCompany(
          normalizedInternship,
        );

        let savedInternship: Internship;

        if (!existingInternship) {
          savedInternship = await this.createInternship(
            normalizedInternship,
            company.id,
          );

          result.created += 1;
        } else if (
          this.hasMeaningfulChanges(
            existingInternship,
            normalizedInternship,
            company.id,
          )
        ) {
          savedInternship = await this.updateInternship(
            existingInternship.id,
            normalizedInternship,
            company.id,
          );

          result.updated += 1;
        } else {
          /*
           * Even when business fields are unchanged, we update
           * lastScrapedAt so the system knows the posting was
           * still visible during the latest scraping cycle.
           *
           * updatedAt may also change because this is a database
           * update. If preserving updatedAt strictly is important,
           * lastScrapedAt should be maintained separately through
           * a direct SQL update or a different persistence policy.
           */
          savedInternship =
            await this.markInternshipAsScraped(
              existingInternship.id,
            );

          result.unchanged += 1;
        }

        await this.processSkills(
          savedInternship.id,
          normalizedInternship.skills,
        );

        console.log(
          `[IngestionService] Saved "${savedInternship.title}" for ${company.name}`,
        );
      } catch (error) {
        const normalizedError = this.createIngestionError(
          scrapedInternship,
          error,
        );

        result.failed += 1;
        result.errors.push(normalizedError);

        console.error(
          `[IngestionService] Failed ${scrapedInternship.sourcePlatform ?? "UNKNOWN"}:${scrapedInternship.externalId ?? "UNKNOWN"} - ${normalizedError.message}`,
        );
      }
    }

    console.log("[IngestionService] Completed", {
      received: result.received,
      created: result.created,
      updated: result.updated,
      unchanged: result.unchanged,
      failed: result.failed,
    });

    return result;
  }

  private validateInternship(
    internship: ScrapedInternship,
  ): void {
    if (!internship.sourcePlatform?.trim()) {
      throw new IngestionValidationError(
        "sourcePlatform is required",
      );
    }

    if (!internship.externalId?.trim()) {
      throw new IngestionValidationError(
        "externalId is required",
      );
    }

    if (!internship.title?.trim()) {
      throw new IngestionValidationError(
        "title is required",
      );
    }

    if (!internship.companyName?.trim()) {
      throw new IngestionValidationError(
        "companyName is required",
      );
    }

    if (!internship.description?.trim()) {
      throw new IngestionValidationError(
        "description is required",
      );
    }

    if (!internship.applicationUrl?.trim()) {
      throw new IngestionValidationError(
        "applicationUrl is required",
      );
    }
  }

  private normalizeInternship(
    internship: ScrapedInternship,
  ): ScrapedInternship & {
    externalId: string;
  } {
    return {
      ...internship,

      title: this.normalizeRequiredInlineText(
        internship.title,
      ),

      companyName: this.normalizeRequiredInlineText(
        internship.companyName,
      ),

      description: this.normalizeRequiredMultilineText(
        internship.description,
      ),

      sourcePlatform:
        this.normalizeRequiredInlineText(
          internship.sourcePlatform,
        ).toUpperCase(),

      externalId: this.normalizeRequiredInlineText(
        internship.externalId!,
      ),

      applicationUrl:
        this.normalizeRequiredInlineText(
          internship.applicationUrl,
        ),

      eligibility: this.normalizeOptionalMultilineText(
        internship.eligibility,
      ),

      stipend: this.normalizeOptionalInlineText(
        internship.stipend,
      ),

      benefits: this.normalizeOptionalMultilineText(
        internship.benefits,
      ),

      location: this.normalizeOptionalInlineText(
        internship.location,
      ),

      sourceUrl: this.normalizeOptionalInlineText(
        internship.sourceUrl,
      ),

      skills: this.normalizeSkills(internship.skills),

      companyWebsite: this.normalizeOptionalInlineText(
        internship.companyWebsite,
      ),

      companyIndustry: this.normalizeOptionalInlineText(
        internship.companyIndustry,
      ),

      companyHeadquarters:
        this.normalizeOptionalInlineText(
          internship.companyHeadquarters,
        ),

      companyLogoUrl: this.normalizeOptionalInlineText(
        internship.companyLogoUrl,
      ),

      companyAbout: this.normalizeOptionalMultilineText(
        internship.companyAbout,
      ),
    };
  }

  private async findExistingInternship(
    sourcePlatform: string,
    externalId: string,
  ): Promise<Internship | null> {
    return prisma.internship.findUnique({
      where: {
        sourcePlatform_externalId: {
          sourcePlatform,
          externalId,
        },
      },
    });
  }

  private async upsertCompany(
    scraped: ScrapedInternship,
  ): Promise<Company> {
    return prisma.company.upsert({
      where: {
        name: scraped.companyName,
      },

      update: {
        website: scraped.companyWebsite,
        industry: scraped.companyIndustry,
        headquarters: scraped.companyHeadquarters,
        logoUrl: scraped.companyLogoUrl,
        about: scraped.companyAbout,
      },

      create: {
        name: scraped.companyName,
        website: scraped.companyWebsite,
        industry: scraped.companyIndustry,
        headquarters: scraped.companyHeadquarters,
        logoUrl: scraped.companyLogoUrl,
        about: scraped.companyAbout,
      },
    });
  }

  private async createInternship(
    scraped: ScrapedInternship & {
      externalId: string;
    },
    companyId: string,
  ): Promise<Internship> {
    return prisma.internship.create({
      data: {
        companyId,

        title: scraped.title,
        description: scraped.description,

        eligibility: scraped.eligibility,
        stipend: scraped.stipend,
        benefits: scraped.benefits,

        location: scraped.location,

        applicationUrl: scraped.applicationUrl,
        applicationDeadline:
          scraped.applicationDeadline,

        sourcePlatform: scraped.sourcePlatform,
        sourceUrl: scraped.sourceUrl,
        externalId: scraped.externalId,

        status: "ACTIVE",
        lastScrapedAt: new Date(),
      },
    });
  }

  private async updateInternship(
    internshipId: string,
    scraped: ScrapedInternship & {
      externalId: string;
    },
    companyId: string,
  ): Promise<Internship> {
    return prisma.internship.update({
      where: {
        id: internshipId,
      },

      data: {
        companyId,

        title: scraped.title,
        description: scraped.description,

        eligibility: scraped.eligibility,
        stipend: scraped.stipend,
        benefits: scraped.benefits,

        location: scraped.location,

        applicationUrl: scraped.applicationUrl,
        applicationDeadline:
          scraped.applicationDeadline,

        sourceUrl: scraped.sourceUrl,

        status: "ACTIVE",
        lastScrapedAt: new Date(),
      },
    });
  }

  private async markInternshipAsScraped(
    internshipId: string,
  ): Promise<Internship> {
    return prisma.internship.update({
      where: {
        id: internshipId,
      },

      data: {
        status: "ACTIVE",
        lastScrapedAt: new Date(),
      },
    });
  }

  private hasMeaningfulChanges(
    existing: Internship,
    incoming: ScrapedInternship,
    companyId: string,
  ): boolean {
    return (
      existing.companyId !== companyId ||
      this.normalizeRequiredInlineText(existing.title) !==
        this.normalizeRequiredInlineText(incoming.title) ||
      this.normalizeRequiredMultilineText(
        existing.description,
      ) !==
        this.normalizeRequiredMultilineText(
          incoming.description,
        ) ||
      this.normalizeOptionalMultilineText(
        existing.eligibility,
      ) !==
        this.normalizeOptionalMultilineText(
          incoming.eligibility,
        ) ||
      this.normalizeOptionalInlineText(existing.stipend) !==
        this.normalizeOptionalInlineText(
          incoming.stipend,
        ) ||
      this.normalizeOptionalMultilineText(
        existing.benefits,
      ) !==
        this.normalizeOptionalMultilineText(
          incoming.benefits,
        ) ||
      this.normalizeOptionalInlineText(existing.location) !==
        this.normalizeOptionalInlineText(
          incoming.location,
        ) ||
      this.normalizeRequiredInlineText(
        existing.applicationUrl,
      ) !==
        this.normalizeRequiredInlineText(
          incoming.applicationUrl,
        ) ||
      this.normalizeOptionalInlineText(
        existing.sourceUrl,
      ) !==
        this.normalizeOptionalInlineText(
          incoming.sourceUrl,
        ) ||
      !this.areDatesEqual(
        existing.applicationDeadline,
        incoming.applicationDeadline,
      ) ||
      existing.status !== "ACTIVE"
    );
  }

  private async processSkills(
    internshipId: string,
    skillNames: string[] = [],
  ): Promise<void> {
    for (const skillName of skillNames) {
      const skill = await prisma.skill.upsert({
        where: {
          name: skillName,
        },

        update: {},

        create: {
          name: skillName,
        },
      });

      await prisma.internshipSkill.upsert({
        where: {
          internshipId_skillId: {
            internshipId,
            skillId: skill.id,
          },
        },

        update: {},

        create: {
          internshipId,
          skillId: skill.id,
        },
      });
    }
  }

  private normalizeSkills(
    skills: string[] | undefined,
  ): string[] {
    if (!skills) {
      return [];
    }

    const normalizedSkills = skills
      .map((skill) =>
        this.normalizeOptionalInlineText(skill),
      )
      .filter(
        (skill): skill is string => skill !== undefined,
      );

    return Array.from(
      new Set(normalizedSkills),
    ).sort((first, second) =>
      first.localeCompare(second),
    );
  }

  private normalizeRequiredInlineText(
    value: string,
  ): string {
    return value.trim().replace(/\s+/g, " ");
  }

  private normalizeOptionalInlineText(
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

  private normalizeRequiredMultilineText(
    value: string,
  ): string {
    return this.normalizeMultilineText(value) ?? "";
  }

  private normalizeOptionalMultilineText(
    value: string | null | undefined,
  ): string | undefined {
    return this.normalizeMultilineText(value);
  }

  private normalizeMultilineText(
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

  private areDatesEqual(
    first: Date | null | undefined,
    second: Date | null | undefined,
  ): boolean {
    if (!first && !second) {
      return true;
    }

    if (!first || !second) {
      return false;
    }

    return first.getTime() === second.getTime();
  }

  private createIngestionError(
    internship: ScrapedInternship,
    error: unknown,
  ): IngestionError {
    const message =
      error instanceof Error
        ? error.message
        : "Unknown ingestion error";

    let type: IngestionErrorType = "UNKNOWN_ERROR";

    if (error instanceof IngestionValidationError) {
      type = "VALIDATION_ERROR";
    } else if (error instanceof Error) {
      type = "DATABASE_ERROR";
    }

    return {
      sourcePlatform: internship.sourcePlatform,
      externalId: internship.externalId,
      companyName: internship.companyName,
      type,
      message,
    };
  }
}

class IngestionValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "IngestionValidationError";
  }
}