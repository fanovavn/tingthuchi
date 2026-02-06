'use client';

import Link from 'next/link';
import { Transaction } from '@/types/transaction';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ArrowUpRight, ArrowDownRight, ArrowRight } from 'lucide-react';
import { CategoryLabel } from '@/components/ui/CategoryLabel';

interface RecentTransactionsProps {
    transactions: Transaction[];
    limit?: number;
    dateFilter?: { start: Date; end: Date };
}

export function RecentTransactions({ transactions, limit = 5, dateFilter }: RecentTransactionsProps) {
    // Sort by date descending (newest first)
    const sortedTransactions = [...transactions]
        .sort((a, b) => b.date.getTime() - a.date.getTime())
        .slice(0, limit);

    // Build URL with date filter
    const buildTransactionsUrl = () => {
        if (dateFilter) {
            const params = new URLSearchParams({
                start: dateFilter.start.toISOString(),
                end: dateFilter.end.toISOString(),
            });
            return `/transactions?${params.toString()}`;
        }
        return '/transactions';
    };

    return (
        <div className="glass-card">
            <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)]">
                <h3 className="font-semibold">Giao Dịch Gần Đây</h3>
                <Link
                    href={buildTransactionsUrl()}
                    className="text-sm text-[var(--color-primary)] hover:underline flex items-center gap-1"
                >
                    Xem tất cả
                    <ArrowRight className="w-4 h-4" />
                </Link>
            </div>

            {sortedTransactions.length === 0 ? (
                <div className="p-8 text-center text-[var(--color-text-muted)]">
                    Chưa có giao dịch nào
                </div>
            ) : (
                <div className="divide-y divide-[var(--color-border)]">
                    {sortedTransactions.map((transaction) => (
                        <div
                            key={transaction.id}
                            className="flex items-center justify-between p-4 hover:bg-[var(--color-surface-hover)]"
                        >
                            <div className="flex items-center gap-3 min-w-0">
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${transaction.type === 'income'
                                        ? 'bg-[var(--color-success-bg)]'
                                        : 'bg-[var(--color-danger-bg)]'
                                        }`}
                                >
                                    {transaction.type === 'income' ? (
                                        <ArrowUpRight className="w-5 h-5 text-[var(--color-success)]" />
                                    ) : (
                                        <ArrowDownRight className="w-5 h-5 text-[var(--color-danger)]" />
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <p className="font-medium truncate">
                                        {transaction.description || transaction.category}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <CategoryLabel category={transaction.category} size="sm" />
                                        <span className="text-xs text-[var(--color-text-muted)]">
                                            {formatDate(transaction.date)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div
                                className={`font-semibold whitespace-nowrap ${transaction.type === 'income'
                                    ? 'text-[var(--color-success)]'
                                    : 'text-[var(--color-danger)]'
                                    }`}
                            >
                                {transaction.type === 'income' ? '+' : '-'}
                                {formatCurrency(transaction.amount)}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
