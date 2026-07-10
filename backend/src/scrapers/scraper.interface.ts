import { ScrapedInternship } from "./types";

export interface InternshipScraper {
  sourceName: string;
  scrape(): Promise<ScrapedInternship[]>;
}