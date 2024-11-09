//src/config/dashboard.ts

import { StaticImageData } from "next/image";

export interface TargetConfig {
  year: number;
  value: number;
  description?: string;
}

export interface ChartConfig {
  refreshInterval: number; // milliseconds
  animation: {
    duration: number;
    easing: string;
  };
  colors: {
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    danger: string;
    neutral: string;
  };
}

export interface DashboardConfig {
  title: string;
  description: string;
  targets: TargetConfig[];
  chart: ChartConfig;
  dateFormat: string;
  currency: {
    locale: string;
    code: string;
  };
}

const config: DashboardConfig = {
  title: "PWA Always On Statistics Dashboard",
  description: "แดชบอร์ดแสดงสถิติการใช้งานระบบ PWA",
  targets: [
    {
      year: 2024,
      value: 75.0,
      description: "เป้าหมายปี 2567",
    },
    {
      year: 2023,
      value: 72.0,
      description: "เป้าหมายปี 2566",
    },
  ],
  chart: {
    refreshInterval: 15 * 60 * 1000, // 15 minutes
    animation: {
      duration: 500,
      easing: "ease-in-out",
    },
    colors: {
      primary: "#3B82F6", // blue-500
      secondary: "#F97316", // orange-500
      success: "#22C55E", // green-500
      warning: "#F59E0B", // amber-500
      danger: "#EF4444", // red-500
      neutral: "#6B7280", // gray-500
    },
  },
  dateFormat: "dd/MM/yyyy HH:mm:ss",
  currency: {
    locale: "th-TH",
    code: "THB",
  },
};

// Helper functions
export const getCurrentYearTarget = (): number => {
  const currentYear = new Date().getFullYear();
  const target = config.targets.find((t) => t.year === currentYear);
  return target?.value ?? config.targets[0].value; // ถ้าไม่พบปีปัจจุบัน ให้ใช้ค่าล่าสุด
};

export const getTargetByYear = (year: number): TargetConfig | undefined => {
  return config.targets.find((t) => t.year === year);
};

export const getAllTargets = (): TargetConfig[] => {
  return [...config.targets].sort((a, b) => b.year - a.year); // เรียงจากปีล่าสุด
};

export default config;
