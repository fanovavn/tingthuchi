'use client';

import { useState } from 'react';
import { Transaction } from '@/types/transaction';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Eye, Edit2, Trash2, ChevronLeft, ChevronRight, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { CategoryLabel } from '@/components/ui/CategoryLabel';
import { TransactionDetail } from './TransactionDetail';
import { ConfirmDeleteDialog } from './ConfirmDeleteDialog';

interface TransactionTableProps {
    transactions: Transaction[];
    onView?: (transaction: Transaction) => void;
    onEdit?: (transaction: Transaction) => void;
    onDelete?: (id: string) => void;
    pageSize?: number;
}

export function TransactionTable({
    transactions,
    onView,
    onEdit,
    onDelete,
    pageSize = 50,
}: TransactionTableProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const [viewingTransaction, setViewingTransaction] = useState<Transaction | null>(null);

    const totalPages = Math.ceil(transactions.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const currentTransactions = transactions.slice(startIndex, endIndex);

    const handleView = (transaction: Transaction) => {
        if (onView) {
            onView(transaction);
        } else {
            setViewingTransaction(transaction);
        }
    };

    const [deleteId, setDeleteId] = useState<string | null>(null);

    const handleDeleteClick = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setDeleteId(id);
    };

    const handleConfirmDelete = () => {
        if (deleteId && onDelete) {
            onDelete(deleteId);
            setDeleteId(null);
        }
    };

    if (transactions.length === 0) {
        return (
            <div className="glass-card p-8 text-center">
                <p className="text-[var(--color-text-muted)]">Không có giao dịch</p>
            </div>
        );
    }

    return (
        <>
            <ConfirmDeleteDialog
                open={!!deleteId}
                onOpenChange={(open) => !open && setDeleteId(null)}
                onConfirm={handleConfirmDelete}
            />

            {/* Card-style list view */}
            <div className="glass-card">
                <div className="divide-y divide-[var(--color-border)]">
                    {currentTransactions.map((transaction) => (
                        <div
                            key={transaction.id}
                            className="p-3 sm:p-4 hover:bg-[var(--color-surface-hover)] cursor-pointer"
                            onClick={() => handleView(transaction)}
                        >
                            {/* Mobile: Two-row layout */}
                            <div className="flex items-start gap-3">
                                {/* Icon */}
                                <div
                                    className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${transaction.type === 'income'
                                        ? 'bg-[var(--color-success-bg)]'
                                        : 'bg-[var(--color-danger-bg)]'
                                        }`}
                                >
                                    {transaction.type === 'income' ? (
                                        <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--color-success)]" />
                                    ) : (
                                        <ArrowDownRight className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--color-danger)]" />
                                    )}
                                </div>

                                {/* Content - fills remaining space */}
                                <div className="flex-1 min-w-0">
                                    {/* Row 1: Description + Amount */}
                                    <div className="flex items-start justify-between gap-2">
                                        <p className="font-medium text-sm sm:text-base line-clamp-1 flex-1">
                                            {transaction.description || transaction.category}
                                        </p>
                                        <span
                                            className={`font-semibold text-sm sm:text-base whitespace-nowrap ${transaction.type === 'income'
                                                ? 'text-[var(--color-success)]'
                                                : 'text-[var(--color-danger)]'
                                                }`}
                                        >
                                            {transaction.type === 'income' ? '+' : '-'}
                                            {formatCurrency(transaction.amount)}
                                        </span>
                                    </div>

                                    {/* Row 2: Category + Date + Actions */}
                                    <div className="flex items-center justify-between mt-1.5 gap-2">
                                        <div className="flex items-center gap-2 min-w-0 flex-1">
                                            <CategoryLabel category={transaction.category} size="sm" />
                                            <span className="text-xs text-[var(--color-text-muted)] whitespace-nowrap">
                                                {formatDate(transaction.date)}
                                            </span>
                                        </div>

                                        {/* Action buttons - compact on mobile */}
                                        <div className="flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
                                            <button
                                                onClick={() => handleView(transaction)}
                                                className="p-1.5 hover:bg-[var(--color-surface-hover)] rounded-lg"
                                                title="Xem chi tiết"
                                            >
                                                <Eye className="w-4 h-4 text-[var(--color-text-muted)]" />
                                            </button>
                                            {onEdit && (
                                                <button
                                                    onClick={() => onEdit(transaction)}
                                                    className="p-1.5 hover:bg-[var(--color-surface-hover)] rounded-lg"
                                                    title="Sửa"
                                                >
                                                    <Edit2 className="w-4 h-4 text-[var(--color-info)]" />
                                                </button>
                                            )}
                                            {onDelete && (
                                                <button
                                                    onClick={(e) => handleDeleteClick(transaction.id, e)}
                                                    className="p-1.5 hover:bg-[var(--color-danger-bg)] rounded-lg"
                                                    title="Xóa"
                                                >
                                                    <Trash2 className="w-4 h-4 text-[var(--color-danger)]" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 text-sm">
                    <p className="text-[var(--color-text-muted)]">
                        {startIndex + 1}-{Math.min(endIndex, transactions.length)} / {transactions.length}
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

            {/* View detail modal */}
            {viewingTransaction && !onView && (
                <TransactionDetail
                    transaction={viewingTransaction}
                    onClose={() => setViewingTransaction(null)}
                />
            )}
        </>
    );
}
