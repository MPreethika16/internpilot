import * as cheerio from "cheerio";

export function htmlToText(html: string): string {
  if (!html.trim()) {
    return "";
  }

  const $ = cheerio.load(html);

  $("script, style, noscript").remove();

  $("br").replaceWith("\n");

  $("p, h1, h2, h3, h4, h5, h6, blockquote").each(
    (_index, element) => {
      $(element).prepend("\n");
      $(element).append("\n");
    },
  );

  $("li").each((_index, element) => {
    $(element).prepend("\n- ");
    $(element).append("\n");
  });

  $("strong, em, span, a").each((_index, element) => {
    $(element).prepend(" ");
    $(element).append(" ");
  });

  return $.root()
    .text()
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/ *\n */g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}