export type ScrapedInternship = {
  title: string;
  companyName: string;
  description: string;

  eligibility?: string;
  stipend?: string;
  benefits?: string;
  skills?: string[];

  location?: string;
  applicationUrl: string;

  sourceUrl?: string;
  sourcePlatform: string;
  externalId: string;

  applicationDeadline?: Date;

  companyWebsite?: string;
  companyIndustry?: string;
  companyHeadquarters?: string;
  companyLogoUrl?: string;
  companyAbout?: string;
};