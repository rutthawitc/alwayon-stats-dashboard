import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { validateStatisticsData, validatePercentages } from "@/lib/validation";
import { StatisticsData } from "@/lib/types";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";

interface DataValidationAlertProps {
  data: StatisticsData;
  className?: string;
}

const DataValidationAlert = ({ data, className }: DataValidationAlertProps) => {
  const isDataValid = validateStatisticsData(data);
  const arePercentagesValid = validatePercentages(data);

  if (isDataValid && arePercentagesValid) {
    return null;
  }

  return (
    <Alert variant="destructive" className={className}>
      <ExclamationTriangleIcon className="h-4 w-4" />
      <AlertTitle>พบข้อผิดพลาดในข้อมูล</AlertTitle>
      <AlertDescription>
        <ul className="list-disc pl-4 mt-2">
          {!isDataValid && <li>ข้อมูลไม่ครบถ้วนหรือไม่ถูกต้อง</li>}
          {!arePercentagesValid && <li>การคำนวณเปอร์เซ็นต์ไม่สอดคล้องกัน</li>}
          <li className="text-sm mt-1">
            กรุณาตรวจสอบข้อมูลต้นฉบับและการคำนวณอีกครั้ง
          </li>
        </ul>
      </AlertDescription>
    </Alert>
  );
};

export default DataValidationAlert;
