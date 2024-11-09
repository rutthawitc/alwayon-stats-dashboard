// src/lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// File utilities
export const downloadFile = (
  data: any,
  filename: string,
  type: "csv" | "xlsx"
) => {
  // Implementation for file download
};

// Date utilities
export const getCurrentMonthName = (): string => {
  return new Date().toLocaleString("en-US", { month: "long" });
};
