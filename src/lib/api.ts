// src/lib/api.ts
import { StatisticsData } from "./types";

export const API_PATHS = {
  DAILY: "/data/daily/DailyData.json",
  MONTHLY: (month: string) => `/data/monthly/${month}_Data.json`,
};

export async function fetchDailyData(): Promise<StatisticsData[]> {
  const response = await fetch(API_PATHS.DAILY);
  if (!response.ok) {
    throw new Error("Failed to fetch daily data");
  }
  return response.json();
}

export async function fetchMonthlyData(
  month: string
): Promise<StatisticsData[]> {
  const response = await fetch(API_PATHS.MONTHLY(month));
  if (!response.ok) {
    throw new Error(`Failed to fetch monthly data for ${month}`);
  }
  return response.json();
}

// Utility function to get available months
export async function getAvailableMonths(): Promise<string[]> {
  try {
    const response = await fetch("/api/available-months");
    if (!response.ok) {
      throw new Error("Failed to fetch available months");
    }
    return response.json();
  } catch (error) {
    console.error("Error fetching available months:", error);
    return [];
  }
}
