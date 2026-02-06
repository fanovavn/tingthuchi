'use client';

import { useState, useMemo } from 'react';
import { X, ChevronLeft, ChevronRight, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Transaction } from '@/types/transaction';
import { formatCurrency, formatDate } from '@/lib/utils';
import { CategoryLabel } from '@/components/ui/CategoryLabel';

interface CategoryTransactionsModalProps {
    category: string;
    transactions: Transaction[];
    onClose: () => void;
}

export function CategoryTransactionsModal({
    category,
    transactions,
    onClose,
}: CategoryTransactionsModalProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 20;

    // Sort by newest first
    const sortedTransactions = useMemo(() => {
        return [...transactions].sort((a, b) => b.date.getTime() - a.date.getTime());
    }, [transactions]);

    const totalPages = Math.ceil(sortedTransactions.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const currentTransactions = sortedTransactions.slice(startIndex, endIndex);

    const totalAmount = useMemo(() =>
        transactions.reduce((sum, t) => sum + t.amount, 0),
        [transactions]
    );

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div
                className="modal-content max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)]">
                    <div>
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                            Chi tiết danh mục
                            <CategoryLabel category={category} />
                        </h3>
                        <p className="text-sm text-[var(--color-text-muted)] mt-1">
                            {transactions.length} giao dịch • Tổng: {formatCurrency(totalAmount)}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-[var(--color-surface-hover)] rounded-lg"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Transaction List */}
                <div className="flex-1 overflow-y-auto">
                    <div className="divide-y divide-[var(--color-border)]">
                        {currentTransactions.map((transaction) => (
                            <div
                                key={transaction.id}
                                className="flex items-center justify-between p-4 hover:bg-[var(--color-surface-hover)]"
                            >
                                <div className="flex items-center gap-3 min-w-0 flex-1">
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
                                    <div className="min-w-0 flex-1">
                                        <p className="font-medium truncate">
                                            {transaction.description || transaction.category}
                                        </p>
                                        <span className="text-xs text-[var(--color-text-muted)]">
                                            {formatDate(transaction.date)}
                                        </span>
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

                    {sortedTransactions.length === 0 && (
                        <div className="p-8 text-center text-[var(--color-text-muted)]">
                            Không có giao dịch
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between p-4 border-t border-[var(--color-border)] text-sm">
                        <p className="text-[var(--color-text-muted)]">
                            {startIndex + 1}-{Math.min(endIndex, sortedTransactions.length)} / {sortedTransactions.length}
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-2 hover:bg-[var(--color-surface-hover)] rounded-lg disabled:opacity-50"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <span className="px-3 py-1 bg-[var(--color-surface-hover)] rounded">
                                {currentPage}/{totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="p-2 hover:bg-[var(--color-surface-hover)] rounded-lg disabled:opacity-50"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
