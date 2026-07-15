export type IngestionErrorType =
  | "VALIDATION_ERROR"
  | "DATABASE_ERROR"
  | "UNKNOWN_ERROR";

export type InternshipIngestionError = {
  sourcePlatform?: string;
  externalId?: string;
  companyName?: string;
  type: IngestionErrorType;
  message: string;
};

export type InternshipIngestionResult = {
  received: number;
  created: number;
  updated: number;
  unchanged: number;
  failed: number;
  errors: InternshipIngestionError[];
};