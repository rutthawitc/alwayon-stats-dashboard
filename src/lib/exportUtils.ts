// src/lib/exportUtils.ts
import { StatisticsData } from "./types";
import { calculations } from "./calculations";
import { utils, writeFile } from "xlsx";

// กำหนด headers สำหรับไฟล์ export
const EXPORT_HEADERS = {
  ba_code: "รหัสสาขา",
  org_name: "ชื่อสาขา",
  cnt_count: "เคาท์เตอร์ประปา",
  cnt_other: "ช่องทางอื่นๆ",
  cnt_paid: "รวมชำระ",
  cnt_inv: "รวมใบแจ้งหนี้",
  cnt_debt: "ค้างชำระ",
  sm_debt: "รวมค่าน้ำ",
  counter_percentage: "% เคาท์เตอร์ประปา",
  other_percentage: "% ช่องทางอื่นๆ",
  paid_percentage: "% รวมชำระ",
  debt_percentage: "% ค้างชำระ",
};

// แปลงข้อมูลสำหรับ export
const transformDataForExport = (data: StatisticsData[]) => {
  return data.map((item) => {
    const counterPercentage = calculations.calculateCounterPercentage(
      item.cnt_count,
      item.cnt_inv
    );
    const otherPercentage = calculations.calculateOtherPercentage(
      item.cnt_other,
      item.cnt_inv
    );
    const paidPercentage = calculations.calculateTotalPaidPercentage(
      item.cnt_paid,
      item.cnt_inv
    );
    const debtPercentage = calculations.calculateDebtPercentage(
      item.cnt_debt,
      item.cnt_inv
    );

    return {
      ba_code: item.ba_code,
      org_name: item.org_name,
      cnt_count: item.cnt_count,
      cnt_other: item.cnt_other,
      cnt_paid: item.cnt_paid,
      cnt_inv: item.cnt_inv,
      cnt_debt: item.cnt_debt,
      sm_debt: item.sm_debt,
      counter_percentage: `${counterPercentage.toFixed(2)}%`,
      other_percentage: `${otherPercentage.toFixed(2)}%`,
      paid_percentage: `${paidPercentage.toFixed(2)}%`,
      debt_percentage: `${debtPercentage.toFixed(2)}%`,
    };
  });
};

// Export เป็น Excel
export const exportToExcel = async (
  data: StatisticsData[],
  filename: string
) => {
  const exportData = transformDataForExport(data);

  // สร้าง worksheet
  const ws = utils.json_to_sheet(exportData, {
    header: Object.keys(EXPORT_HEADERS),
    skipHeader: true,
  });

  // ใส่ headers ภาษาไทย
  utils.sheet_add_aoa(ws, [Object.values(EXPORT_HEADERS)], { origin: "A1" });

  // จัด style ให้ headers
  const headerRange = utils.decode_range(ws["!ref"] || "A1:Z1");
  for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
    const cellRef = utils.encode_cell({ r: 0, c: col });
    if (!ws[cellRef]) continue;
    ws[cellRef].s = {
      font: { bold: true },
      alignment: { horizontal: "center" },
    };
  }

  // สร้าง workbook
  const wb = utils.book_new();
  utils.book_append_sheet(wb, ws, "ข้อมูลการจัดเก็บ");

  // Export ไฟล์
  writeFile(wb, `${filename}.xlsx`);
};

// Export เป็น CSV
export const exportToCSV = async (data: StatisticsData[], filename: string) => {
  const exportData = transformDataForExport(data);

  // สร้าง CSV string
  const headers = Object.values(EXPORT_HEADERS).join(",") + "\n";
  const rows = exportData.map((row) => Object.values(row).join(",")).join("\n");
  const csvContent = "\ufeff" + headers + rows; // เพิ่ม BOM สำหรับรองรับภาษาไทย

  // สร้าง Blob และ download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};
