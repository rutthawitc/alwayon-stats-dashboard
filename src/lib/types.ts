// src/lib/types.ts
export interface StatisticsData {
  ba_code: number;
  org_name: string;
  cnt_count: number;
  cnt_other: number;
  cnt_paid: number;
  cnt_inv: number;
  cnt_debt: number;
  sm_debt: number;
  debt_ym: string;
  data_date: string;
}

export interface ChartData {
  name: string;
  value: number;
  total_invoices: number; // รวมใบแจ้งหนี้
  other_channel: number; // ช่องทางอื่นๆ
  counter_service: number; // เคาท์เตอร์ประปา
  total_paid: number; // รวมชำระ
  total_debt: number; // ค้างชำระ
}

// สำหรับ StatsCard
export interface StatsCardProps {
  title: string;
  value: number;
  trend?: number;
  subtitle?: string;
  isCurrency?: boolean;
  isPercentage?: boolean;
}

export interface CumulativeData {
  name: string;
  cumulativeValue: number;
  monthly: {
    [key: string]: number; // เช่น { "October": 1000, "November": 2000 }
  };
}

export interface StatsOverview {
  overview: {
    total_invoices: number;
    total_counter: number;
    total_other: number;
    counter_percentage: number;
    other_percentage: number;
    trend: number;
    data_date: string;
  };
  payment_stats: {
    total_paid: number;
    total_debt: number;
    paid_percentage: number;
    debt_percentage: number;
  };
  top_branch: {
    name: string;
    percentage: number;
    total_invoices: number;
  };
}
