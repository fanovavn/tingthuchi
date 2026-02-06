'use client';

import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { DashboardStats } from '@/types/transaction';

interface SummaryCardsProps {
    stats: DashboardStats;
    loading?: boolean;
}

export function SummaryCards({ stats, loading }: SummaryCardsProps) {
    if (loading) {
        return (
            <div className="grid-dashboard">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="stat-card">
                        <div className="skeleton h-4 w-20 mb-3" />
                        <div className="skeleton h-8 w-32" />
                    </div>
                ))}
            </div>
        );
    }

    const cards = [
        {
            title: 'Tổng Thu Nhập',
            value: stats.totalIncome,
            icon: TrendingUp,
            type: 'income' as const,
            description: 'Tổng số tiền thu được',
        },
        {
            title: 'Tổng Chi Tiêu',
            value: stats.totalExpense,
            icon: TrendingDown,
            type: 'expense' as const,
            description: 'Tổng số tiền đã chi',
        },
        {
            title: 'Chênh Lệch',
            value: stats.balance,
            icon: Wallet,
            type: 'balance' as const,
            description: `${stats.transactionCount} giao dịch`,
        },
    ];

    return (
        <div className="grid-dashboard">
            {cards.map((card) => (
                <div key={card.title} className={`stat-card ${card.type} hover-lift`}>
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-sm text-[var(--color-text-secondary)]">
                            {card.title}
                        </span>
                        <div
                            className={`p-2 rounded-lg ${card.type === 'income'
                                ? 'bg-[var(--color-success-bg)]'
                                : card.type === 'expense'
                                    ? 'bg-[var(--color-danger-bg)]'
                                    : 'bg-[rgba(99,102,241,0.1)]'
                                }`}
                        >
                            <card.icon
                                className={`w-5 h-5 ${card.type === 'income'
                                    ? 'text-[var(--color-success)]'
                                    : card.type === 'expense'
                                        ? 'text-[var(--color-danger)]'
                                        : 'text-[var(--color-primary)]'
                                    }`}
                            />
                        </div>
                    </div>
                    <div
                        className={`text-2xl font-bold mb-1 ${card.type === 'income'
                            ? 'text-[var(--color-success)]'
                            : card.type === 'expense'
                                ? 'text-[var(--color-danger)]'
                                : 'text-[var(--color-primary)]'
                            }`}
                    >
                        {formatCurrency(card.value)}
                    </div>
                    <p className="text-xs text-[var(--color-text-muted)]">
                        {card.description}
                    </p>
                </div>
            ))}
        </div>
    );
}
