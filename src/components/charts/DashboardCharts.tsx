// src/components/charts/DashboardCharts.ts

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PerformanceChart from "./PerformanceChart";
import { StatisticsData, ChartData } from "@/lib/types";
import { getThaiMonth, getThaiYear } from "@/lib/formatters";
import {
  calculateRegionOverview,
  transformToChartData,
  calculateTrend,
} from "@/lib/calculations";
import { getAvailableMonths } from "@/lib/api";

interface PeriodRange {
  start: string;
  end: string;
}

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

  const calculateCumulativeStats = (allMonthlyData: StatisticsData[][]) => {
    // คำนวณข้อมูลสะสมรายสาขา
    const branchMap = new Map<string, ChartData>();

    allMonthlyData.forEach((monthData) => {
      monthData.forEach((branchData) => {
        const existing = branchMap.get(branchData.org_name);
        if (!existing) {
          branchMap.set(branchData.org_name, {
            name: branchData.org_name,
            value: 0,
            total_invoices: 0,
            other_channel: 0,
            counter_service: 0,
          });
        }
        const current = branchMap.get(branchData.org_name)!;
        current.total_invoices += branchData.cnt_inv;
        current.other_channel += branchData.cnt_other;
        current.counter_service += branchData.cnt_count;
        current.value = (current.other_channel * 100) / current.total_invoices;
      });
    });

    // คำนวณภาพรวมเขต
    const totals = Array.from(branchMap.values()).reduce(
      (acc, curr) => ({
        total_invoices: acc.total_invoices + curr.total_invoices,
        other_channel: acc.other_channel + curr.other_channel,
        counter_service: acc.counter_service + curr.counter_service,
      }),
      { total_invoices: 0, other_channel: 0, counter_service: 0 }
    );

    const regionTotal: ChartData = {
      name: "ภาพรวมเขต",
      value: (totals.other_channel * 100) / totals.total_invoices,
      total_invoices: totals.total_invoices,
      other_channel: totals.other_channel,
      counter_service: totals.counter_service,
    };

    return [...Array.from(branchMap.values()), regionTotal];
  };

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // 1. ดึงรายชื่อเดือนที่มีข้อมูล
      const months = await getAvailableMonths();
      if (!months.length) {
        throw new Error("ไม่พบข้อมูลรายเดือน");
      }

      // 2. ดึงและแปลงข้อมูลรายวัน
      const dailyResponse = await fetch("/data/daily/DailyData.json");
      if (!dailyResponse.ok) {
        throw new Error("ไม่สามารถดึงข้อมูลรายวันได้");
      }
      const dailyData: StatisticsData[] = await dailyResponse.json();
      const transformedDailyData = transformToChartData(dailyData);
      setDailyData(transformedDailyData);

      // 3. ดึงและแปลงข้อมูลเดือนล่าสุด
      const latestMonth = months[months.length - 1];
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

      // 4. ดึงและคำนวณข้อมูลสะสม
      const allMonthlyDataPromises = months.map((month) =>
        fetch(`/data/monthly/${month}_Data.json`).then((res) => res.json())
      );
      const allMonthlyData = await Promise.all(allMonthlyDataPromises);
      const cumulativeData = calculateCumulativeStats(allMonthlyData);
      setCumulativeStats(cumulativeData);

      // 5. ตั้งค่าช่วงเวลาของข้อมูล
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
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

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
              targetValue={75}
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
            <CardTitle>สถิติรายเดือน (เดือนล่าสุด)</CardTitle>
          </CardHeader>
          {monthlyStats.length > 0 ? (
            <PerformanceChart
              data={monthlyStats}
              targetValue={75}
              title="ผลการดำเนินงานรายเดือน"
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
            <CardTitle>
              ผลการดำเนินงานสะสม ({periodRange.start} - {periodRange.end})
            </CardTitle>
          </CardHeader>
          {cumulativeStats.length > 0 ? (
            <PerformanceChart
              data={cumulativeStats}
              targetValue={75}
              title="ผลการดำเนินงานสะสม"
              showLegend={true}
            />
          ) : (
            <div>ไม่พบข้อมูล</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardCharts;
