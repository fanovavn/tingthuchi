'use client';

import { TrendingUp, TrendingDown, Wallet, PiggyBank } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { DashboardStats } from '@/types/transaction';

interface SummaryCardsProps {
    stats: DashboardStats;
    loading?: boolean;
}

export function SummaryCards({ stats, loading }: SummaryCardsProps) {
    if (loading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="stat-card">
                        <div className="skeleton h-4 w-20 mb-3" />
                        <div className="skeleton h-8 w-32" />
                    </div>
                ))}
            </div>
        );
    }

    const savingsRate = stats.totalIncome > 0
        ? ((stats.totalIncome - stats.totalExpense) / stats.totalIncome) * 100
        : 0;

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
        {
            title: 'Chỉ Số Dư Dả',
            value: savingsRate,
            icon: PiggyBank,
            type: 'savings' as const,
            description: `${savingsRate.toFixed(1)}% thu nhập`,
            isPercent: true,
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
            {cards.map((card) => {
                let colorClass = '';
                let bgClass = '';

                switch (card.type) {
                    case 'income':
                        colorClass = 'text-[var(--color-success)]';
                        bgClass = 'bg-[var(--color-success-bg)]';
                        break;
                    case 'expense':
                        colorClass = 'text-[var(--color-danger)]';
                        bgClass = 'bg-[var(--color-danger-bg)]';
                        break;
                    case 'balance':
                        colorClass = 'text-[var(--color-primary)]';
                        bgClass = 'bg-[rgba(99,102,241,0.1)]';
                        break;
                    case 'savings':
                        colorClass = 'text-[var(--color-warning)]';
                        bgClass = 'bg-[rgba(245,158,11,0.1)]';
                        break;
                }

                return (
                    <div key={card.title} className={`stat-card ${card.type} hover-lift`}>
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm text-[var(--color-text-secondary)]">
                                {card.title}
                            </span>
                            <div className={`p-2 rounded-lg ${bgClass}`}>
                                <card.icon className={`w-5 h-5 ${colorClass}`} />
                            </div>
                        </div>
                        <div className={`text-2xl font-bold mb-1 ${colorClass}`}>
                            {card.isPercent ? `${card.value.toFixed(1)}%` : formatCurrency(card.value)}
                        </div>
                        <p className="text-xs text-[var(--color-text-muted)]">
                            {card.description}
                        </p>
                    </div>
                );
            })}
        </div>
    );
}
