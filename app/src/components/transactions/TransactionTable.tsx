'use client';

import { useState, useMemo } from 'react';
import { Transaction } from '@/types/transaction';
import { formatCurrency } from '@/lib/utils';
import { Eye, Edit2, Trash2, ChevronLeft, ChevronRight, ArrowUpRight, ArrowDownRight, Calendar } from 'lucide-react';
import { CategoryLabel } from '@/components/ui/CategoryLabel';
import { TransactionDetail } from './TransactionDetail';
import { ConfirmDeleteDialog } from './ConfirmDeleteDialog';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface TransactionTableProps {
    transactions: Transaction[];
    onView?: (transaction: Transaction) => void;
    onEdit?: (transaction: Transaction) => void;
    onDelete?: (id: string) => void;
    pageSize?: number;
}

interface DayGroup {
    dateKey: string;
    dateLabel: string;
    dayOfWeek: string;
    transactions: Transaction[];
    totalIncome: number;
    totalExpense: number;
}

function groupByDate(transactions: Transaction[]): DayGroup[] {
    const groups = new Map<string, Transaction[]>();

    for (const t of transactions) {
        const d = new Date(t.date);
        const key = format(d, 'yyyy-MM-dd');
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key)!.push(t);
    }

    // Sort by date descending
    const sorted = [...groups.entries()].sort((a, b) => b[0].localeCompare(a[0]));

    return sorted.map(([key, txns]) => {
        const d = new Date(key);
        return {
            dateKey: key,
            dateLabel: format(d, 'dd/MM/yyyy'),
            dayOfWeek: format(d, 'EEEE', { locale: vi }),
            transactions: txns,
            totalIncome: txns.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0),
            totalExpense: txns.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
        };
    });
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

    // Group current page transactions by date
    const dayGroups = useMemo(() => groupByDate(currentTransactions), [currentTransactions]);

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

    // Check if date is today
    const isToday = (dateKey: string) => {
        return dateKey === format(new Date(), 'yyyy-MM-dd');
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

            {/* Grouped by date */}
            <div className="space-y-3">
                {dayGroups.map((group) => (
                    <div key={group.dateKey} className="glass-card overflow-hidden">
                        {/* Date header */}
                        <div
                            className={`px-4 py-2.5 flex items-center justify-between ${isToday(group.dateKey)
                                ? 'bg-[var(--color-primary)] border-l-4 border-[var(--color-primary)]'
                                : 'bg-[var(--color-surface-hover)]'
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <Calendar className={`w-4 h-4 ${isToday(group.dateKey) ? 'text-white/80' : 'text-[var(--color-text-muted)]'}`} />
                                <span className={`font-semibold text-sm ${isToday(group.dateKey) ? 'text-white' : ''}`}>
                                    {group.dateLabel}
                                </span>
                                <span className={`text-xs capitalize ${isToday(group.dateKey) ? 'text-white/80' : 'text-[var(--color-text-muted)]'}`}>
                                    {group.dayOfWeek}
                                </span>
                                {isToday(group.dateKey) && (
                                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-white/20 text-white">
                                        Hôm nay
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-3 text-xs">
                                {group.totalIncome > 0 && (
                                    <span className={`font-medium ${isToday(group.dateKey) ? 'text-green-200' : 'text-[var(--color-success)]'}`}>
                                        +{formatCurrency(group.totalIncome)}
                                    </span>
                                )}
                                {group.totalExpense > 0 && (
                                    <span className={`font-semibold ${isToday(group.dateKey) ? 'text-red-200' : 'text-[var(--color-danger)]'}`}>
                                        -{formatCurrency(group.totalExpense)}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Transactions in this day */}
                        <div className="divide-y divide-[var(--color-border)]">
                            {group.transactions.map((transaction) => (
                                <div
                                    key={transaction.id}
                                    className="p-3 sm:p-4 hover:bg-[var(--color-surface-hover)] cursor-pointer"
                                    onClick={() => handleView(transaction)}
                                >
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

                                        {/* Content */}
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

                                            {/* Row 2: Category + Actions */}
                                            <div className="flex items-center justify-between mt-1.5 gap-2">
                                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                                    <CategoryLabel category={transaction.category} size="sm" />
                                                </div>

                                                {/* Action buttons */}
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
                ))}
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
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
            )}
        </>
    );
}
