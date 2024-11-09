// src/lib/formatters.ts

// src/lib/formatters.ts

// Formatting utilities
export const formatNumber = (
  value: number,
  type: "currency" | "percentage" | "number" = "number"
): string => {
  switch (type) {
    case "currency":
      return new Intl.NumberFormat("th-TH", {
        style: "currency",
        currency: "THB",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);
    case "percentage":
      return new Intl.NumberFormat("th-TH", {
        style: "percent",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value / 100);
    default:
      return new Intl.NumberFormat("th-TH").format(value);
  }
};

const thaiMonths = [
  "มกราคม",
  "กุมภาพันธ์",
  "มีนาคม",
  "เมษายน",
  "พฤษภาคม",
  "มิถุนายน",
  "กรกฎาคม",
  "สิงหาคม",
  "กันยายน",
  "ตุลาคม",
  "พฤศจิกายน",
  "ธันวาคม",
];

export const formatThaiDate = (
  dateString: string | undefined | null
): string => {
  // ถ้าไม่มีค่าวันที่ ให้ return วันที่ปัจจุบัน
  if (!dateString) {
    const today = new Date();
    const thaiYear = today.getFullYear() + 543;
    return `${today.getDate()} ${thaiMonths[today.getMonth()]} ${thaiYear}`;
  }

  let date: Date;

  try {
    if (dateString.includes("T")) {
      // รูปแบบ ISO date string (2024-02-20T15:30:00)
      date = new Date(dateString);
    } else if (dateString.includes("/")) {
      // รูปแบบ dd/mm/yyyy HH:mm:ss
      const [datePart, timePart = ""] = dateString.split(" ");
      const [day, month, year] = datePart.split("/");
      if (timePart) {
        date = new Date(`${year}-${month}-${day}T${timePart}`);
      } else {
        date = new Date(`${year}-${month}-${day}`);
      }
    } else {
      // ถ้าไม่ตรงกับรูปแบบใดๆ ให้ใช้วันที่ปัจจุบัน
      date = new Date();
    }

    // ตรวจสอบว่า date เป็น valid date
    if (isNaN(date.getTime())) {
      throw new Error("Invalid date");
    }
  } catch (error) {
    console.error("Error parsing date:", error);
    date = new Date(); // ใช้วันที่ปัจจุบันถ้าแปลงวันที่ไม่สำเร็จ
  }

  const thaiYear = date.getFullYear() + 543;
  return `${date.getDate()} ${thaiMonths[date.getMonth()]} ${thaiYear}`;
};

export const formatThaiDateTime = (
  dateString: string | undefined | null
): string => {
  if (!dateString) {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");
    return `${formatThaiDate(null)} เวลา ${hours}:${minutes} น.`;
  }

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      throw new Error("Invalid date");
    }

    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${formatThaiDate(dateString)} เวลา ${hours}:${minutes} น.`;
  } catch (error) {
    console.error("Error formatting date time:", error);
    return formatThaiDateTime(null); // ใช้เวลาปัจจุบันถ้าแปลงวันที่ไม่สำเร็จ
  }
};

export const getThaiMonth = (monthName: string | undefined | null): string => {
  if (!monthName) return "ไม่ระบุเดือน";

  const monthMap: { [key: string]: string } = {
    January: "มกราคม",
    February: "กุมภาพันธ์",
    March: "มีนาคม",
    April: "เมษายน",
    May: "พฤษภาคม",
    June: "มิถุนายน",
    July: "กรกฎาคม",
    August: "สิงหาคม",
    September: "กันยายน",
    October: "ตุลาคม",
    November: "พฤศจิกายน",
    December: "ธันวาคม",
  };
  return monthMap[monthName] || monthName;
};

export const getThaiYear = (date: string | undefined | null): string => {
  if (!date) {
    return (new Date().getFullYear() + 543).toString();
  }

  try {
    const year = date.split(" ")[0].split("/")[2];
    return (parseInt(year) + 543).toString();
  } catch (error) {
    console.error("Error getting Thai year:", error);
    return (new Date().getFullYear() + 543).toString();
  }
};

// เพิ่มฟังก์ชันใหม่สำหรับตรวจสอบความถูกต้องของวันที่
export const isValidDate = (dateString: string): boolean => {
  try {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  } catch {
    return false;
  }
};

// เพิ่มฟังก์ชันใหม่สำหรับแปลงวันที่เป็นรูปแบบมาตรฐาน
export const standardizeDate = (dateString: string): string => {
  try {
    if (dateString.includes("/")) {
      const [datePart, timePart = ""] = dateString.split(" ");
      const [day, month, year] = datePart.split("/");
      if (timePart) {
        return `${year}-${month.padStart(2, "0")}-${day.padStart(
          2,
          "0"
        )}T${timePart}`;
      }
      return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    }
    return dateString;
  } catch (error) {
    console.error("Error standardizing date:", error);
    return new Date().toISOString();
  }
};
