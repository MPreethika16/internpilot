export type YCStartupsConfig = {
  jobsUrl: string;
  jobDetailBaseUrl: string;
  timeoutMs: number;
  waitForSelector?: string;
};

export const ycStartupsConfig: YCStartupsConfig = {
  jobsUrl: "https://www.workatastartup.com/jobs",

  jobDetailBaseUrl:
    "https://www.workatastartup.com/jobs",

  timeoutMs: 30_000,

  waitForSelector: undefined,
};