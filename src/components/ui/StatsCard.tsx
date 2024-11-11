// src/components/ui/StatsCard.tsx
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { formatNumber } from "@/lib/formatters";

/**
 * Interface สำหรับ props ของ StatsCard
 * @interface StatsCardProps
 * @property {string} title - หัวข้อการ์ด
 * @property {object} mainValue - ค่าหลักที่ต้องการแสดง
 * @property {string} [subtitle] - หัวข้อย่อย
 * @property {Array<object>} [additionalInfo] - ข้อมูลเพิ่มเติม
 * @property {boolean} [isCurrency] - แสดงเป็นสกุลเงิน
 * @property {boolean} [isPercentage] - แสดงเป็นเปอร์เซ็นต์
 */

const StatsCard = ({
  title,
  mainValue,
  subtitle,
  additionalInfo,
  isCurrency,
  isPercentage,
}: StatsCardProps) => {
  const formatValue = (value: number, type?: "currency" | "percentage") => {
    if (type === "currency") {
      return formatNumber(value, "currency");
    }
    if (type === "percentage") {
      return formatNumber(value, "percentage");
    }
    return formatNumber(value, "number");
  };

  return (
    <Card className="shadow-sm">
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Header with title */}
          <p className="text-sm font-medium text-gray-500">{title}</p>

          {/* Main Value and Trend */}
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-1">
              <p className="text-2xl font-bold">
                {formatValue(
                  mainValue.value,
                  isCurrency
                    ? "currency"
                    : isPercentage
                    ? "percentage"
                    : undefined
                )}
              </p>
              {mainValue.unit && (
                <span className="text-sm text-gray-500">{mainValue.unit}</span>
              )}
            </div>
            {mainValue.trend !== undefined && (
              <div
                className={`flex items-center space-x-1 ${
                  mainValue.trend >= 0 ? "text-green-500" : "text-red-500"
                }`}
              >
                {mainValue.trend >= 0 ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                <span className="text-sm">
                  {Math.abs(mainValue.trend).toFixed(2)}%
                </span>
              </div>
            )}
          </div>

          {/* Subtitle */}
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}

          {/* Additional Information */}
          {additionalInfo && (
            <div className="space-y-2 border-t pt-2 mt-2">
              {additionalInfo.map((info, index) => (
                <div
                  key={index}
                  className="flex items-baseline justify-between text-sm"
                >
                  <span className="text-gray-500">{info.label}</span>
                  <span
                    className={`${
                      info.highlight
                        ? "font-semibold text-gray-900"
                        : "text-gray-600"
                    }`}
                  >
                    {typeof info.value === "number"
                      ? formatValue(
                          info.value,
                          isCurrency ? "currency" : undefined
                        )
                      : info.value}
                    {info.unit && ` ${info.unit}`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StatsCard;
