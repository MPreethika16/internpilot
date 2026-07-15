import type { ScrapedInternship } from "../../types";
import type { GreenhouseCompanyConfig } from "./greenhouse.config";
import type { GreenhouseJob } from "./greenhouse.types";
import {  htmlToText } from "../../../utils/html-to-text";

export function mapGreenhouseJob(
  job: GreenhouseJob,
  config: GreenhouseCompanyConfig,
): ScrapedInternship {
  if (!job.id) {
    throw new Error("Greenhouse job is missing an id");
  }

  if (!job.title?.trim()) {
    throw new Error(`Greenhouse job ${job.id} is missing a title`);
  }

  if (!job.absolute_url?.trim()) {
    throw new Error(
      `Greenhouse job ${job.id} is missing an application URL`,
    );
  }

  if (!config.companyName.trim()) {
    throw new Error(
      `Greenhouse configuration for ${config.boardToken} is missing a company name`,
    );
  }

  const applicationDeadline = job.application_deadline
    ? new Date(job.application_deadline)
    : undefined;

  return {
    title: job.title.trim(),
    companyName: config.companyName,
    description:  htmlToText(job.content),

    eligibility: undefined,
    stipend: undefined,
    benefits: undefined,
    skills: [],

    location: job.location?.name?.trim() || undefined,
    applicationUrl: job.absolute_url,
    sourceUrl: job.absolute_url,
    sourcePlatform: "GREENHOUSE",
    externalId: String(job.id),

    applicationDeadline,

    companyWebsite: config.website,
    companyIndustry: config.industry,
    companyHeadquarters: config.headquarters,
    companyLogoUrl: config.logoUrl,
  };
}