'use client';

import { useMemo } from 'react';
import { Receipt, Calculator, CalendarDays, TrendingUp, Calendar, Flame } from 'lucide-react';
import { Transaction } from '@/types/transaction';
import { formatCurrency, formatDate } from '@/lib/utils';
import { CategoryLabel } from '@/components/ui/CategoryLabel';

interface KeyMetricsProps {
    transactions: Transaction[];
    totalExpense: number;
    daysInPeriod: number;
    expenseTransactionCount: number;
    dateRange: { start: Date; end: Date };
}

export function KeyMetrics({
    transactions,
    totalExpense,
    daysInPeriod,
    expenseTransactionCount,
    dateRange,
}: KeyMetricsProps) {
    const avgPerTransaction = expenseTransactionCount > 0
        ? totalExpense / expenseTransactionCount
        : 0;
    const avgPerDay = daysInPeriod > 0
        ? totalExpense / daysInPeriod
        : 0;

    // Top 3 largest expense transactions
    const top3Transactions = useMemo(() => {
        return [...transactions]
            .filter(t => t.type === 'expense')
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 3);
    }, [transactions]);

    // Highest spending day
    const highestSpendingDay = useMemo(() => {
        const expenseTransactions = transactions.filter(t => t.type === 'expense');
        const dailyTotals: Record<string, { date: Date; total: number; transactions: Transaction[] }> = {};

        expenseTransactions.forEach(t => {
            const dateKey = t.date.toDateString();
            if (!dailyTotals[dateKey]) {
                dailyTotals[dateKey] = { date: t.date, total: 0, transactions: [] };
            }
            dailyTotals[dateKey].total += t.amount;
            dailyTotals[dateKey].transactions.push(t);
        });

        const days = Object.values(dailyTotals);
        if (days.length === 0) return null;

        const highest = days.reduce((max, day) => day.total > max.total ? day : max, days[0]);
        // Get the largest transaction of that day
        const largestTransaction = highest.transactions.sort((a, b) => b.amount - a.amount)[0];
        return { ...highest, largestTransaction };
    }, [transactions]);

    // First 15 days vs Last 15 days
    const halfPeriodStats = useMemo(() => {
        const midPoint = new Date((dateRange.start.getTime() + dateRange.end.getTime()) / 2);

        const firstHalf = transactions.filter(t =>
            t.type === 'expense' && t.date < midPoint
        );
        const secondHalf = transactions.filter(t =>
            t.type === 'expense' && t.date >= midPoint
        );

        return {
            first15: firstHalf.reduce((sum, t) => sum + t.amount, 0),
            last15: secondHalf.reduce((sum, t) => sum + t.amount, 0),
        };
    }, [transactions, dateRange]);

    return (
        <div className="glass-card">
            <div className="p-4 border-b border-[var(--color-border)]">
                <h3 className="font-semibold">Chỉ Số Theo Dõi</h3>
            </div>
            <div className="p-4 space-y-4">
                {/* Basic metrics */}
                <div className="grid grid-cols-3 gap-3">
                    <div className="text-center p-3 rounded-lg bg-[var(--color-surface-hover)]">
                        <Receipt className="w-5 h-5 mx-auto mb-1 text-[var(--color-primary)]" />
                        <p className="text-xs text-[var(--color-text-muted)]">Số GD</p>
                        <p className="font-bold">{transactions.length}</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-[var(--color-surface-hover)]">
                        <Calculator className="w-5 h-5 mx-auto mb-1 text-[var(--color-warning)]" />
                        <p className="text-xs text-[var(--color-text-muted)]">TB/GD</p>
                        <p className="font-bold text-sm">{formatCurrency(avgPerTransaction)}</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-[var(--color-surface-hover)]">
                        <CalendarDays className="w-5 h-5 mx-auto mb-1 text-[var(--color-info)]" />
                        <p className="text-xs text-[var(--color-text-muted)]">TB/ngày</p>
                        <p className="font-bold text-sm">{formatCurrency(avgPerDay)}</p>
                    </div>
                </div>

                {/* First 15 days vs Last 15 days */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-[var(--color-surface-hover)]">
                        <div className="flex items-center gap-2 mb-1">
                            <Calendar className="w-4 h-4 text-[var(--color-success)]" />
                            <span className="text-xs text-[var(--color-text-muted)]">Nửa đầu tháng</span>
                        </div>
                        <p className="font-bold text-[var(--color-danger)]">
                            {formatCurrency(halfPeriodStats.first15)}
                        </p>
                    </div>
                    <div className="p-3 rounded-lg bg-[var(--color-surface-hover)]">
                        <div className="flex items-center gap-2 mb-1">
                            <Calendar className="w-4 h-4 text-[var(--color-warning)]" />
                            <span className="text-xs text-[var(--color-text-muted)]">Nửa cuối tháng</span>
                        </div>
                        <p className="font-bold text-[var(--color-danger)]">
                            {formatCurrency(halfPeriodStats.last15)}
                        </p>
                    </div>
                </div>

                {/* Highest spending day */}
                {highestSpendingDay && (
                    <div className="p-3 rounded-lg bg-[var(--color-danger-bg)] border border-[var(--color-danger)]/20">
                        <div className="flex items-center gap-2 mb-2">
                            <Flame className="w-4 h-4 text-[var(--color-danger)]" />
                            <span className="text-xs font-medium text-[var(--color-danger)]">
                                Ngày chi cao nhất
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium">{formatDate(highestSpendingDay.date)}</p>
                                <p className="text-xs text-[var(--color-text-muted)]">
                                    {highestSpendingDay.transactions.length} giao dịch
                                </p>
                            </div>
                            <p className="font-bold text-[var(--color-danger)]">
                                {formatCurrency(highestSpendingDay.total)}
                            </p>
                        </div>
                        {highestSpendingDay.largestTransaction && (
                            <div className="mt-2 pt-2 border-t border-[var(--color-danger)]/20">
                                <p className="text-xs text-[var(--color-text-muted)]">GD lớn nhất:</p>
                                <div className="flex items-center justify-between mt-1">
                                    <span className="text-sm truncate flex-1">
                                        {highestSpendingDay.largestTransaction.description || highestSpendingDay.largestTransaction.category}
                                    </span>
                                    <span className="text-sm font-medium text-[var(--color-danger)] ml-2">
                                        {formatCurrency(highestSpendingDay.largestTransaction.amount)}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Top 3 largest transactions */}
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-[var(--color-primary)]" />
                        <span className="text-sm font-medium">Top 3 giao dịch lớn nhất</span>
                    </div>
                    <div className="space-y-2">
                        {top3Transactions.map((t, index) => (
                            <div
                                key={t.id}
                                className="flex items-center gap-3 p-2 rounded-lg bg-[var(--color-surface-hover)]"
                            >
                                <span className="text-xs font-bold text-[var(--color-text-muted)] w-4">
                                    {index + 1}
                                </span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">
                                        {t.description || t.category}
                                    </p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <CategoryLabel category={t.category} size="sm" />
                                        <span className="text-xs text-[var(--color-text-muted)]">
                                            {formatDate(t.date)}
                                        </span>
                                    </div>
                                </div>
                                <span className="font-semibold text-[var(--color-danger)] whitespace-nowrap">
                                    {formatCurrency(t.amount)}
                                </span>
                            </div>
                        ))}
                        {top3Transactions.length === 0 && (
                            <p className="text-sm text-[var(--color-text-muted)] text-center py-2">
                                Chưa có dữ liệu
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
