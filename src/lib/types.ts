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
  total_invoices: number;
  other_channel: number;
  counter_service: number;
  total_paid: number;
  total_debt: number;
}

export interface CumulativeData {
  name: string;
  cumulativeValue: number;
  monthly: {
    [key: string]: number;
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

export interface StatsCardProps {
  title: string;
  mainValue: {
    value: number;
    unit?: string;
    trend?: number;
  };
  subtitle?: string;
  additionalInfo?: Array<{
    label: string;
    value: number | string;
    unit?: string;
    highlight?: boolean;
  }>;
  isCurrency?: boolean;
  isPercentage?: boolean;
}