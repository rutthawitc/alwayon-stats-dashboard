// src/lib/calculations.ts

import { StatisticsData } from "./types";
import { formatNumber } from "@/lib/formatters";
import { ChartData } from '@/lib/types';

const branchMap = new Map<string, ChartData>();

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

  const trend =
    monthlyOverview.otherPercentage !== 0
      ? ((dailyOverview.otherPercentage - monthlyOverview.otherPercentage) /
          monthlyOverview.otherPercentage) *
        100
      : 0;

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
    total_paid: branch.cnt_paid,
    total_debt: branch.cnt_debt,
  }));

  return [
    ...chartData,
    {
      name: "ภาพรวมเขต",
      value: regionOverview.otherPercentage,
      total_invoices: regionOverview.cnt_inv,
      other_channel: regionOverview.cnt_other,
      counter_service: regionOverview.cnt_count,
      total_paid: regionOverview.cnt_paid,
      total_debt: regionOverview.cnt_debt,
    },
  ];
};

// เพิ่มฟังก์ชัน calculateCumulativeStats
export const calculateCumulativeStats = (
  allMonthlyData: StatisticsData[][]
) => {
  const branchMap = new Map<string, ChartData>();

  allMonthlyData.forEach((monthData) => {
    monthData.forEach((branchData) => {
      const existing = branchMap.get(branchData.org_name);
      if (!existing) {
        branchMap.set(branchData.org_name, {
          name: branchData.org_name,
          value: 0,
          total_invoices: 0,
          other_channel: 0,
          counter_service: 0,
          total_paid: 0,
          total_debt: 0,
        });
      }

      const current = branchMap.get(branchData.org_name)!;
      current.total_invoices += branchData.cnt_inv;
      current.other_channel += branchData.cnt_other;
      current.counter_service += branchData.cnt_count;
      current.total_paid += branchData.cnt_paid;
      current.total_debt += branchData.cnt_debt;
      current.value = (current.other_channel * 100) / current.total_invoices;
    });
  });

  const totals = Array.from(branchMap.values()).reduce(
    (acc, curr) => ({
      total_invoices: acc.total_invoices + curr.total_invoices,
      other_channel: acc.other_channel + curr.other_channel,
      counter_service: acc.counter_service + curr.counter_service,
      total_paid: acc.total_paid + curr.total_paid,
      total_debt: acc.total_debt + curr.total_debt,
    }),
    {
      total_invoices: 0,
      other_channel: 0,
      counter_service: 0,
      total_paid: 0,
      total_debt: 0,
    }
  );

  
  const regionTotal: ChartData = {
    name: "ภาพรวมเขต",
    value: (totals.other_channel * 100) / totals.total_invoices,
    total_invoices: totals.total_invoices,
    other_channel: totals.other_channel,
    counter_service: totals.counter_service,
    total_paid: totals.total_paid,
    total_debt: totals.total_debt,
  };

  return [...Array.from(branchMap.values()), regionTotal];
};

export const calculateTrend = (current: number, previous: number): number => {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
};

// Mont-byMonth Growth Calculation.

export const calculateMonthlyGrowth = (
  currentMonthData: StatisticsData[],
  previousMonthData: StatisticsData[]
) => {
  return currentMonthData.map((currentBranch) => {
    const previousBranch = previousMonthData.find(
      (branch) => branch.ba_code === currentBranch.ba_code
    );

    const currentPercentage =
      (currentBranch.cnt_other * 100) / currentBranch.cnt_inv;
    const previousPercentage = previousBranch
      ? (previousBranch.cnt_other * 100) / previousBranch.cnt_inv
      : 0;

    return {
      branch: currentBranch.org_name,
      currentMonth: {
        percentage: currentPercentage,
        detail: `${formatNumber(currentBranch.cnt_other)}/${formatNumber(
          currentBranch.cnt_inv
        )}`,
      },
      previousMonth: {
        percentage: previousPercentage,
        detail: previousBranch
          ? `${formatNumber(previousBranch.cnt_other)}/${formatNumber(
              previousBranch.cnt_inv
            )}`
          : "-",
      },
      growth:
        previousPercentage > 0
          ? ((currentPercentage - previousPercentage) / previousPercentage) *
            100
          : 0,
    };
  });
};
