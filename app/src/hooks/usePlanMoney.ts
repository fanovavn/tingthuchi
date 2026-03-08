'use client';

import { useState, useEffect, useCallback } from 'react';
import { PlanMoneyItem } from '@/types/plan-money';

export function usePlanMoney() {
    const [items, setItems] = useState<PlanMoneyItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchItems = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/plan-money', { cache: 'no-store' });
            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error(body.error || 'Failed to fetch plan money items');
            }
            const data = await res.json();

            if (!Array.isArray(data)) {
                throw new Error(data?.error || 'Unexpected response format');
            }

            setItems(data as PlanMoneyItem[]);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    const addItem = useCallback(async (item: Omit<PlanMoneyItem, 'id'>) => {
        const res = await fetch('/api/plan-money', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item),
        });
        if (!res.ok) {
            const body = await res.json().catch(() => ({}));
            throw new Error(body.error || 'Failed to add plan money item');
        }
        await fetchItems();
    }, [fetchItems]);

    const updateItem = useCallback(async (id: string, updates: Partial<PlanMoneyItem>) => {
        const res = await fetch(`/api/plan-money/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates),
        });
        if (!res.ok) {
            const body = await res.json().catch(() => ({}));
            throw new Error(body.error || 'Failed to update plan money item');
        }
        await fetchItems();
    }, [fetchItems]);

    const deleteItem = useCallback(async (id: string) => {
        const res = await fetch(`/api/plan-money/${id}`, { method: 'DELETE' });
        if (!res.ok) {
            const body = await res.json().catch(() => ({}));
            throw new Error(body.error || 'Failed to delete plan money item');
        }
        await fetchItems();
    }, [fetchItems]);

    const toggleCheck = useCallback(async (id: string) => {
        // Optimistic update
        setItems(prev => prev.map(item =>
            item.id === id ? { ...item, checked: !item.checked } : item
        ));
        try {
            const res = await fetch('/api/plan-money/check', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id }),
            });
            if (!res.ok) throw new Error('Failed to toggle check');
        } catch {
            // Revert on error
            await fetchItems();
        }
    }, [fetchItems]);

    const clearAllChecks = useCallback(async () => {
        // Optimistic update
        setItems(prev => prev.map(item => ({ ...item, checked: false })));
        try {
            const res = await fetch('/api/plan-money/check', { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to clear checks');
        } catch {
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
        toggleCheck,
        clearAllChecks,
        refetch: fetchItems,
    };
}
