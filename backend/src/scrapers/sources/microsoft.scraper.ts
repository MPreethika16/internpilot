import axios from "axios";
import { InternshipScraper } from "../scraper.interface";
import { ScrapedInternship } from "../types";

type MicrosoftPosition = {
  id: number;
  displayJobId?: string;
  name: string;
  locations?: string[];
  workSiteFlexibility?: string;
};

export class MicrosoftScraper implements InternshipScraper {
  sourceName = "Microsoft Careers";

  async scrape(): Promise<ScrapedInternship[]> {
    const url =
      "https://apply.careers.microsoft.com/api/pcsx/search?domain=microsoft.com&query=intern&start=0&sort_by=relevance&filter_include_remote=1";

    const response = await axios.get(url);

    const positions: MicrosoftPosition[] = response.data?.data?.positions ?? [];

    return positions.map((position) => ({
      title: position.name,
      companyName: "Microsoft",
      description: position.name,
      location: position.locations?.join(", "),
      applicationUrl: `https://jobs.careers.microsoft.com/global/en/job/${position.displayJobId}`,
      sourceUrl: url,
      sourcePlatform: "MICROSOFT",
      externalId: position.displayJobId ?? String(position.id),
    }));
  }
}