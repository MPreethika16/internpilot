export interface GreenhouseCompanyConfig {
  companyName: string;
  boardToken: string;
  website?: string;
  industry?: string;
  headquarters?: string;
  logoUrl?: string;
  enabled?: boolean;
}

export const greenhouseCompanies: GreenhouseCompanyConfig[] = [
  {
    companyName: "Podium",
    boardToken: "podium81",
    website: "https://www.podium.com",
    headquarters: "Lehi, Utah",
    enabled: true,
  },
];