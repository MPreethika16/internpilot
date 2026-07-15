import type {
  YCListingJob,
  YCListingPageData,
} from "./yc-startups.types";

import {
  parseYCPageData,
} from "./yc-page-data.parser";

const YC_LISTING_COMPONENT =
  "jobs/public/pages/JobsPage";

export class YCStartupsExtractor {
  public extractJobs(
    html: string,
  ): YCListingJob[] {
    const pageData =
      parseYCPageData<YCListingPageData>(
        html,
        YC_LISTING_COMPONENT,
      );

    if (!pageData.props) {
      throw new Error(
        'YC listing page does not contain "props"',
      );
    }

    if (!Array.isArray(pageData.props.jobs)) {
      throw new Error(
        'YC listing page does not contain a valid "props.jobs" array',
      );
    }

    return pageData.props.jobs;
  }
}