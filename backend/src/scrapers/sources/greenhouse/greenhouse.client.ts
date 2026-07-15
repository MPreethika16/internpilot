import axios from "axios";

import type {
  GreenhouseJob,
  GreenhouseJobsResponse,
} from "./greenhouse.types";

export class GreenhouseClient {
  private readonly baseUrl =
    "https://boards-api.greenhouse.io/v1/boards";

  public async fetchJobs(
    boardToken: string,
  ): Promise<GreenhouseJob[]> {
    const url = `${this.baseUrl}/${encodeURIComponent(
      boardToken,
    )}/jobs`;

    const response =
      await axios.get<GreenhouseJobsResponse>(url, {
        params: {
          content: true,
        },
        timeout: 15_000,
      });

    if (!response.data || !Array.isArray(response.data.jobs)) {
      throw new Error(
        "Greenhouse returned an unexpected response shape",
      );
    }

    return response.data.jobs;
  }
}