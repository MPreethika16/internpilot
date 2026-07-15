import axios, { AxiosError } from "axios";
import * as cheerio from "cheerio";

import { InternshipScraper } from "../../scraper.interface";
import { ScrapedInternship } from "../../types";
/**
 * Summary information returned by Microsoft's search endpoint.
 */
type MicrosoftPosition = {
  id: number;
  displayJobId?: string;
  name: string;
  locations?: string[];
};

/**
 * Response returned by Microsoft's search endpoint.
 */
type MicrosoftSearchResponse = {
  status: number;
  error?: {
    message?: string;
    body?: string;
  };
  data?: {
    positions?: MicrosoftPosition[];
    count?: number;
  };
};

/**
 * One Microsoft company perk.
 */
type MicrosoftPerk = {
  title: string;
  description: string;
};

/**
 * Detailed information returned by position_details.
 */
type MicrosoftPositionDetails = {
  id: number;
  displayJobId?: string;
  name: string;

  locations?: string[];
  location?: string;

  jobDescription?: string;

  publicUrl?: string;
  positionUrl?: string;

  workLocationOption?: string;
  locationFlexibility?: string | null;

  efcustomTextWorkSite?: string[];
  efcustomTextRequiredTravel?: string[];
  efcustomTextCurrentProfession?: string[];
  efcustomTextTaDisciplineName?: string[];
  efcustomTextRoletype?: string[];
  efcustomTextEmploymentType?: string[];

  positionExtraDetails?: {
    perks?: MicrosoftPerk[];
  };
};

/**
 * Response returned by position_details.
 */
type MicrosoftDetailsResponse = {
  status: number;
  error?: {
    message?: string;
    body?: string;
  };
  data?: MicrosoftPositionDetails;
};

/**
 * Skill information returned by match_details.
 */
type MicrosoftMatchDetails = {
  matchDetails?: unknown[];
  matchSkills?: string[];
  stars?: number;
};

/**
 * Response returned by match_details.
 */
type MicrosoftMatchResponse = {
  status: number;
  error?: {
    message?: string;
    body?: string;
  };
  data?: MicrosoftMatchDetails;
};

export class MicrosoftScraper implements InternshipScraper {
  sourceName = "Microsoft Careers";

  private readonly baseApiUrl =
    "https://apply.careers.microsoft.com/api/pcsx";

  /**
   * Delay between external requests.
   *
   * This keeps the scraper conservative and reduces the possibility
   * of Microsoft returning HTTP 429.
   */
  private readonly requestDelayMs = 2_000;

  /**
   * Number of times a temporary request failure can be retried.
   */
  private readonly maxRetryAttempts = 3;

  /**
   * Public entry point used by the controller, scheduler,
   * or future AI agent.
   */
  async scrape(): Promise<ScrapedInternship[]> {
    const positions = await this.fetchPositions();

    console.log(
      `Microsoft search returned ${positions.length} positions`
    );

    const internships: ScrapedInternship[] = [];

    /**
     * Process one position at a time.
     *
     * This is intentionally sequential because Microsoft's internal
     * API started rate-limiting concurrent requests.
     */
    for (const position of positions) {
      try {
        await this.sleep(this.requestDelayMs);

        const details = await this.fetchPositionDetails(position.id);

        /**
         * Wait before calling the next endpoint for the same job.
         */
        await this.sleep(this.requestDelayMs);

        /**
         * Skills are useful, but they are not required for saving
         * the internship. If match_details fails, the job can still
         * be stored using an empty skills array.
         */
        const matchDetails =
          await this.fetchMatchDetailsSafely(position.id);

        const internship = this.mapToScrapedInternship(
          position,
          details,
          matchDetails
        );

        internships.push(internship);

        console.log(
          `Scraped Microsoft job: ${internship.title}`
        );
      } catch (error) {
        console.error(
          `Failed to process Microsoft position ${position.id}:`,
          this.getErrorMessage(error)
        );
      }
    }

    console.log(
      `Successfully scraped ${internships.length} of ` +
        `${positions.length} Microsoft positions`
    );

    return internships;
  }

