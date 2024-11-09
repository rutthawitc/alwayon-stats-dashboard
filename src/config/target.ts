interface YearlyTarget {
  year: number;
  value: number;
}

export const PERFORMANCE_TARGETS: YearlyTarget[] = [
  { year: 2024, value: 75.0 }, // ค่าเป้าหมายปี 2024
  { year: 2023, value: 72.0 }, // ค่าเป้าหมายปี 2023
];

export const getCurrentYearTarget = (): number => {
  const currentYear = new Date().getFullYear();
  const target = PERFORMANCE_TARGETS.find((t) => t.year === currentYear);
  return target?.value ?? 75.0; // ค่า default ถ้าไม่พบปีปัจจุบัน
};
