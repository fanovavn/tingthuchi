'use client';

import { useState, useMemo } from 'react';
import { Transaction } from '@/types/transaction';
import { processYearlyData } from '@/components/year-summary/YearlyAnalytics';
import { YearSelector } from '@/components/year-summary/YearSelector';
import { YearlyKPIs } from '@/components/year-summary/YearlyKPIs';
import { MonthlyTrendsChart } from '@/components/year-summary/MonthlyTrendsChart';
import { CategoryChart, IncomeCategoryChart } from '@/components/dashboard';
import { KeyHighlights } from '@/components/year-summary/KeyHighlights';
import { ActivityHeatmap } from '@/components/year-summary/ActivityHeatmap';
import { InsightSummary } from '@/components/year-summary/InsightSummary';
import { getYear } from 'date-fns';

interface YearSummaryClientProps {
    transactions: Transaction[];
}

export function YearSummaryClient({ transactions }: YearSummaryClientProps) {
    // Get unique years from transactions
    const availableYears = useMemo(() => {
        const years = new Set(transactions.map(t => getYear(new Date(t.date))));
        return Array.from(years).sort((a, b) => b - a);
    }, [transactions]);

    const currentYear = new Date().getFullYear();
    const [selectedYear, setSelectedYear] = useState<number>(availableYears[0] || currentYear);

    // Process data for selected year and previous year
    const stats = useMemo(() => processYearlyData(transactions, selectedYear), [transactions, selectedYear]);
    const prevStats = useMemo(() => processYearlyData(transactions, selectedYear - 1), [transactions, selectedYear]);

    return (
        <div className="space-y-8">
            {/* Header & Filter */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold gradient-text">
                        Tổng Kết Năm {selectedYear}
                    </h1>
                    <p className="text-[var(--color-text-secondary)] text-sm mt-1">
                        Nhìn lại hành trình tài chính của bạn trong suốt một năm qua.
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <YearSelector
                        years={availableYears}
                        selectedYear={selectedYear}
                        onChange={setSelectedYear}
                    />
                </div>
            </div>

            {/* KPI Cards */}
            <YearlyKPIs
                currentYearData={{
                    totalIncome: stats.totalIncome,
                    totalExpense: stats.totalExpense,
                    netIncome: stats.netIncome,
                    savingsRate: stats.savingsRate,
                }}
                prevYearData={{
                    totalIncome: prevStats.totalIncome,
                    totalExpense: prevStats.totalExpense,
                    netIncome: prevStats.netIncome,
                    savingsRate: prevStats.savingsRate,
                }}
            />

            {/* Main Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <MonthlyTrendsChart data={stats.monthlyData} />
                </div>
                <div className="lg:col-span-1">
                    <InsightSummary stats={stats} />
                </div>
            </div>

            {/* Categorization Breakdown */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <IncomeCategoryChart
                    data={stats.topIncomeSources.map(s => ({ category: s.source, amount: s.amount }))}
                    title="Nguồn Thu Nhập"
                />
                <CategoryChart
                    data={stats.topExpenseCategories}
                    title="Phân Bổ Chi Tiêu"
                />
            </div>

            {/* Highlights Grid */}
            <div className="py-2">
                <h2 className="text-xl font-bold mb-4">Điểm Nhấn Trong Năm</h2>
                <KeyHighlights highlights={stats.highlights} />
            </div>

            {/* Heatmap */}
            <ActivityHeatmap data={stats.heatmapData} year={selectedYear} />
        </div>
    );
}
