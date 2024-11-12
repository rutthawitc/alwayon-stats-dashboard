// src/components/tables/GrowthTable.tsx

import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatNumber } from "@/lib/formatters";

/**
 * Interface สำหรับข้อมูลการเติบโต
 * @interface GrowthData
 * @property {string} branch - ชื่อสาขา
 * @property {object} currentMonth - ข้อมูลเดือนปัจจุบัน
 * @property {object} previousMonth - ข้อมูลเดือนก่อนหน้า
 * @property {number} growth - อัตราการเติบโต
 */

/**
 * Interface สำหรับ props ของ GrowthTable
 * @interface GrowthTableProps
 * @property {GrowthData[]} data - ข้อมูลการเติบโตของแต่ละสาขา
 * @property {string} currentMonthName - ชื่อเดือนปัจจุบัน
 * @property {string} previousMonthName - ชื่อเดือนก่อนหน้า
 */

/**
 * Component แสดงตัวบ่งชี้การเติบโต
 * @param {object} props - Props ของ component
 * @param {number} props.value - ค่าการเติบโต
 * @returns {JSX.Element} ไอคอนและค่าการเติบโต
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

interface GrowthTableProps {
  data: GrowthData[];
  currentMonthName: string;
  previousMonthName: string;
}

const GrowthIndicator = ({ value }: { value: number }) => {
  return (
    <div
      className={`flex items-center gap-1 justify-end ${
        value >= 0 ? "text-green-600" : "text-red-600"
      }`}
    >
      {value >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
      {value.toFixed(2)}%
    </div>
  );
};

/**
 * Component แสดงตารางอัตราการเติบโตรายเดือน
 * @param {GrowthTableProps} props - Props ของ component
 * @returns {JSX.Element} ตารางแสดงข้อมูลการเติบโต
 */

const GrowthTable = ({
  data,
  currentMonthName,
  previousMonthName,
}: GrowthTableProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>อัตราการเติบโตรายเดือน (MoM)</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>สาขา</TableHead>
              <TableHead className="text-right">
                เดือน{currentMonthName}
              </TableHead>
              <TableHead className="text-right">
                เดือน{previousMonthName}
              </TableHead>
              <TableHead className="text-right">อัตราการเติบโต</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row: GrowthData, index: number) => (
              <TableRow key={index}>
                <TableCell>{row.branch}</TableCell>
                <TableCell className="text-right">
                  <div>{row.currentMonth.percentage.toFixed(2)}%</div>
                  <div className="text-xs text-gray-500">
                    {row.currentMonth.detail}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div>{row.previousMonth.percentage.toFixed(2)}%</div>
                  <div className="text-xs text-gray-500">
                    {row.previousMonth.detail}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <GrowthIndicator value={row.growth} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default GrowthTable;