  /**
   * Finds the currently available internships.
   *
   * This endpoint provides summary information and internal
   * position IDs.
   */
  private async fetchPositions(): Promise<MicrosoftPosition[]> {
    const response =
      await this.getWithRetry<MicrosoftSearchResponse>(
        `${this.baseApiUrl}/search`,
        {
          domain: "microsoft.com",
          query: "intern",
          start: 0,
          sort_by: "relevance",
          filter_include_remote: 1,
        }
      );

    if (response.status !== 200) {
      throw new Error(
        `Microsoft search API returned status ${response.status}`
      );
    }

    return response.data?.positions ?? [];
  }

  /**
   * Gets the complete description, qualifications, location,
   * benefits, and direct job link for one Microsoft position.
   */
  private async fetchPositionDetails(
    positionId: number
  ): Promise<MicrosoftPositionDetails> {
    const response =
      await this.getWithRetry<MicrosoftDetailsResponse>(
        `${this.baseApiUrl}/position_details`,
        {
          position_id: positionId,
          domain: "microsoft.com",
        }
      );

    if (!response.data) {
      throw new Error(
        `Microsoft returned no details for position ${positionId}`
      );
    }

    return response.data;
  }

  /**
   * Attempts to fetch structured Microsoft skills.
   *
   * This method does not fail the entire job when the optional
   * skills endpoint is unavailable or rate-limited.
   */
  private async fetchMatchDetailsSafely(
    positionId: number
  ): Promise<MicrosoftMatchDetails> {
    try {
      const response =
        await this.getWithRetry<MicrosoftMatchResponse>(
          `${this.baseApiUrl}/match_details`,
          {
            position_id: positionId,
            domain: "microsoft.com",
          },
          2
        );

      return response.data ?? {};
    } catch (error) {
      console.warn(
        `Could not fetch skills for Microsoft position ` +
          `${positionId}: ${this.getErrorMessage(error)}`
      );

      return {};
    }
  }

