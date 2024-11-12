// src/lib/validation.ts

import { StatisticsData } from '@/lib/types';

/**
 * ตรวจสอบความถูกต้องของข้อมูลสถิติ
 * @param data ข้อมูลสถิติที่ต้องการตรวจสอบ
 * @returns boolean ผลการตรวจสอบ
 */
export const validateStatisticsData = (data: StatisticsData): boolean => {
  // ตรวจสอบว่าข้อมูลครบถ้วน
  const requiredFields = [
    "cnt_count",
    "cnt_other",
    "cnt_paid",
    "cnt_inv",
    "cnt_debt",
    "sm_debt",
  ];

  const isComplete = requiredFields.every(
    (field) =>
      data[field as keyof StatisticsData] !== undefined &&
      data[field as keyof StatisticsData] !== null
  );

  if (!isComplete) return false;

  // ตรวจสอบความสมเหตุสมผลของข้อมูล
  const validations = [
    data.cnt_count >= 0,
    data.cnt_other >= 0,
    data.cnt_paid >= 0,
    data.cnt_inv >= 0,
    data.cnt_debt >= 0,
    data.sm_debt >= 0,
    data.cnt_count + data.cnt_other === data.cnt_paid, // ยอดรวมชำระต้องเท่ากับผลรวมของช่องทางการชำระ
    data.cnt_paid + data.cnt_debt === data.cnt_inv, // ยอดรวมใบแจ้งหนี้ต้องเท่ากับยอดชำระรวมกับยอดค้างชำระ
  ];

  return validations.every(Boolean);
};

/**
 * ตรวจสอบความถูกต้องของเปอร์เซ็นต์
 * @param data ข้อมูลสถิติที่ต้องการตรวจสอบ
 * @returns boolean ผลการตรวจสอบ
 */
export const validatePercentages = (data: StatisticsData): boolean => {
  const { cnt_count, cnt_other, cnt_paid, cnt_inv, cnt_debt } = data;

  // คำนวณเปอร์เซ็นต์
  const counterPercentage = (cnt_count * 100) / cnt_inv;
  const otherPercentage = (cnt_other * 100) / cnt_inv;
  const paidPercentage = (cnt_paid * 100) / cnt_inv;
  const debtPercentage = (cnt_debt * 100) / cnt_inv;

  // ตรวจสอบว่าผลรวมเปอร์เซ็นต์ถูกต้อง
  const isCounterAndOtherValid = Math.abs(counterPercentage + otherPercentage - paidPercentage) < 0.01;
  const isPaidAndDebtValid = Math.abs(paidPercentage + debtPercentage - 100) < 0.01;

  return isCounterAndOtherValid && isPaidAndDebtValid;
};