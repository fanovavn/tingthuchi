'use client';

import { useState, useMemo, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useTransactions } from '@/hooks/useTransactions';
import { useDateFilter } from '@/hooks/useDateFilter';
import { Transaction, TransactionFilter } from '@/types/transaction';
import { FilterBar, TransactionForm, TransactionTable, TransactionDetail } from '@/components/transactions';
import { DateRangeFilter } from '@/components/dashboard';
import { exportToExcel, getCategories } from '@/lib/excel-parser';
import { formatCurrency } from '@/lib/utils';

export default function TransactionsPage() {
    const searchParams = useSearchParams();
    const {
        transactions,
        loading,
        loadFromExcel,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        filterTransactions,
        getStats,
    } = useTransactions();

    // Find data date range
    const dataDateRange = useMemo(() => {
        if (transactions.length === 0) return undefined;
        const dates = transactions.map((t) => t.date.getTime());
        return {
            min: new Date(Math.min(...dates)),
            max: new Date(Math.max(...dates)),
        };
    }, [transactions]);

    // Use persisted date filter
    const { dateRange, setDateRange } = useDateFilter({ dataDateRange });

    const [filters, setFilters] = useState<TransactionFilter>({});
    const [showForm, setShowForm] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>();
    const [viewingTransaction, setViewingTransaction] = useState<Transaction | undefined>();

    // Auto-load sample data on first visit
    useEffect(() => {
        if (!loading && transactions.length === 0) {
            loadFromExcel('/List-transaction-excel.xlsx');
        }
    }, [loading, transactions.length, loadFromExcel]);

    const filteredTransactions = useMemo(() => {
        const baseFilters: TransactionFilter = {
            ...filters,
            startDate: dateRange.start,
            endDate: dateRange.end,
        };
        return filterTransactions(baseFilters);
    }, [filterTransactions, filters, dateRange]);

    const stats = useMemo(
        () => getStats(filteredTransactions),
        [getStats, filteredTransactions]
    );

    const handleView = (transaction: Transaction) => {
        setViewingTransaction(transaction);
    };

    const handleEdit = (transaction: Transaction) => {
        setEditingTransaction(transaction);
        setShowForm(true);
    };

    const handleSubmit = (data: Omit<Transaction, 'id'>) => {
        if (editingTransaction) {
            updateTransaction(editingTransaction.id, data);
        } else {
            addTransaction(data);
        }
        setShowForm(false);
        setEditingTransaction(undefined);
    };

    const handleBatchSubmit = (dataList: Omit<Transaction, 'id'>[]) => {
        dataList.forEach(data => addTransaction(data));
        setShowForm(false);
    };

    const handleExport = () => {
        const categories = getCategories();
        const blob = exportToExcel(filteredTransactions, categories);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `transactions-${new Date().toISOString().slice(0, 10)}.xlsx`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold">Giao Dịch</h1>
                    <p className="text-sm text-[var(--color-text-muted)]">
                        Quản lý thu chi của bạn
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <DateRangeFilter
                        startDate={dateRange.start}
                        endDate={dateRange.end}
                        onChange={(start, end) => setDateRange({ start, end })}
                        dataDateRange={dataDateRange}
                    />
                    <button onClick={() => setShowForm(true)} className="btn btn-primary">
                        <Plus className="w-4 h-4" />
                        <span className="hidden sm:inline">Thêm</span>
                    </button>
                </div>
            </div>

            {/* Filter bar */}
            <FilterBar onFilterChange={setFilters} />

            {/* Summary - horizontal scroll on mobile */}
            <div className="flex gap-2 sm:gap-4 overflow-x-auto pb-2 -mx-1 px-1">
                <div className="glass-card px-3 py-2 flex-shrink-0">
                    <span className="text-xs text-[var(--color-text-muted)]">Thu: </span>
                    <span className="text-sm font-semibold text-[var(--color-success)]">
                        {stats.totalIncome >= 1000000
                            ? `${(stats.totalIncome / 1000000).toFixed(1)}M`
                            : formatCurrency(stats.totalIncome)}
                    </span>
                </div>
                <div className="glass-card px-3 py-2 flex-shrink-0">
                    <span className="text-xs text-[var(--color-text-muted)]">Chi: </span>
                    <span className="text-sm font-semibold text-[var(--color-danger)]">
                        {stats.totalExpense >= 1000000
                            ? `${(stats.totalExpense / 1000000).toFixed(1)}M`
                            : formatCurrency(stats.totalExpense)}
                    </span>
                </div>
                <div className="glass-card px-3 py-2 flex-shrink-0">
                    <span className="text-xs text-[var(--color-text-muted)]">±: </span>
                    <span className={`text-sm font-semibold ${stats.balance >= 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'}`}>
                        {Math.abs(stats.balance) >= 1000000
                            ? `${stats.balance >= 0 ? '+' : '-'}${(Math.abs(stats.balance) / 1000000).toFixed(1)}M`
                            : formatCurrency(stats.balance)}
                    </span>
                </div>
                <div className="glass-card px-3 py-2 flex-shrink-0">
                    <span className="text-xs text-[var(--color-text-muted)]">GD: </span>
                    <span className="text-sm font-semibold">{stats.transactionCount}</span>
                </div>
            </div>

            {/* Transaction table */}
            {loading ? (
                <div className="glass-card p-8 sm:p-12 text-center">
                    <div className="skeleton h-8 w-32 mx-auto mb-4" />
                    <p className="text-[var(--color-text-muted)]">Đang tải...</p>
                </div>
            ) : (
                <TransactionTable
                    transactions={filteredTransactions}
                    onView={handleView}
                    onEdit={handleEdit}
                    onDelete={deleteTransaction}
                />
            )}

            {/* View detail modal */}
            {viewingTransaction && (
                <TransactionDetail
                    transaction={viewingTransaction}
                    onClose={() => setViewingTransaction(undefined)}
                />
            )}

            {/* Form modal */}
            {showForm && (
                <TransactionForm
                    transaction={editingTransaction}
                    onSubmit={handleSubmit}
                    onSubmitBatch={handleBatchSubmit}
                    onCancel={() => {
                        setShowForm(false);
                        setEditingTransaction(undefined);
                    }}
                />
            )}
        </div>
    );
}
