import type { ProblemDetail, ValidationProblem } from "./generated";

export class ApiError extends Error {
  readonly status: number;
  readonly problem: ProblemDetail | null;
  readonly traceId: string | null;

  constructor(status: number, problem: ProblemDetail | null, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.problem = problem;
    this.traceId = problem?.trace_id ?? null;
  }
}

export class ApiValidationError extends ApiError {
  readonly validation: ValidationProblem;

  constructor(problem: ValidationProblem) {
    super(422, problem, problem.message);
    this.name = "ApiValidationError";
    this.validation = problem;
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

export function isApiValidationError(
  error: unknown,
): error is ApiValidationError {
  return error instanceof ApiValidationError;
}

function isProblemDetail(body: unknown): body is ProblemDetail {
  return (
    typeof body === "object" &&
    body !== null &&
    "code" in body &&
    "title" in body &&
    "message" in body
  );
}

function isValidationProblem(body: unknown): body is ValidationProblem {
  return (
    isProblemDetail(body) &&
    "errors" in body &&
    Array.isArray((body as { errors: unknown }).errors)
  );
}

export function normalizeApiError(
  response: Response | undefined,
  body: unknown,
): ApiError {
  const status = response?.status ?? 0;
  if (status === 422 && isValidationProblem(body)) {
    return new ApiValidationError(body);
  }
  if (isProblemDetail(body)) {
    return new ApiError(status, body, body.message);
  }
  return new ApiError(
    status,
    null,
    status === 0 ? "Network request failed" : `Request failed with status ${status}`,
  );
}
