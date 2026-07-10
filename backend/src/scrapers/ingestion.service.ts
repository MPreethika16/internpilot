import { Company } from "@prisma/client";
import prisma from "../config/prisma";
import { ScrapedInternship } from "./types";

export class IngestionService {
  async ingest(internships: ScrapedInternship[]): Promise<void> {
    console.log(`Received ${internships.length} internships`);

    for (const internship of internships) {
      const company = await this.findOrCreateCompany(
        internship.companyName,
        internship.companyWebsite
      );

      console.log(
        `Processing "${internship.title}" for company ${company.name}`
      );
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
}