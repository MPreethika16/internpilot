import type {
  FetchPageOptions,
} from "./browser.types";

export interface BrowserService {
  fetchHtml(
    url: string,
    options?: FetchPageOptions,
  ): Promise<string>;

  close(): Promise<void>;
}