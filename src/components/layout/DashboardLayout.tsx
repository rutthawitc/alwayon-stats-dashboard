"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { FileDown, RefreshCw } from "lucide-react";
import DashboardCharts from "@/components/charts/DashboardCharts";
import StatsCard from "@/components/ui/StatsCard";
import { exportToExcel, exportToCSV } from "@/lib/exportUtils";
import { calculateStatsOverview } from "@/lib/calculations";
import { StatisticsData, StatsOverview } from "@/lib/types";
import { formatThaiDate } from "@/lib/formatters";
import {
  getAvailableMonths,
  fetchDailyData,
  fetchMonthlyData,
} from "@/lib/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const DashboardLayout = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [statsOverview, setStatsOverview] = useState<StatsOverview | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchData = async () => {
    try {
      setIsRefreshing(true);
      setError(null);

      const months = await getAvailableMonths();
      if (!months.length) {
        throw new Error("ไม่พบข้อมูลรายเดือน");
      }

      const dailyData = await fetchDailyData();
      const monthlyData = await fetchMonthlyData(months[months.length - 1]);

      const overview = calculateStatsOverview(dailyData, monthlyData);
      setStatsOverview(overview);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error fetching stats data:", error);
      setError(
        error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการดึงข้อมูล"
      );
    } finally {
      setIsRefreshing(false);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleExport = async (
    type: "daily" | "monthly",
    format: "xlsx" | "csv"
  ) => {
    try {
      setIsExporting(true);
      const months = await getAvailableMonths();

      let data: StatisticsData[];
      if (type === "daily") {
        data = await fetchDailyData();
      } else {
        data = await fetchMonthlyData(months[months.length - 1]);
      }

      const currentDate = new Date().toISOString().split("T")[0];
      const filename = `PWA_${type}_stats_${currentDate}`;

      if (format === "xlsx") {
        await exportToExcel(data, filename);
      } else {
        await exportToCSV(data, filename);
      }
    } catch (error) {
      console.error(`Error exporting ${type} data:`, error);
      setError(
        error instanceof Error
          ? error.message
          : `ไม่สามารถส่งออกข้อมูล${
              type === "daily" ? "รายวัน" : "รายเดือน"
            }ได้`
      );
    } finally {
      setIsExporting(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="mx-auto max-w-7xl">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-800">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchData}
              className="mt-2"
              disabled={isRefreshing}
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
              ลองใหม่
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ส่วนที่เหลือของ component ยังคงเหมือนเดิม
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold">
              PWA Always On Statistics Dashboard
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              อัพเดทล่าสุด: {formatThaiDate(lastUpdated.toISOString())}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchData}
              disabled={isRefreshing}
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
              รีเฟรช
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" disabled={isExporting}>
                  <FileDown className="mr-2 h-4 w-4" />
                  ส่งออกข้อมูล
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleExport("daily", "xlsx")}>
                  ส่งออกข้อมูลรายวัน (Excel)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport("daily", "csv")}>
                  ส่งออกข้อมูลรายวัน (CSV)
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleExport("monthly", "xlsx")}
                >
                  ส่งออกข้อมูลรายเดือน (Excel)
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleExport("monthly", "csv")}
                >
                  ส่งออกข้อมูลรายเดือน (CSV)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {statsOverview && (
            <>
              <StatsCard
                title="ภาพรวมเขต"
                mainValue={{
                  value: statsOverview.overview.other_percentage,
                  trend: statsOverview.overview.trend,
                }}
                isPercentage
                subtitle={`ข้อมูล ณ วันที่ ${formatThaiDate(
                  statsOverview.overview.data_date
                )}`}
              />
              <StatsCard
                title="สาขาที่มีผลงานดีที่สุด"
                mainValue={{
                  value: statsOverview.top_branch.percentage,
                }}
                isPercentage
                subtitle={statsOverview.top_branch.name}
              />
              <StatsCard
                title="รวมใบแจ้งหนี้"
                mainValue={{
                  value: statsOverview.overview.total_invoices,
                }}
                additionalInfo={[
                  {
                    label: "เคาท์เตอร์ประปา",
                    value: statsOverview.overview.total_counter,
                  },
                  {
                    label: "ช่องทางอื่นๆ",
                    value: statsOverview.overview.total_other,
                  },
                ]}
              />
              <StatsCard
                title="สถิติการชำระ"
                mainValue={{
                  value: statsOverview.payment_stats.paid_percentage,
                }}
                isPercentage
                additionalInfo={[
                  {
                    label: "รวมชำระ (ราย)",
                    value: statsOverview.payment_stats.total_paid,
                  },
                  {
                    label: "ค้างชำระ (ราย)",
                    value: statsOverview.payment_stats.total_debt,
                  },
                ]}
              />
            </>
          )}
        </div>

        {/* Charts */}
        <DashboardCharts />
      </div>
    </div>
  );
};

export default DashboardLayout;
