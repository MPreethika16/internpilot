import * as cheerio from "cheerio";

export function parseYCPageData<T>(
  html: string,
  expectedComponent: string,
): T {
  if (!html.trim()) {
    throw new Error(
      "Cannot parse YC page data from empty HTML",
    );
  }

  const $ = cheerio.load(html);

  const encodedPageData = $("[data-page]")
    .first()
    .attr("data-page");

  if (!encodedPageData) {
    throw new Error(
      'YC page does not contain a "data-page" attribute',
    );
  }

  let pageData: unknown;

  try {
    pageData = JSON.parse(encodedPageData);
  } catch {
    throw new Error(
      'YC page contains invalid JSON in its "data-page" attribute',
    );
  }

  if (
    typeof pageData !== "object" ||
    pageData === null
  ) {
    throw new Error(
      "YC page data must be an object",
    );
  }

  const component = Reflect.get(
    pageData,
    "component",
  );

  if (component !== expectedComponent) {
    throw new Error(
      `Unexpected YC page component. Expected "${expectedComponent}", received "${String(component)}"`,
    );
  }

  return pageData as T;
}