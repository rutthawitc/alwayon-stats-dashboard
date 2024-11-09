// src/components/charts/CumulativeChart.tsx
import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { CumulativeData } from "@/lib/types";

interface CumulativeChartProps {
  data: CumulativeData[];
}

const CumulativeChart = ({ data }: CumulativeChartProps) => {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart
        data={data}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 70,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="name"
          angle={-45}
          textAnchor="end"
          height={70}
          tick={{ fontSize: 12 }}
        />
        <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`} />
        <Tooltip
          formatter={(value: number) => [
            new Intl.NumberFormat("th-TH").format(value),
            "จำนวนผู้ใช้น้ำ",
          ]}
          labelStyle={{ color: "#666666" }}
        />
        <Legend />
        <Bar
          dataKey="monthly.ตุลาคม 2567"
          name="ตุลาคม 2567"
          stackId="a"
          fill="#93C5FD" // Tailwind blue-300
        />
        <Bar
          dataKey="monthly.พฤศจิกายน 2567"
          name="พฤศจิกายน 2567"
          stackId="a"
          fill="#3B82F6" // Tailwind blue-500
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default CumulativeChart;
