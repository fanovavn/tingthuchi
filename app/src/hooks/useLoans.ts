'use client';

import { useState, useEffect, useCallback } from 'react';
import { LoanItem } from '@/types/loan';

export function useLoans() {
    const [items, setItems] = useState<LoanItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchItems = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/loans', { cache: 'no-store' });
            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error(body.error || 'Failed to fetch loans');
            }
            const data = await res.json();

            if (!Array.isArray(data)) {
                throw new Error(data?.error || 'Unexpected response format');
            }

            setItems(data as LoanItem[]);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    const addItem = useCallback(async (item: Omit<LoanItem, 'id'>) => {
        const res = await fetch('/api/loans', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item),
        });
        if (!res.ok) {
            const body = await res.json().catch(() => ({}));
            throw new Error(body.error || 'Failed to add loan');
        }
        await fetchItems();
    }, [fetchItems]);

    const updateItem = useCallback(async (id: string, updates: Partial<LoanItem>) => {
        const res = await fetch(`/api/loans/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates),
        });
        if (!res.ok) {
            const body = await res.json().catch(() => ({}));
            throw new Error(body.error || 'Failed to update loan');
        }
        await fetchItems();
    }, [fetchItems]);

    const deleteItem = useCallback(async (id: string) => {
        const res = await fetch(`/api/loans/${id}`, { method: 'DELETE' });
        if (!res.ok) {
            const body = await res.json().catch(() => ({}));
            throw new Error(body.error || 'Failed to delete loan');
        }
        await fetchItems();
    }, [fetchItems]);

    const toggleNeedClear = useCallback(async (id: string) => {
        // Optimistic update — when toggling on, set clearAmount = loan amount
        setItems(prev => prev.map(item => {
            if (item.id !== id) return item;
            const newNeedClear = !item.needClear;
            return {
                ...item,
                needClear: newNeedClear,
                clearAmount: newNeedClear ? item.amount : 0,
            };
        }));
        try {
            const res = await fetch('/api/loans/need-clear', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id }),
            });
            if (!res.ok) throw new Error('Failed to toggle need-clear');
        } catch {
            // Revert on error
            await fetchItems();
        }
    }, [fetchItems]);

    return {
        items,
        loading,
        error,
        addItem,
        updateItem,
        deleteItem,
        toggleNeedClear,
        refetch: fetchItems,
    };
}
