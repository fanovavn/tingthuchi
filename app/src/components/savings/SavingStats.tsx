'use client';

import { SavingStats as SavingStatsType } from '@/types/saving';
import { formatCurrency } from '@/lib/utils';
import { ArrowDownToLine, ArrowUpFromLine, Wallet } from 'lucide-react';

interface SavingStatsProps {
    stats: SavingStatsType;
}

export function SavingStats({ stats }: SavingStatsProps) {
    const cards = [
        {
            label: 'Tổng gửi vào',
            value: stats.totalDeposit,
            icon: ArrowDownToLine,
            color: 'var(--color-success)',
            bg: 'var(--color-success-bg)',
        },
        {
            label: 'Tổng rút ra',
            value: stats.totalWithdraw,
            icon: ArrowUpFromLine,
            color: 'var(--color-danger)',
            bg: 'var(--color-danger-bg)',
        },
        {
            label: 'Thực tế còn lại',
            value: stats.balance,
            icon: Wallet,
            color: 'var(--color-primary)',
            bg: 'rgba(99,102,241,0.1)',
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            {cards.map((card) => (
                <div key={card.label} className="glass-card p-4 sm:p-5">
                    <div className="flex items-center gap-3">
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{ background: card.bg }}
                        >
                            <card.icon className="w-5 h-5" style={{ color: card.color }} />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs text-[var(--color-text-muted)]">{card.label}</p>
                            <p
                                className="text-lg sm:text-xl font-bold truncate"
                                style={{ color: card.color }}
                            >
                                {formatCurrency(card.value)}
                            </p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
