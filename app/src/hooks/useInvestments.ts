'use client';

import { useState, useEffect, useCallback } from 'react';
import { InvestmentItem } from '@/types/investment';

export function useInvestments() {
    const [items, setItems] = useState<InvestmentItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchItems = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/investments', { cache: 'no-store' });
            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error(body.error || 'Failed to fetch investments');
            }
            const data = await res.json();
            if (!Array.isArray(data)) {
                throw new Error(data?.error || 'Unexpected response format');
            }
            setItems(data as InvestmentItem[]);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    const addItem = useCallback(async (item: Omit<InvestmentItem, 'id'>) => {
        const res = await fetch('/api/investments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item),
        });
        if (!res.ok) {
            const body = await res.json().catch(() => ({}));
            throw new Error(body.error || 'Failed to add investment');
        }
        await fetchItems();
    }, [fetchItems]);

    const updateItem = useCallback(async (id: string, updates: Partial<InvestmentItem>) => {
        const res = await fetch(`/api/investments/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates),
        });
        if (!res.ok) {
            const body = await res.json().catch(() => ({}));
            throw new Error(body.error || 'Failed to update investment');
        }
        await fetchItems();
    }, [fetchItems]);

    const deleteItem = useCallback(async (id: string) => {
        const res = await fetch(`/api/investments/${id}`, { method: 'DELETE' });
        if (!res.ok) {
            const body = await res.json().catch(() => ({}));
            throw new Error(body.error || 'Failed to delete investment');
        }
        await fetchItems();
    }, [fetchItems]);

    return {
        items,
        loading,
        error,
        addItem,
        updateItem,
        deleteItem,
        refetch: fetchItems,
    };
}
