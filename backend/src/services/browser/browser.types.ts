export type FetchPageOptions = {
  waitUntil?:
    | "load"
    | "domcontentloaded"
    | "networkidle";

  timeoutMs?: number;

  waitForSelector?: string;
};