export type YCListingJob = {
  id: number;
  title: string;
  jobType: string;
  location: string;
  roleType: string;
  salary: string | null;

  companyName: string;
  companySlug: string;
  companyBatch: string;
  companyOneLiner: string;
  companyLogoUrl: string;
  companyLastActiveAt: string | null;

  applyUrl: string;
};

export type YCListingPageProps = {
  jobs: YCListingJob[];
};

export type YCListingPageData = {
  component: string;
  props: YCListingPageProps;
  url: string;
  version?: string;
};

export type YCDetailJob = {
  id: number;
  title: string;

  salaryRange: string | null;
  equityRange: string | null;

  location: string;
  jobType: string;

  sponsorsVisa: string | null;
  minExperience: string | null;

  skills: string[];

  descriptionHtml: string;
  interviewProcessHtml: string | null;
};

export type YCCompanyFounder = {
  name: string;
  avatarUrl: string | null;
  bio: string | null;
  pastCompanies: string[] | null;
  linkedin: string | null;
};

export type YCCompany = {
  name: string;
  slug: string;
  batch: string;

  description: string;
  hiringDescriptionHtml: string | null;
  techDescriptionHtml: string | null;

  logoUrl: string | null;
  url: string | null;
  location: string | null;

  teamSize: number | null;
  industry: string | null;

  founders: YCCompanyFounder[];
};

export type YCJobSummary = {
  id: number;
  title: string;
  location: string;
  jobType: string;

  salaryRange: string | null;
  equityRange: string | null;

  sponsorsVisa?: string | null;
  minExperience: string | null;
};

export type YCDetailPageProps = {
  job: YCDetailJob;
  company: YCCompany;

  otherJobs: YCJobSummary[];

  applyUrl: string;
  signupUrl: string;

  customQuestions: unknown[];
};

export type YCDetailPageData = {
  component: string;
  props: YCDetailPageProps;
  url: string;
  version?: string;
};