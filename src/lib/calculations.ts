// src/lib/calculations.ts
import { StatisticsData } from "./types";

// Base calculation functions
export const calculations = {
  calculateCounterPercentage: (cnt_count: number, cnt_inv: number): number => {
    if (cnt_inv === 0) return 0;
    return (cnt_count * 100) / cnt_inv;
  },

  calculateOtherPercentage: (cnt_other: number, cnt_inv: number): number => {
    if (cnt_inv === 0) return 0;
    return (cnt_other * 100) / cnt_inv;
  },

  calculateTotalPaidPercentage: (cnt_paid: number, cnt_inv: number): number => {
    if (cnt_inv === 0) return 0;
    return (cnt_paid * 100) / cnt_inv;
  },

  calculateDebtPercentage: (cnt_debt: number, cnt_inv: number): number => {
    if (cnt_inv === 0) return 0;
    return (cnt_debt * 100) / cnt_inv;
  },
};

// Interfaces
interface RegionTotals {
  cnt_count: number;
  cnt_other: number;
  cnt_paid: number;
  cnt_debt: number;
  cnt_inv: number;
  sm_debt: number;
}

interface RegionPercentages {
  counterPercentage: number;
  otherPercentage: number;
  paidPercentage: number;
  debtPercentage: number;
}

export interface RegionOverview extends RegionTotals, RegionPercentages {
  name: string;
  data_date: string;
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
  water_bill: {
    total: number;
    paid: number;
    debt: number;
  };
  top_branch: {
    name: string;
    percentage: number;
    total_invoices: number;
  };
}

// Main calculation functions
export const calculateRegionOverview = (
  branches: StatisticsData[]
): RegionOverview => {
  // Calculate totals
  const totals = branches.reduce<RegionTotals>(
    (acc, branch) => ({
      cnt_count: acc.cnt_count + branch.cnt_count,
      cnt_other: acc.cnt_other + branch.cnt_other,
      cnt_paid: acc.cnt_paid + branch.cnt_paid,
      cnt_debt: acc.cnt_debt + branch.cnt_debt,
      cnt_inv: acc.cnt_inv + branch.cnt_inv,
      sm_debt: acc.sm_debt + branch.sm_debt,
    }),
    {
      cnt_count: 0,
      cnt_other: 0,
      cnt_paid: 0,
      cnt_debt: 0,
      cnt_inv: 0,
      sm_debt: 0,
    }
  );

  // Calculate percentages
  const percentages: RegionPercentages = {
    counterPercentage: calculations.calculateCounterPercentage(
      totals.cnt_count,
      totals.cnt_inv
    ),
    otherPercentage: calculations.calculateOtherPercentage(
      totals.cnt_other,
      totals.cnt_inv
    ),
    paidPercentage: calculations.calculateTotalPaidPercentage(
      totals.cnt_paid,
      totals.cnt_inv
    ),
    debtPercentage: calculations.calculateDebtPercentage(
      totals.cnt_debt,
      totals.cnt_inv
    ),
  };

  return {
    name: "ภาพรวมเขต",
    data_date: branches[0]?.data_date || new Date().toISOString(),
    ...totals,
    ...percentages,
  };
};

export const calculateStatsOverview = (
  dailyData: StatisticsData[],
  monthlyData: StatisticsData[]
): StatsOverview => {
  const dailyOverview = calculateRegionOverview(dailyData);
  const monthlyOverview = calculateRegionOverview(monthlyData);

  // Calculate trend
  const trend =
    monthlyOverview.otherPercentage !== 0
      ? ((dailyOverview.otherPercentage - monthlyOverview.otherPercentage) /
          monthlyOverview.otherPercentage) *
        100
      : 0;

  // Find top performing branch
  const topBranch = [...dailyData].sort((a, b) => {
    const aPercentage = calculations.calculateOtherPercentage(
      a.cnt_other,
      a.cnt_inv
    );
    const bPercentage = calculations.calculateOtherPercentage(
      b.cnt_other,
      b.cnt_inv
    );
    return bPercentage - aPercentage;
  })[0];

  return {
    overview: {
      total_invoices: dailyOverview.cnt_inv,
      total_counter: dailyOverview.cnt_count,
      total_other: dailyOverview.cnt_other,
      counter_percentage: dailyOverview.counterPercentage,
      other_percentage: dailyOverview.otherPercentage,
      trend: trend,
      data_date: dailyOverview.data_date,
    },
    payment_stats: {
      total_paid: dailyOverview.cnt_paid,
      total_debt: dailyOverview.cnt_debt,
      paid_percentage: dailyOverview.paidPercentage,
      debt_percentage: dailyOverview.debtPercentage,
    },
    water_bill: {
      total: dailyOverview.sm_debt,
      paid: dailyOverview.cnt_paid,
      debt: dailyOverview.cnt_debt,
    },
    top_branch: {
      name: topBranch.org_name,
      percentage: calculations.calculateOtherPercentage(
        topBranch.cnt_other,
        topBranch.cnt_inv
      ),
      total_invoices: topBranch.cnt_inv,
    },
  };
};

// Helper function for chart dat
export const transformToChartData = (data: StatisticsData[]) => {
  const regionOverview = calculateRegionOverview(data);

  const chartData = data.map((branch) => ({
    name: branch.org_name,
    value: calculations.calculateOtherPercentage(
      branch.cnt_other,
      branch.cnt_inv
    ),
    total_invoices: branch.cnt_inv,
    other_channel: branch.cnt_other,
    counter_service: branch.cnt_count,
    total_paid: branch.cnt_paid, // เพิ่ม
    total_debt: branch.cnt_debt, // เพิ่ม
  }));

  return [
    ...chartData,
    {
      name: "ภาพรวมเขต",
      value: regionOverview.otherPercentage,
      total_invoices: regionOverview.cnt_inv,
      other_channel: regionOverview.cnt_other,
      counter_service: regionOverview.cnt_count,
      total_paid: regionOverview.cnt_paid, // เพิ่ม
      total_debt: regionOverview.cnt_debt, // เพิ่ม
    },
  ];
};

// Helper function for trend calculations
export const calculateTrend = (current: number, previous: number): number => {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
};
