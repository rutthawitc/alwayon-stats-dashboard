// src/components/ui/ErrorAlert.tsx

import React from "react";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ErrorAlertProps {
  message?: string;
  title?: string;
  error?: Error | null;
}

export const ErrorAlert = ({
  title = "Error",
  message,
  error,
}: ErrorAlertProps) => {
  const errorMessage =
    message || error?.message || "An unexpected error occurred";

  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{errorMessage}</AlertDescription>
    </Alert>
  );
};
