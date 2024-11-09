// src/lib/chartValidation.ts

import { ChartData } from "@/lib/types";

export const validateChartData = (
  data: ChartData[]
): {
  isValid: boolean;
  issues: string[];
} => {
  const issues: string[] = [];

  // ตรวจสอบว่ามีข้อมูล
  if (!data.length) {
    issues.push("ไม่พบข้อมูลสำหรับแสดงผลกราฟ");
    return { isValid: false, issues };
  }

  // ตรวจสอบค่าที่เป็นไปได้
  data.forEach((item, index) => {
    if (item.value < 0 || item.value > 100) {
      issues.push(`พบค่าเปอร์เซ็นต์ไม่ถูกต้องที่ ${item.name}: ${item.value}%`);
    }
  });

  // ตรวจสอบข้อมูลภาพรวมเขต
  const regionData = data.find((item) => item.name === "ภาพรวมเขต");
  if (!regionData) {
    issues.push("ไม่พบข้อมูลภาพรวมเขต");
  }

  return {
    isValid: issues.length === 0,
    issues,
  };
};

// ฟังก์ชั่นสำหรับ log ข้อมูลเพื่อตรวจสอบ
export const logChartDataValidation = (
  chartName: string,
  data: ChartData[]
): void => {
  console.group(`Chart Validation: ${chartName}`);
  const validation = validateChartData(data);

  if (validation.isValid) {
    console.log("✅ ข้อมูลถูกต้อง");
  } else {
    console.log("❌ พบปัญหา:");
    validation.issues.forEach((issue) => console.log(`- ${issue}`));
  }

  console.groupEnd();
};
