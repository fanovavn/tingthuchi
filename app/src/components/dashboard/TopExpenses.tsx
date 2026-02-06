'use client';

import { useState, useMemo } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Transaction } from '@/types/transaction';
import { formatCurrency } from '@/lib/utils';
import { CategoryLabel } from '@/components/ui/CategoryLabel';
import { CategoryTransactionsModal } from './CategoryTransactionsModal';

interface TopExpensesProps {
    currentData: { category: string; amount: number }[];
    previousData: { category: string; amount: number }[];
    transactions: Transaction[];
    previousMonthLabel?: string;
    title?: string;
}

export function TopExpenses({
    currentData,
    previousData,
    transactions,
    previousMonthLabel = "tháng trước",
    title = "Top 10 Khoản Chi"
}: TopExpensesProps) {
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    const totalExpense = useMemo(() =>
        currentData.reduce((sum, item) => sum + item.amount, 0),
        [currentData]
    );

    const previousMap = useMemo(() => {
        const map: Record<string, number> = {};
        previousData.forEach(item => {
            map[item.category] = item.amount;
        });
        return map;
    }, [previousData]);

    const top10 = currentData.slice(0, 10);

    // Filter transactions by selected category
    const categoryTransactions = useMemo(() => {
        if (!selectedCategory) return [];
        return transactions.filter(t => t.category === selectedCategory);
    }, [transactions, selectedCategory]);

    if (top10.length === 0) {
        return (
            <div className="glass-card p-6">
                <h3 className="font-semibold mb-4">{title}</h3>
                <p className="text-[var(--color-text-muted)] text-center py-8">
                    Chưa có dữ liệu
                </p>
            </div>
        );
    }

    return (
        <>
            <div className="glass-card">
                <div className="p-4 border-b border-[var(--color-border)]">
                    <h3 className="font-semibold">{title}</h3>
                </div>
                <div className="divide-y divide-[var(--color-border)]">
                    {top10.map((item, index) => {
                        const percentage = totalExpense > 0 ? (item.amount / totalExpense) * 100 : 0;
                        const previousAmount = previousMap[item.category] || 0;
                        const difference = item.amount - previousAmount;

                        return (
                            <div
                                key={item.category}
                                className="p-3 sm:p-4 hover:bg-[var(--color-surface-hover)] cursor-pointer transition-colors"
                                onClick={() => setSelectedCategory(item.category)}
                            >
                                <div className="flex items-center gap-3">
                                    {/* Rank */}
                                    <span className="text-xs font-bold text-[var(--color-text-muted)] w-5">
                                        {index + 1}
                                    </span>

                                    {/* Category & Amount */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2 mb-1">
                                            <CategoryLabel category={item.category} size="sm" />
                                            <span className="font-semibold text-[var(--color-danger)] whitespace-nowrap">
                                                {formatCurrency(item.amount)}
                                            </span>
                                        </div>

                                        {/* Progress bar & stats */}
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 h-1.5 bg-[var(--color-surface-hover)] rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-[var(--color-danger)] rounded-full transition-all"
                                                    style={{ width: `${Math.min(percentage, 100)}%` }}
                                                />
                                            </div>
                                            <span className="text-xs text-[var(--color-text-muted)] w-12 text-right">
                                                {percentage.toFixed(1)}%
                                            </span>
                                        </div>

                                        {/* Comparison with previous month */}
                                        <div className="flex items-center gap-1 mt-1 flex-wrap">
                                            {difference > 0 ? (
                                                <>
                                                    <TrendingUp className="w-3 h-3 text-[var(--color-danger)]" />
                                                    <span className="text-xs text-[var(--color-danger)]">
                                                        +{formatCurrency(difference)}
                                                    </span>
                                                </>
                                            ) : difference < 0 ? (
                                                <>
                                                    <TrendingDown className="w-3 h-3 text-[var(--color-success)]" />
                                                    <span className="text-xs text-[var(--color-success)]">
                                                        {formatCurrency(difference)}
                                                    </span>
                                                </>
                                            ) : (
                                                <>
                                                    <Minus className="w-3 h-3 text-[var(--color-text-muted)]" />
                                                    <span className="text-xs text-[var(--color-text-muted)]">
                                                        Không đổi
                                                    </span>
                                                </>
                                            )}
                                            <span className="text-xs text-[var(--color-text-muted)]">
                                                so với tháng trước
                                            </span>
                                            <span className="text-xs text-[var(--color-text-muted)]">
                                                ({previousMonthLabel} - {formatCurrency(previousAmount)})
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Category Transactions Modal */}
            {selectedCategory && (
                <CategoryTransactionsModal
                    category={selectedCategory}
                    transactions={categoryTransactions}
                    onClose={() => setSelectedCategory(null)}
                />
            )}
        </>
    );
}
