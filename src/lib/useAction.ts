
"use client";

import { useState, useCallback } from "react";

interface ActionError extends Error {
  fields?: Record<string, string | string[]>;
}

export function useAction() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState("");
  const [fields, setFields] = useState<
    Record<string, string | string[]>
  >({});

  const run = useCallback(
    async (
      action: Promise<unknown>,
      successMessage = "Action completed successfully."
    ) => {
      if (busy) return;

      setBusy(true);
      setError("");
      setDone("");
      setFields({});

      try {
        await action;
        setDone(successMessage);
        return true;
      } catch (err) {
        const actionError = err as ActionError;

        setError(
          actionError.message || "Something went wrong. Please try again."
        );

        if (actionError.fields) {
          setFields(actionError.fields);
        }

        return false;
      } finally {
        setBusy(false);
      }
    },
    [busy]
  );

  return {
    busy,
    error,
    done,
    fields,
    run,
  };
}
