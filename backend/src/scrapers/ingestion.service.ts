import { Company, Internship } from "@prisma/client";
import prisma from "../config/prisma";
import { ScrapedInternship } from "./types";

export class IngestionService {
      async ingest(internships: ScrapedInternship[]): Promise<void> {
  console.log(`Received ${internships.length} internships`);

  for (const scraped of internships) {
    const company = await this.findOrCreateCompany(
      scraped.companyName,
      scraped.companyWebsite
    );

    const internship = await this.upsertInternship(
      scraped,
      company.id
    );

    await this.processSkills(
      internship.id,
      scraped.skills
    );

    console.log(`Saved "${internship.title}" for ${company.name}`);
  }
}

  private async processSkills(
  internshipId: string,
  skillNames: string[] = []
): Promise<void> {
  for (const rawSkillName of skillNames) {
    const skillName = rawSkillName.trim();

    if (!skillName) {
      continue;
    }

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
  
  private async findOrCreateCompany(
    companyName: string,
    website?: string
  ): Promise<Company> {
    const existingCompany = await prisma.company.findUnique({
      where: {
        name: companyName,
      },
    });

    if (existingCompany) {
      return existingCompany;
    }

    return prisma.company.create({
      data: {
        name: companyName,
        website,
      },
    });
  }

  private async upsertInternship(
    scraped: ScrapedInternship,
    companyId: string
  ): Promise<Internship> {
    if (!scraped.externalId) {
      throw new Error(
        `Cannot ingest "${scraped.title}" because externalId is missing`
      );
    }

    return prisma.internship.upsert({
      where: {
        sourcePlatform_externalId: {
          sourcePlatform: scraped.sourcePlatform,
          externalId: scraped.externalId,
        },
      },
      update: {
        title: scraped.title,
        description: scraped.description,
        eligibility: scraped.eligibility,
        stipend: scraped.stipend,
        benefits: scraped.benefits,
        location: scraped.location,
        applicationUrl: scraped.applicationUrl,
        sourceUrl: scraped.sourceUrl,
        applicationDeadline: scraped.applicationDeadline,
        status: "ACTIVE",
        lastScrapedAt: new Date(),
        companyId,
      },
      create: {
        companyId,
        title: scraped.title,
        description: scraped.description,
        eligibility: scraped.eligibility,
        stipend: scraped.stipend,
        benefits: scraped.benefits,
        location: scraped.location,
        applicationUrl: scraped.applicationUrl,
        sourceUrl: scraped.sourceUrl,
        sourcePlatform: scraped.sourcePlatform,
        externalId: scraped.externalId,
        applicationDeadline: scraped.applicationDeadline,
        status: "ACTIVE",
        lastScrapedAt: new Date(),
      },
    });
  }
}