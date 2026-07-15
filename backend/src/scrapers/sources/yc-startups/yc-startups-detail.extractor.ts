import type {
  YCDetailPageProps,
  YCDetailPageData,
} from "./yc-startups.types";

import {
  parseYCPageData,
} from "./yc-page-data.parser";

const YC_DETAIL_COMPONENT =
  "jobs/public/pages/JobDetailPage";

export class YCStartupsDetailExtractor {
  public extractDetail(
    html: string,
  ): YCDetailPageProps {
    const pageData =
      parseYCPageData<YCDetailPageData>(
        html,
        YC_DETAIL_COMPONENT,
      );

    if (!pageData.props) {
      throw new Error(
        'YC detail page does not contain "props"',
      );
    }

    if (!pageData.props.job) {
      throw new Error(
        'YC detail page does not contain "props.job"',
      );
    }

    if (!pageData.props.company) {
      throw new Error(
        'YC detail page does not contain "props.company"',
      );
    }

    if (
      typeof pageData.props.applyUrl !== "string" ||
      !pageData.props.applyUrl.trim()
    ) {
      throw new Error(
        'YC detail page does not contain a valid "props.applyUrl"',
      );
    }

    return pageData.props;
  }
}