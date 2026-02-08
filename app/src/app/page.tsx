'use client';

import { useEffect, useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { subMonths, differenceInDays, format } from 'date-fns';
import { useTransactions } from '@/hooks/useTransactions';
import { useDateFilter } from '@/hooks/useDateFilter';
import {
  SummaryCards,
  DailyTransactionsTable,
  DailyTransactionsModal,
  CategoryChart,
  IncomeCategoryChart,

  DateRangeFilter,
  RecentTransactions,
  TopExpenses,
  KeyMetrics,
} from '@/components/dashboard';

export default function DashboardPage() {
  const router = useRouter();
  const {
    transactions,
    loading,
    loadFromExcel,
    getStats,
    filterTransactions,
  } = useTransactions();

  // Find data date range
  const dataDateRange = useMemo(() => {
    if (transactions.length === 0) return undefined;
    const dates = transactions.map((t) => t.date.getTime());
    return {
      min: new Date(Math.min(...dates)),
      max: new Date(Math.max(...dates)),
    };
  }, [transactions]);

  // Use persisted date filter
  const { dateRange, setDateRange } = useDateFilter({ dataDateRange });

  // Auto-load sample data on first visit
  useEffect(() => {
    if (!loading && transactions.length === 0) {
      loadFromExcel();
    }
  }, [loading, transactions.length, loadFromExcel]);

  // Filter transactions by date range
  const filteredTransactions = useMemo(() => {
    return filterTransactions({
      startDate: dateRange.start,
      endDate: dateRange.end,
    });
  }, [filterTransactions, dateRange]);

  // Previous month transactions for comparison
  const previousMonthTransactions = useMemo(() => {
    const prevEnd = subMonths(dateRange.end, 1);
    const prevStart = subMonths(dateRange.start, 1);

    return filterTransactions({
      startDate: prevStart,
      endDate: prevEnd,
    });
  }, [filterTransactions, dateRange]);

  // Label for previous month (e.g., "01/2026")
  const previousMonthLabel = useMemo(() => {
    const prevDate = subMonths(dateRange.start, 1);
    return format(prevDate, 'MM/yyyy');
  }, [dateRange]);

  const stats = useMemo(() => getStats(filteredTransactions), [getStats, filteredTransactions]);

  // Expense category breakdown
  const expenseCategoryBreakdown = useMemo(() => {
    const filtered = filteredTransactions.filter((t) => t.type === 'expense');
    const breakdown: Record<string, number> = {};
    filtered.forEach((t) => {
      breakdown[t.category] = (breakdown[t.category] || 0) + t.amount;
    });
    return Object.entries(breakdown)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);
  }, [filteredTransactions]);

  // Previous month expense breakdown for comparison
  const previousExpenseBreakdown = useMemo(() => {
    const filtered = previousMonthTransactions.filter((t) => t.type === 'expense');
    const breakdown: Record<string, number> = {};
    filtered.forEach((t) => {
      breakdown[t.category] = (breakdown[t.category] || 0) + t.amount;
    });
    return Object.entries(breakdown)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);
  }, [previousMonthTransactions]);

  // Income category breakdown
  const incomeCategoryBreakdown = useMemo(() => {
    const filtered = filteredTransactions.filter((t) => t.type === 'income');
    const breakdown: Record<string, number> = {};
    filtered.forEach((t) => {
      breakdown[t.category] = (breakdown[t.category] || 0) + t.amount;
    });
    return Object.entries(breakdown)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);
  }, [filteredTransactions]);

  const trendData = useMemo(() => {
    const grouped: Record<string, { income: number; expense: number; count: number; date: Date }> = {};
    filteredTransactions.forEach((t) => {
      // Use YYYY-MM-DD as key for grouping
      const key = format(t.date, 'yyyy-MM-dd');
      if (!grouped[key]) {
        grouped[key] = {
          income: 0,
          expense: 0,
          count: 0,
          date: t.date
        };
      }
      if (t.type === 'income') {
        grouped[key].income += t.amount;
      } else {
        grouped[key].expense += t.amount;
      }
      grouped[key].count += 1;
    });
    return Object.values(grouped);
  }, [filteredTransactions]);

  // Calculate days in current period
  const daysInPeriod = useMemo(() => {
    return differenceInDays(dateRange.end, dateRange.start) + 1;
  }, [dateRange]);

  // Count expense transactions
  const expenseTransactionCount = useMemo(() => {
    return filteredTransactions.filter(t => t.type === 'expense').length;
  }, [filteredTransactions]);

  // State for daily transactions modal
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Filter transactions for the selected date
  const selectedDateTransactions = useMemo(() => {
    if (!selectedDate) return [];
    return filteredTransactions.filter(t =>
      t.date.getDate() === selectedDate.getDate() &&
      t.date.getMonth() === selectedDate.getMonth() &&
      t.date.getFullYear() === selectedDate.getFullYear()
    );
  }, [selectedDate, filteredTransactions]);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-[var(--color-text-muted)]">
            Tổng quan tài chính của bạn
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <DateRangeFilter
            startDate={dateRange.start}
            endDate={dateRange.end}
            onChange={(start, end) => setDateRange({ start, end })}
            dataDateRange={dataDateRange}
          />
          <button
            onClick={() => router.push('/transactions/add?returnUrl=/')}
            className="btn btn-primary"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Thêm giao dịch</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <SummaryCards stats={stats} loading={loading} />

      {/* Category Charts - Side by side */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        <IncomeCategoryChart
          data={incomeCategoryBreakdown}
          title="Phân Loại Thu Nhập"
        />
        <CategoryChart
          data={expenseCategoryBreakdown}
          title="Phân Loại Chi Tiêu"
        />
      </div>

      {/* Top Expenses & Key Metrics - Side by side */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        <TopExpenses
          currentData={expenseCategoryBreakdown}
          previousData={previousExpenseBreakdown}
          previousMonthLabel={previousMonthLabel}
          transactions={filteredTransactions}
        />
        <KeyMetrics
          transactions={filteredTransactions}
          totalExpense={stats.totalExpense}
          daysInPeriod={daysInPeriod}
          expenseTransactionCount={expenseTransactionCount}
          dateRange={dateRange}
        />
      </div>

      {/* Daily Transactions Table - Full width */}
      <DailyTransactionsTable
        data={trendData}
        title="Thu Chi Theo Ngày"
        onRowClick={(date) => setSelectedDate(date)}
      />

      {/* Recent Transactions */}
      <RecentTransactions
        transactions={filteredTransactions}
        limit={5}
        dateFilter={dateRange}
      />

      {/* Daily Transactions Modal */}
      {selectedDate && (
        <DailyTransactionsModal
          date={selectedDate}
          transactions={selectedDateTransactions}
          onClose={() => setSelectedDate(null)}
        />
      )}
    </div>
  );
}
