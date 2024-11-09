// src/app/api/available-months/route.ts
import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export async function GET() {
  try {
    const monthlyDataPath = path.join(process.cwd(), "public/data/monthly");
    const files = await fs.readdir(monthlyDataPath);

    // กรองเฉพาะไฟล์ที่ลงท้ายด้วย _Data.json และเรียงตามเดือน
    const months = files
      .filter((file) => file.endsWith("_Data.json"))
      .map((file) => file.replace("_Data.json", ""))
      .sort((a, b) => {
        // สร้างวันที่เพื่อเรียงลำดับ (เช่น October -> 2024-10)
        const getMonth = (month: string) => {
          const monthMap: { [key: string]: string } = {
            January: "01",
            February: "02",
            March: "03",
            April: "04",
            May: "05",
            June: "06",
            July: "07",
            August: "08",
            September: "09",
            October: "10",
            November: "11",
            December: "12",
          };
          return monthMap[month] || "00";
        };
        return getMonth(a).localeCompare(getMonth(b));
      });

    return NextResponse.json(months);
  } catch (error) {
    console.error("Error reading monthly data directory:", error);
    return NextResponse.json([], { status: 500 });
  }
}
