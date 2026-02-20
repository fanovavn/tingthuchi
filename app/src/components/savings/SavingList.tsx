'use client';

import { SavingTransaction } from '@/types/saving';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';

interface SavingListProps {
    savings: SavingTransaction[];
    onView: (saving: SavingTransaction) => void;
}

export function SavingList({ savings, onView }: SavingListProps) {
    if (savings.length === 0) {
        return (
            <div className="glass-card p-8 text-center">
                <p className="text-[var(--color-text-muted)]">Chưa có giao dịch tiết kiệm</p>
            </div>
        );
    }

    return (
        <div className="glass-card">
            <div className="divide-y divide-[var(--color-border)]">
                {savings.map((saving) => {
                    const isDeposit = saving.type === 'deposit';
                    return (
                        <div
                            key={saving.id}
                            className="p-3 sm:p-4 hover:bg-[var(--color-surface-hover)] cursor-pointer transition-colors"
                            onClick={() => onView(saving)}
                        >
                            <div className="flex items-center gap-3">
                                {/* Icon */}
                                <div
                                    className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${isDeposit
                                            ? 'bg-[var(--color-success-bg)]'
                                            : 'bg-[var(--color-danger-bg)]'
                                        }`}
                                >
                                    {isDeposit ? (
                                        <ArrowDownToLine className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--color-success)]" />
                                    ) : (
                                        <ArrowUpFromLine className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--color-danger)]" />
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0 flex-1">
                                            <p className="font-medium text-sm sm:text-base line-clamp-1">
                                                {saving.note || (isDeposit ? 'Gửi tiết kiệm' : 'Rút tiết kiệm')}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span
                                                    className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${isDeposit
                                                            ? 'bg-[var(--color-success-bg)] text-[var(--color-success)]'
                                                            : 'bg-[var(--color-danger-bg)] text-[var(--color-danger)]'
                                                        }`}
                                                >
                                                    {isDeposit ? 'Gửi vào' : 'Rút ra'}
                                                </span>
                                                <span className="text-xs text-[var(--color-text-muted)]">
                                                    {formatDate(saving.date)}
                                                </span>
                                            </div>
                                        </div>
                                        <span
                                            className={`font-semibold text-sm sm:text-base whitespace-nowrap ${isDeposit
                                                    ? 'text-[var(--color-success)]'
                                                    : 'text-[var(--color-danger)]'
                                                }`}
                                        >
                                            {isDeposit ? '+' : '-'}{formatCurrency(saving.amount)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
