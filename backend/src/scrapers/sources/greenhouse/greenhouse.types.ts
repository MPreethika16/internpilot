export interface GreenhouseJobsResponse {
  jobs: GreenhouseJob[];
}

export interface GreenhouseJob {
  id: number;
  title: string;
  company_name?: string;
  absolute_url: string;
  content?: string;

  location?: GreenhouseLocation;

  updated_at?: string;
  first_published?: string;
  application_deadline?: string | null;

  departments?: GreenhouseDepartment[];
  offices?: GreenhouseOffice[];
}

export interface GreenhouseLocation {
  name?: string;
}

export interface GreenhouseDepartment {
  id: number;
  name: string;
}

export interface GreenhouseOffice {
  id: number;
  name: string;
  location?: string;
}