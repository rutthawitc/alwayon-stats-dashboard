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
import { formatNumber } from "@/lib/formatters";

// Types
type AnimationTiming =
  | "ease"
  | "ease-in"
  | "ease-out"
  | "ease-in-out"
  | "linear";

interface ChartDataPoint {
  name: string;
  value: number;
  total_invoices: number;
  other_channel: number;
  counter_service: number;
  total_paid: number;
  total_debt: number;
}

interface PerformanceChartProps {
  data: ChartDataPoint[];
  targetValue?: number;
  title?: string;
  height?: number;
  showLegend?: boolean;
  customColors?: {
    barColor?: string;
    regionColor?: string;
    targetLineColor?: string;
  };
  animate?: boolean;
}

interface ChartColors {
  bar: string;
  region: string;
  targetLine: string;
}

interface CustomTooltipProps extends TooltipProps<number, string> {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const chartConfig = {
  animation: {
    duration: 800,
    easing: "ease-in-out" as AnimationTiming,
    delay: 200,
  },
  colors: {
    primary: "#3B82F6", // blue-500
    secondary: "#F97316", // orange-500
    danger: "#EF4444", // red-500
  },
};

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;
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
            <p>
              รวมใบแจ้งหนี้:{" "}
              <span className="font-medium">
                {formatNumber(data.total_invoices)}
              </span>{" "}
              ราย
            </p>

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

const CustomLegend = ({
  barColor,
  regionColor,
  targetValue,
}: {
  barColor: string;
  regionColor: string;
  targetValue: number;
}) => (
  <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs sm:text-sm mb-4">
    <div className="flex items-center gap-2">
      <div className="w-3 h-3" style={{ backgroundColor: barColor }}></div>
      <span className="hidden sm:inline">ข้อมูลรายสาขา</span>
      <span className="sm:hidden">สาขา</span>
    </div>
    <div className="flex items-center gap-2">
      <div className="w-3 h-3" style={{ backgroundColor: regionColor }}></div>
      <span className="hidden sm:inline">ภาพรวมเขต</span>
      <span className="sm:hidden">เขต</span>
    </div>
    <div className="flex items-center gap-2">
      <div className="w-4 sm:w-6 h-0 border border-dashed border-red-500"></div>
      <span>เป้า ({targetValue}%)</span>
    </div>
  </div>
);

const PerformanceChart: React.FC<PerformanceChartProps> = memo(
  ({
    data,
    targetValue = getCurrentYearTarget(),
    title,
    height = 400,
    showLegend = true,
    customColors,
    animate = true,
  }) => {
    const chartColors = useMemo<ChartColors>(
      () => ({
        bar: customColors?.barColor ?? chartConfig.colors.primary,
        region: customColors?.regionColor ?? chartConfig.colors.secondary,
        targetLine: customColors?.targetLineColor ?? chartConfig.colors.danger,
      }),
      [customColors]
    );

    const formatXAxis = (value: string) => {
      if (typeof window !== 'undefined' && window.innerWidth <= 640) {
        // For mobile screens (sm breakpoint)
        return value.length > 10 ? `${value.substring(0, 10)}...` : value;
      }
      return value.length > 20 ? `${value.substring(0, 20)}...` : value;
    };

    // Calculate dynamic height based on screen size
    const chartHeight = useMemo(() => {
      if (typeof window !== 'undefined') {
        return window.innerWidth <= 640 ? 300 : height;
      }
      return height;
    }, [height]);

    // Format axis ticks
    const formatYAxis = (value: number) => `${value}%`;

    return (
      <div className="w-full">
        {title && (
          <h3 className="text-base sm:text-lg font-medium mb-4 px-2 sm:px-4 text-gray-800">
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
        <div className="w-full" style={{ height: chartHeight }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{
                top: 5,
                right: 5,
                left: 5,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                tickFormatter={formatXAxis}
                interval={0}
                tick={{ fontSize: window?.innerWidth <= 640 ? 10 : 12 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis
                tickFormatter={formatYAxis}
                domain={[0, 100]}
                tick={{ fontSize: window?.innerWidth <= 640 ? 10 : 12 }}
                width={35}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine
                y={targetValue}
                stroke={chartColors.targetLine}
                strokeDasharray="3 3"
              />
              <Bar
                dataKey="value"
                {...(animate && chartConfig.animation)}
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
      </div>
    );
  }
);

PerformanceChart.displayName = "PerformanceChart";

export default PerformanceChart;
