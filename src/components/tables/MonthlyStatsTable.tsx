// src/components/tables/MonthlyStatsTable.tsx

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatNumber } from "@/lib/formatters";

interface MonthlyStatsRow {
  branch: string;
  months: {
    month: string;
    percentage: number;
    detail: string;
  }[];
}

interface MonthlyStatsTableProps {
  data: MonthlyStatsRow[];
}

const MonthlyStatsTable = ({ data }: MonthlyStatsTableProps) => {
  if (!data || data.length === 0) return null;

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px] bg-gray-50">สาขา</TableHead>
            {data[0]?.months.map((month) => (
              <TableHead key={month.month} className="bg-gray-50">
                {month.month}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, index) => (
            <TableRow key={index}>
              <TableCell className="font-medium">{row.branch}</TableCell>
              {row.months.map((month, idx) => (
                <TableCell key={idx}>
                  <div
                    className={`font-medium ${
                      month.percentage >= 75
                        ? "text-green-600"
                        : month.percentage >= 70
                        ? "text-yellow-600"
                        : "text-gray-900"
                    }`}
                  >
                    {month.percentage.toFixed(2)}%
                  </div>
                  <div className="text-xs text-gray-500">{month.detail}</div>
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default MonthlyStatsTable;
