// src/components/charts/DashboardCharts.tsx

import React, { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PerformanceChart from "@/components/charts/PerformanceChart";
import { StatisticsData, ChartData } from "@/lib/types";
import { formatNumber, getThaiMonth, getThaiYear } from "@/lib/formatters";
import {
  calculateRegionOverview,
  transformToChartData,
  calculateTrend,
  calculateCumulativeStats,
  calculateMonthlyGrowth,
} from "@/lib/calculations";
import { getAvailableMonths } from "@/lib/api";
import { getCurrentYearTarget } from "@/config/dashboard";
import MonthlyStatsTable from "@/components/tables/MonthlyStatsTable";
import GrowthTable from "../tables/GrowthTable";

/**
 * Interface defining the period range for date filtering
 */
interface PeriodRange {
  start: string;
  end: string;
}

/**
 * Interface defining the structure of monthly statistics row data
 */
interface MonthlyStatsRow {
  branch: string;
  months: {
    month: string;
    percentage: number;
    detail: string;
  }[];
}

/**
 * Interface defining the structure of growth data
 */
interface GrowthData {
  branch: string;
  currentMonth: {
    percentage: number;
    detail: string;
  };
  previousMonth: {
    percentage: number;
    detail: string;
  };
  growth: number;
}

/**
 * DashboardCharts Component
 *
 * A comprehensive dashboard component that displays various performance charts and statistics.
 * Features include:
 * - Daily performance charts
 * - Monthly performance statistics
 * - Cumulative performance data
 * - Monthly comparison tables
 * - Growth statistics
 *
 * @component
 * @returns {JSX.Element} The rendered dashboard charts component
 */
const DashboardCharts = () => {
  const [dailyData, setDailyData] = useState<ChartData[]>([]);
  const [monthlyStats, setMonthlyStats] = useState<ChartData[]>([]);
  const [cumulativeStats, setCumulativeStats] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [periodRange, setPeriodRange] = useState<PeriodRange>({
    start: "",
    end: "",
  });

  // state for MonthlyTable
  const [monthlyTableData, setMonthlyTableData] = useState<MonthlyStatsRow[]>(
    []
  );

  // state เก็บชื่อเดือน
  const [latestMonthName, setLatestMonthName] = useState<string>("");
  const [previousMonthName, setPreviousMonthName] = useState<string>("");
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);

  const targetValue = getCurrentYearTarget();

  // เพิ่ม state Monthly Growth
  const [growthData, setGrowthData] = useState<GrowthData[]>([]);

  /**
   * Transforms monthly statistics data into a table-friendly format
   *
   * @param {StatisticsData[][]} allMonthlyData - Array of monthly statistics data
   * @param {string[]} monthNames - Array of month names
   * @returns {MonthlyStatsRow[]} Transformed data for table display
   */
  const transformMonthlyDataForTable = (
    allMonthlyData: StatisticsData[][],
    monthNames: string[]
  ) => {
    // สร้าง Map เก็บข้อมูลแต่ละสาขา
    const branchMap = new Map<string, any>();

    // วนลูปข้อมูลแต่ละเดือน
    allMonthlyData.forEach((monthData, monthIndex) => {
      const monthName = getThaiMonth(monthNames[monthIndex]);

      monthData.forEach((branchData) => {
        if (!branchMap.has(branchData.org_name)) {
          branchMap.set(branchData.org_name, {
            branch: branchData.org_name,
            months: [],
          });
        }

        const percentage = (branchData.cnt_other * 100) / branchData.cnt_inv;
        const detail = `${formatNumber(branchData.cnt_other)}/${formatNumber(
          branchData.cnt_inv
        )}`;

        branchMap.get(branchData.org_name).months.push({
          month: monthName,
          percentage: percentage,
          detail: detail,
        });
      });
    });

    return Array.from(branchMap.values());
  };

  /**
   * Fetches and processes all required data for the dashboard
   * Includes daily stats, monthly stats, cumulative stats, and growth data
   *
   * @async
   * @throws {Error} When data fetching fails
   */
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const months = await getAvailableMonths();
      if (!months.length) {
        throw new Error("ไม่พบข้อมูลรายเดือน");
      }

      setAvailableMonths(months);

      // ประกาศตัวแปร latestMonth ครั้งเดียว
      const latestMonth = months[months.length - 1];
      const previousMonth = months[months.length - 2];

      setLatestMonthName(getThaiMonth(latestMonth));
      setPreviousMonthName(getThaiMonth(previousMonth));

      const dailyResponse = await fetch("/data/daily/DailyData.json");
      if (!dailyResponse.ok) {
        throw new Error("ไม่สามารถดึงข้อมูลรายวันได้");
      }
      const dailyData: StatisticsData[] = await dailyResponse.json();
      const transformedDailyData = transformToChartData(dailyData);
      setDailyData(transformedDailyData);

      const latestMonthResponse = await fetch(
        `/data/monthly/${latestMonth}_Data.json`
      );
      if (!latestMonthResponse.ok) {
        throw new Error(`ไม่สามารถดึงข้อมูลเดือน ${latestMonth} ได้`);
      }
      const latestMonthData: StatisticsData[] =
        await latestMonthResponse.json();
      const transformedMonthlyData = transformToChartData(latestMonthData);
      setMonthlyStats(transformedMonthlyData);

      // คำนวณ Growth
      if (months.length >= 2) {
        // ดึงข้อมูลเดือนปัจจุบันและเดือนก่อนหน้า
        const currentMonthData = await fetch(
          `/data/monthly/${latestMonth}_Data.json`
        ).then((res) => res.json());
        const previousMonthData = await fetch(
          `/data/monthly/${previousMonth}_Data.json`
        ).then((res) => res.json());

        // คำนวณการเติบโต
        const growthData = calculateMonthlyGrowth(
          currentMonthData,
          previousMonthData
        );
        setGrowthData(growthData);
      }

      const allMonthlyDataPromises = months.map((month) =>
        fetch(`/data/monthly/${month}_Data.json`).then((res) => res.json())
      );
      const allMonthlyData = await Promise.all(allMonthlyDataPromises);
      const cumulativeData = calculateCumulativeStats(allMonthlyData);
      setCumulativeStats(cumulativeData);

      // จัดรูปแบบข้อมูลสำหรับตาราง
      const tableData = transformMonthlyDataForTable(allMonthlyData, months);
      setMonthlyTableData(tableData);

      setPeriodRange({
        start: `${getThaiMonth(months[0])} ${getThaiYear(
          allMonthlyData[0][0].data_date
        )}`,
        end: `${getThaiMonth(months[months.length - 1])} ${getThaiYear(
          allMonthlyData[allMonthlyData.length - 1][0].data_date
        )}`,
      });
    } catch (error) {
      console.error("Error fetching data:", error);
      setError(
        error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการดึงข้อมูล"
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchData]); // เพิ่ม fetchData เป็น dependency

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (isLoading) {
    return <div>กำลังโหลดข้อมูล...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <CardHeader className="px-0 pt-0">
            <CardTitle>สถิติรายวัน</CardTitle>
          </CardHeader>
          {dailyData.length > 0 ? (
            <PerformanceChart
              data={dailyData}
              targetValue={targetValue}
              title="ผลการดำเนินงานรายวัน"
              showLegend={true}
            />
          ) : (
            <div>ไม่พบข้อมูล</div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <CardHeader className="px-0 pt-0">
            <CardTitle>สถิติรายเดือน (เดือน{latestMonthName})</CardTitle>
          </CardHeader>
          {monthlyStats.length > 0 ? (
            <PerformanceChart
              data={monthlyStats}
              targetValue={targetValue}
              title="ผลการดำเนินงานรายเดือน"
              showLegend={true}
            />
          ) : (
            <div>ไม่พบข���อมูล</div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <CardHeader className="px-0 pt-0">
            <CardTitle>
              ผลการดำเนินงานสะสม ({periodRange.start} - {periodRange.end})
            </CardTitle>
          </CardHeader>
          {cumulativeStats.length > 0 ? (
            <PerformanceChart
              data={cumulativeStats}
              targetValue={targetValue}
              title="ผลการดำเนินงานสะสม"
              showLegend={true}
            />
          ) : (
            <div>ไม่พบข้อมูล</div>
          )}
        </CardContent>
      </Card>
      {/* เพิ่มส่วนตารางข้อมูลสะสมรายเดือน */}
      <Card>
        <CardContent className="p-6">
          <CardHeader className="px-0 pt-0">
            <CardTitle>
              ข้อมูลสะสมรายเดือน ({periodRange.start} - {periodRange.end})
            </CardTitle>
          </CardHeader>
          <MonthlyStatsTable data={monthlyTableData} />
        </CardContent>
      </Card>
      {/* Growth MoM */}
      <Card>
        <CardContent className="p-6">
          {availableMonths.length >= 2 ? (
            <GrowthTable
              data={growthData}
              currentMonthName={latestMonthName}
              previousMonthName={previousMonthName}
            />
          ) : (
            <div className="text-center p-4">
              <CardTitle className="mb-2">อัตราการเติบโตรายเดือน</CardTitle>
              <p className="text-gray-500">
                ยังไม่มีข้อมูลเพียงพอสำหรับการเปรียบเทียบ (ต้องมีข้อมูลอย่างน้อย
                2 เดือน)
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardCharts;
