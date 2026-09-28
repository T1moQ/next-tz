export interface ApiErrorResponse {
  message: string;
  fieldErrors?: Record<string, string[] | undefined>;
}
