'use client';

import { useState, useEffect, useCallback } from 'react';
import { SavingTransaction, SavingStats } from '@/types/saving';

export function useSavings() {
    const [savings, setSavings] = useState<SavingTransaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchSavings = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/savings', { cache: 'no-store' });
            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error(body.error || 'Failed to fetch savings');
            }
            const data = await res.json();

            // Guard: ensure data is an array
            if (!Array.isArray(data)) {
                throw new Error(data?.error || 'Unexpected response format');
            }

            const parsed = data.map((s: Record<string, any>) => ({
                ...s,
                date: new Date(s.date || Date.now()),
            })) as SavingTransaction[];

            setSavings(parsed);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSavings();
    }, [fetchSavings]);

    const addSaving = useCallback(async (saving: Omit<SavingTransaction, 'id'>) => {
        const res = await fetch('/api/savings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(saving),
        });
        if (!res.ok) {
            const body = await res.json().catch(() => ({}));
            throw new Error(body.error || 'Failed to add saving');
        }
        await fetchSavings();
    }, [fetchSavings]);

    const updateSaving = useCallback(async (id: string, updates: Partial<SavingTransaction>) => {
        const res = await fetch(`/api/savings/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates),
        });
        if (!res.ok) {
            const body = await res.json().catch(() => ({}));
            throw new Error(body.error || 'Failed to update saving');
        }
        await fetchSavings();
    }, [fetchSavings]);

    const deleteSaving = useCallback(async (id: string) => {
        const res = await fetch(`/api/savings/${id}`, { method: 'DELETE' });
        if (!res.ok) {
            const body = await res.json().catch(() => ({}));
            throw new Error(body.error || 'Failed to delete saving');
        }
        await fetchSavings();
    }, [fetchSavings]);

    const getStats = useCallback(
        (filteredSavings?: SavingTransaction[]): SavingStats => {
            const data = filteredSavings || savings;
            const totalDeposit = data
                .filter(s => s.type === 'deposit')
                .reduce((sum, s) => sum + s.amount, 0);
            const totalWithdraw = data
                .filter(s => s.type === 'withdraw')
                .reduce((sum, s) => sum + s.amount, 0);

            return {
                totalDeposit,
                totalWithdraw,
                balance: totalDeposit - totalWithdraw,
                transactionCount: data.length,
            };
        },
        [savings]
    );

    return {
        savings,
        loading,
        error,
        addSaving,
        updateSaving,
        deleteSaving,
        getStats,
        refetch: fetchSavings,
    };
}
