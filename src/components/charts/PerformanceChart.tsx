// src/components/charts/PerformanceChart.tsx
import React, { memo, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Cell,
  TooltipProps,
} from "recharts";
import { Card } from "@/components/ui/card";
import config, { getCurrentYearTarget } from "@/config/dashboard";
import { ChartData } from "@/lib/types";
import { formatNumber } from "@/lib/formatters";

interface PerformanceChartProps {
  data: ChartData[];
  targetValue?: number;
  title?: string;
  height?: number;
  showLegend?: boolean;
  customColors?: {
    barColor?: string;
    targetLineColor?: string;
    regionColor?: string;
  };
  animate?: boolean;
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: TooltipProps<number, string>) => {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;
  console.log("Tooltip Data:", data); // เช็คข้อมูลที่เข้ามาใน Tooltip
  const value = payload[0].value as number;
  const isRegion = label === "ภาพรวมเขต";

  return (
    <Card className="p-3 shadow-lg bg-white border-0">
      <div className="space-y-1.5">
        <p className="text-sm font-medium">{label}</p>
        <div className="text-sm text-gray-600">
          <p>
            ผลการดำเนินงาน:{" "}
            <span className="font-semibold">
              {formatNumber(value, "percentage")}
            </span>
          </p>

          <div className="mt-2 space-y-1 border-t pt-2 text-xs">
            {/* ข้อมูลใบแจ้งหนี้ */}
            <p>
              รวมใบแจ้งหนี้:{" "}
              <span className="font-medium">
                {formatNumber(data.total_invoices)}
              </span>{" "}
              ราย
            </p>

            {/* ข้อมูลช่องทางชำระ */}
            <div className="pl-2 border-l-2 border-blue-200">
              <p>
                ช่องทางอื่นๆ:{" "}
                <span className="font-medium">
                  {formatNumber(data.other_channel)}
                </span>{" "}
                ราย
              </p>
              <p>
                เคาท์เตอร์ประปา:{" "}
                <span className="font-medium">
                  {formatNumber(data.counter_service)}
                </span>{" "}
                ราย
              </p>
            </div>

            {/* ข้อมูลการชำระ */}
            <div className="pl-2 border-l-2 border-green-200 mt-2">
              <p>
                รวมชำระ:{" "}
                <span className="font-medium text-green-600">
                  {formatNumber(data.total_paid)}
                </span>{" "}
                ราย
              </p>
              <p>
                ค้างชำระ:{" "}
                <span className="font-medium text-red-600">
                  {formatNumber(data.total_debt)}
                </span>{" "}
                ราย
              </p>
            </div>
          </div>
        </div>
        {isRegion && (
          <p className="text-xs text-gray-500 mt-1 border-t pt-1">
            * แสดงค่าเฉลี่ยรวมทุกสาขา
          </p>
        )}
      </div>
    </Card>
  );
};

// Custom Legend Component
const CustomLegend = ({
  barColor,
  regionColor,
  targetValue,
}: {
  barColor: string;
  regionColor: string;
  targetValue: number;
}) => (
  <div className="flex items-center justify-center gap-6 text-sm mb-4">
    <div className="flex items-center gap-2">
      <div className="w-3 h-3" style={{ backgroundColor: barColor }}></div>
      <span>ข้อมูลรายสาขา</span>
    </div>
    <div className="flex items-center gap-2">
      <div className="w-3 h-3" style={{ backgroundColor: regionColor }}></div>
      <span>ภาพรวมเขต</span>
    </div>
    <div className="flex items-center gap-2">
      <div className="w-6 h-0 border border-dashed border-red-500"></div>
      <span>เป้าหมาย ({targetValue}%)</span>
    </div>
  </div>
);

const PerformanceChart = memo(
  ({
    data,
    targetValue = getCurrentYearTarget(),
    title,
    height = 400,
    showLegend = true,
    customColors,
    animate = true,
  }: PerformanceChartProps) => {
    const {
      colors: defaultColors,
      animation: { duration, easing },
    } = config.chart;

    const chartColors = useMemo(
      () => ({
        bar: customColors?.barColor ?? defaultColors.primary,
        region: customColors?.regionColor ?? defaultColors.secondary,
        targetLine: customColors?.targetLineColor ?? defaultColors.danger,
      }),
      [customColors, defaultColors]
    );

    // Format axis ticks
    const formatYAxis = (value: number) => `${value}%`;
    const formatXAxis = (value: string) => {
      // ถ้าชื่อยาวเกินไป ให้ตัดและใส่ ...
      return value.length > 20 ? `${value.substring(0, 20)}...` : value;
    };

    return (
      <div className="w-full">
        {title && (
          <h3 className="text-lg font-medium mb-4 px-4 text-gray-800">
            {title}
          </h3>
        )}

        {showLegend && (
          <CustomLegend
            barColor={chartColors.bar}
            regionColor={chartColors.region}
            targetValue={targetValue}
          />
        )}

        <ResponsiveContainer width="100%" height={height}>
          <BarChart
            data={data}
            margin={{
              top: 10,
              right: 30,
              left: 20,
              bottom: 70,
            }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#E5E7EB"
            />
            <XAxis
              dataKey="name"
              angle={-45}
              textAnchor="end"
              height={70}
              tick={{ fontSize: 12, fill: "#6B7280" }}
              tickFormatter={formatXAxis}
              interval={0}
            />
            <YAxis
              domain={[0, 100]}
              ticks={[0, 20, 40, 60, 80, 100]}
              tickFormatter={formatYAxis}
              tick={{ fontSize: 12, fill: "#6B7280" }}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: "rgba(236, 236, 236, 0.4)" }}
            />
            <ReferenceLine
              y={targetValue}
              stroke={chartColors.targetLine}
              strokeWidth={2}
              strokeDasharray="3 3"
              label={{
                //value: `เป้าหมาย ${targetValue}%`,
                position: "top",
                fill: chartColors.targetLine,
                fontSize: 12,
              }}
            />
            <Bar
              dataKey="value"
              radius={[4, 4, 0, 0]}
              animationDuration={animate ? duration : 0}
              animationEasing={easing}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    entry.name === "ภาพรวมเขต"
                      ? chartColors.region
                      : chartColors.bar
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }
);

PerformanceChart.displayName = "PerformanceChart";

export default PerformanceChart;
