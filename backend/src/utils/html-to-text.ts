import * as cheerio from "cheerio";

export function htmlToPlainText(value?: string): string {
  if (!value) {
    return "";
  }

  /*
   * Greenhouse may return entity-encoded HTML:
   * &lt;p&gt;Hello&lt;/p&gt;
   *
   * First parsing pass decodes the entities into HTML.
   */
  const decodedHtml = cheerio.load(value).text();

  /*
   * Second parsing pass removes the resulting HTML tags.
   */
  const plainText = cheerio.load(decodedHtml).text();

  return plainText
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}