  /**
   * Reusable HTTP request method with:
   *
   * - timeouts
   * - HTTP 429 handling
   * - Retry-After support
   * - exponential backoff
   * - random jitter
   */
  private async getWithRetry<T>(
    url: string,
    params: Record<string, string | number>,
    maxAttempts = this.maxRetryAttempts
  ): Promise<T> {
    let lastError: unknown;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const response = await axios.get<T>(url, {
          params,
          timeout: 20_000,
          headers: {
            Accept: "application/json",

            /**
             * This identifies our client as a normal HTTP client.
             * Do not use headers to bypass anti-bot controls.
             */
            "User-Agent":
              "InternPilot/1.0 internship-data-collector",
          },
        });

        return response.data;
      } catch (error) {
        lastError = error;

        if (!axios.isAxiosError(error)) {
          throw error;
        }

        const status = error.response?.status;

        /**
         * Retry only temporary conditions:
         *
         * 429: Too Many Requests
         * 500+: Temporary upstream server errors
         */
        const shouldRetry =
          status === 429 ||
          (typeof status === "number" && status >= 500);

        if (!shouldRetry || attempt === maxAttempts) {
          throw error;
        }

        const delay = this.calculateRetryDelay(error, attempt);

        console.warn(
          `Microsoft request returned ${status}. ` +
            `Retrying in ${delay}ms ` +
            `(attempt ${attempt}/${maxAttempts})`
        );

        await this.sleep(delay);
      }
    }

    throw lastError instanceof Error
      ? lastError
      : new Error("Microsoft request failed after retries");
  }

  /**
   * Calculates how long to wait before retrying.
   *
   * Retry-After is preferred when Microsoft provides it.
   * Otherwise, exponential backoff is used.
   */
  private calculateRetryDelay(
    error: AxiosError,
    attempt: number
  ): number {
    const retryAfterHeader =
      error.response?.headers?.["retry-after"];

    if (typeof retryAfterHeader === "string") {
      const retryAfterSeconds = Number(retryAfterHeader);

      if (
        Number.isFinite(retryAfterSeconds) &&
        retryAfterSeconds > 0
      ) {
        return retryAfterSeconds * 1_000;
      }

      /**
       * Retry-After can also be an HTTP date.
       */
      const retryDate = Date.parse(retryAfterHeader);

      if (!Number.isNaN(retryDate)) {
        return Math.max(retryDate - Date.now(), 1_000);
      }
    }

    /**
     * Exponential delay:
     *
     * Attempt 1 → about 2 seconds
     * Attempt 2 → about 4 seconds
     * Attempt 3 → about 8 seconds
     *
     * Random jitter prevents every request from retrying at
     * exactly the same moment.
     */
    const exponentialDelay = 2_000 * 2 ** (attempt - 1);
    const jitter = Math.floor(Math.random() * 1_000);

    return exponentialDelay + jitter;
  }

  /**
   * Converts Microsoft-specific API fields into InternPilot's
   * common ScrapedInternship format.
   */
  private mapToScrapedInternship(
    position: MicrosoftPosition,
    details: MicrosoftPositionDetails,
    matchDetails: MicrosoftMatchDetails
  ): ScrapedInternship {
    const directJobUrl =
      details.publicUrl ??
      `https://apply.careers.microsoft.com/careers/job/${position.id}`;

    console.log(matchDetails.matchSkills);

    return {
      title: details.name || position.name,

      companyName: "Microsoft",

      description: this.htmlToText(
        details.jobDescription ?? ""
      ),

      location:
        details.location ??
        details.locations?.join(", ") ??
        position.locations?.join(", "),

      benefits: this.mapBenefits(
        details.positionExtraDetails?.perks
      ),

      skills: this.normalizeSkills(
        matchDetails.matchSkills ?? []
      ),

      applicationUrl: directJobUrl,

      sourceUrl: directJobUrl,

      sourcePlatform: "MICROSOFT",

      externalId:
        details.displayJobId ??
        position.displayJobId ??
        String(position.id),

      companyWebsite: "https://www.microsoft.com",

      companyIndustry: "Technology",

      companyAbout:
        "Microsoft is a global technology company that " +
        "develops software, cloud services, devices, and " +
        "artificial intelligence products.",
    };
  }

  /**
   * Converts Microsoft's HTML job description to plain text.
   */
  private htmlToText(html: string): string {
    if (!html) {
      return "";
    }

    const $ = cheerio.load(html);

    return $.text()
      .replace(/\u00a0/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  /**
   * Combines Microsoft's individual perks into one string because
   * the current Internship model stores benefits as String?.
   */
  private mapBenefits(
    perks: MicrosoftPerk[] = []
  ): string | undefined {
    if (perks.length === 0) {
      return undefined;
    }

    return perks
      .map((perk) => {
        const title = perk.title.trim();
        const description = perk.description.trim();

        return `${title}: ${description}`;
      })
      .join("\n");
  }

  /**
   * Removes empty and duplicate skill names.
   *
   * Skill matching is case-insensitive here, so values such as
   * "C++" and "c++" do not appear twice for one job.
   */
  private normalizeSkills(skills: string[]): string[] {
    const uniqueSkills = new Map<string, string>();

    for (const rawSkill of skills) {
      const skill = rawSkill.trim();

      if (!skill) {
        continue;
      }

      const normalizedKey = skill.toLowerCase();

      if (!uniqueSkills.has(normalizedKey)) {
        uniqueSkills.set(normalizedKey, skill);
      }
    }

    return [...uniqueSkills.values()];
  }

  /**
   * Pauses execution without blocking the Node.js event loop.
   */
  private sleep(milliseconds: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve, milliseconds);
    });
  }

  /**
   * Creates a readable log message from unknown errors.
   */
  private getErrorMessage(error: unknown): string {
    if (axios.isAxiosError(error)) {
      const responseMessage =
        error.response?.data?.error?.message;

      if (
        typeof responseMessage === "string" &&
        responseMessage
      ) {
        return responseMessage;
      }

      if (error.response?.status) {
        return (
          `HTTP ${error.response.status}: ${error.message}`
        );
      }

      return error.message;
    }

    if (error instanceof Error) {
      return error.message;
    }

    return "Unknown Microsoft scraper error";
  }
}