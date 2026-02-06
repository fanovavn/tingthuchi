'use client';

import { useState, useEffect, useCallback } from 'react';
import { Transaction, TransactionFilter, DashboardStats } from '@/types/transaction';
import { addCategoryIfNotExists } from '@/lib/excel-parser';

export function useTransactions() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTransactions = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/transactions', { cache: 'no-store' });
            if (!res.ok) throw new Error('Failed to fetch transactions');
            const data = await res.json();

            // Convert date strings to Date objects
            const parsedData = data.map((t: any) => ({
                ...t,
                date: new Date(t.date || t.DATE || Date.now()), // Handle case sensitivity if needed
            }));

            setTransactions(parsedData);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    }, []);

    // Initial load
    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    // CRUD operations
    const addTransaction = useCallback(async (transaction: Omit<Transaction, 'id'>) => {
        try {
            // Auto-add category if it doesn't exist
            if (transaction.category) {
                addCategoryIfNotExists(transaction.category, transaction.type);
            }

            const res = await fetch('/api/transactions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(transaction),
            });

            if (!res.ok) throw new Error('Failed to add transaction');

            // Refresh list to get new ID and updated file state
            await fetchTransactions();
        } catch (err) {
            console.error(err);
            throw err;
        }
    }, [fetchTransactions]);

    const updateTransaction = useCallback(async (id: string, updates: Partial<Transaction>) => {
        try {
            const res = await fetch(`/api/transactions/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates),
            });

            if (!res.ok) throw new Error('Failed to update transaction');

            await fetchTransactions();
        } catch (err) {
            console.error(err);
            throw err;
        }
    }, [fetchTransactions]);

    const deleteTransaction = useCallback(async (id: string) => {
        try {
            const res = await fetch(`/api/transactions/${id}`, {
                method: 'DELETE',
            });

            if (!res.ok) throw new Error('Failed to delete transaction');

            await fetchTransactions();
        } catch (err) {
            console.error(err);
            throw err;
        }
    }, [fetchTransactions]);

    // Filter transactions (Client-side filtering for now is fine as dataset is small < 1000)
    const filterTransactions = useCallback(
        (filters: TransactionFilter): Transaction[] => {
            return transactions.filter((t) => {
                const tDate = new Date(t.date);
                if (filters.startDate && tDate < filters.startDate) return false;
                if (filters.endDate && tDate > filters.endDate) return false;
                if (filters.type && filters.type !== 'all' && t.type !== filters.type) return false;
                if (filters.category && t.category !== filters.category) return false;
                if (filters.searchQuery) {
                    const query = filters.searchQuery.toLowerCase();
                    return (
                        (t.description || '').toLowerCase().includes(query) ||
                        (t.category || '').toLowerCase().includes(query)
                    );
                }
                return true;
            });
        },
        [transactions]
    );

    // Calculate stats
    const getStats = useCallback(
        (filteredTransactions?: Transaction[]): DashboardStats => {
            const data = filteredTransactions || transactions;
            const totalIncome = data
                .filter((t) => t.type === 'income')
                .reduce((sum, t) => sum + t.amount, 0);
            const totalExpense = data
                .filter((t) => t.type === 'expense')
                .reduce((sum, t) => sum + t.amount, 0);

            return {
                totalIncome,
                totalExpense,
                balance: totalIncome - totalExpense,
                transactionCount: data.length,
            };
        },
        [transactions]
    );

    // Get category breakdown
    const getCategoryBreakdown = useCallback(
        (type?: 'income' | 'expense') => {
            const filtered = type
                ? transactions.filter((t) => t.type === type)
                : transactions;

            const breakdown: Record<string, number> = {};
            filtered.forEach((t) => {
                breakdown[t.category] = (breakdown[t.category] || 0) + t.amount;
            });

            return Object.entries(breakdown)
                .map(([category, amount]) => ({ category, amount }))
                .sort((a, b) => b.amount - a.amount);
        },
        [transactions]
    );

    // Get transactions by period
    const getTransactionsByPeriod = useCallback(
        (period: 'day' | 'week' | 'month') => {
            const grouped: Record<string, { income: number; expense: number }> = {};

            transactions.forEach((t) => {
                const date = new Date(t.date);
                let key: string;

                if (period === 'day') {
                    key = `${date.getDate()}/${date.getMonth() + 1}`;
                } else if (period === 'week') {
                    const weekNum = Math.ceil(date.getDate() / 7);
                    key = `Tuần ${weekNum}/${date.getMonth() + 1}`;
                } else {
                    key = `${date.getMonth() + 1}/${date.getFullYear()}`;
                }

                if (!grouped[key]) {
                    grouped[key] = { income: 0, expense: 0 };
                }

                if (t.type === 'income') {
                    grouped[key].income += t.amount;
                } else {
                    grouped[key].expense += t.amount;
                }
            });

            return grouped;
        },
        [transactions]
    );

    return {
        transactions,
        loading,
        error,
        loadFromExcel: useCallback(async (_url?: string) => fetchTransactions(), [fetchTransactions]),
        addTransaction,
        updateTransaction,
        deleteTransaction,
        filterTransactions,
        getStats,
        getCategoryBreakdown,
        getTransactionsByPeriod,
        setTransactions,
    };
}
