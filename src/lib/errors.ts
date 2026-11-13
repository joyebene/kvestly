export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
    public code = "error",
    public fields?: Record<string, string>,
    public headers?: Record<string, string>,
  ) {
    super(message);
  }
}
