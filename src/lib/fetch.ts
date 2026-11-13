
export async function postJson<T = unknown>(
  url: string,
  data: Record<string, unknown>
): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    credentials: "same-origin",
    body: JSON.stringify(data),
  });

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    const apiError = result?.error;

    const message =
      typeof apiError === "string"
        ? apiError
        : apiError?.message ||
          result?.message ||
          "Request failed. Please try again.";

    const error = new Error(message) as Error & {
      fields?: Record<string, string | string[]>;
    };

    if (apiError && typeof apiError === "object") {
      error.fields = apiError;
    }

    throw error;
  }

  return result as T;
}
