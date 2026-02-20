'use client';

import { useState, useMemo } from 'react';
import { SavingTransaction } from '@/types/saving';
import { useSavings } from '@/hooks/useSavings';
import { SavingStats, SavingList, SavingDetail, SavingForm } from '@/components/savings';
import { Plus, ChevronLeft, ChevronRight, PiggyBank, Loader2 } from 'lucide-react';

export default function SavingsPage() {
    const { savings, loading, error, addSaving, updateSaving, deleteSaving, getStats } = useSavings();

    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [showForm, setShowForm] = useState(false);
    const [editingSaving, setEditingSaving] = useState<SavingTransaction | undefined>();
    const [viewingSaving, setViewingSaving] = useState<SavingTransaction | undefined>();

    // Filter by year
    const filteredSavings = useMemo(() => {
        return savings.filter((s) => {
            const d = new Date(s.date);
            return d.getFullYear() === selectedYear;
        });
    }, [savings, selectedYear]);

    const stats = useMemo(() => getStats(filteredSavings), [getStats, filteredSavings]);

    // Get available years
    const availableYears = useMemo(() => {
        const years = new Set(savings.map(s => new Date(s.date).getFullYear()));
        years.add(new Date().getFullYear());
        return Array.from(years).sort((a, b) => b - a);
    }, [savings]);

    const handleAdd = async (data: Omit<SavingTransaction, 'id'>) => {
        try {
            await addSaving(data);
            setShowForm(false);
        } catch (err) {
            alert('Lỗi khi thêm giao dịch tiết kiệm. Vui lòng thử lại.');
            console.error(err);
        }
    };

    const handleEdit = (saving: SavingTransaction) => {
        setEditingSaving(saving);
        setShowForm(true);
    };

    const handleUpdate = async (data: Omit<SavingTransaction, 'id'>) => {
        if (editingSaving) {
            try {
                await updateSaving(editingSaving.id, data);
                setEditingSaving(undefined);
                setShowForm(false);
            } catch (err) {
                alert('Lỗi khi cập nhật giao dịch tiết kiệm. Vui lòng thử lại.');
                console.error(err);
            }
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteSaving(id);
            setViewingSaving(undefined);
        } catch (err) {
            alert('Lỗi khi xóa giao dịch tiết kiệm. Vui lòng thử lại.');
            console.error(err);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 text-[var(--color-primary)] animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="glass-card p-8 text-center">
                <p className="text-[var(--color-danger)]">{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                        <PiggyBank className="w-6 h-6 sm:w-7 sm:h-7 text-[var(--color-primary)]" />
                        Tiết Kiệm
                    </h1>
                    <p className="text-sm text-[var(--color-text-muted)]">Quản lý quỹ tiết kiệm</p>
                </div>
                <div className="flex items-center gap-3">
                    {/* Year selector */}
                    <div className="flex items-center gap-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-2 py-1.5">
                        <button
                            onClick={() => setSelectedYear(y => y - 1)}
                            className="p-1 hover:bg-[var(--color-surface-hover)] rounded-lg"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="px-2 text-sm font-medium min-w-[4rem] text-center">{selectedYear}</span>
                        <button
                            onClick={() => setSelectedYear(y => y + 1)}
                            className="p-1 hover:bg-[var(--color-surface-hover)] rounded-lg"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                    {/* Add button */}
                    <button
                        onClick={() => {
                            setEditingSaving(undefined);
                            setShowForm(true);
                        }}
                        className="btn btn-primary flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Thêm</span>
                    </button>
                </div>
            </div>

            {/* Stats */}
            <SavingStats stats={stats} />

            {/* Transaction list */}
            <SavingList
                savings={filteredSavings}
                onView={setViewingSaving}
            />

            {/* Form modal */}
            {showForm && (
                <SavingForm
                    saving={editingSaving}
                    onSubmit={editingSaving ? handleUpdate : handleAdd}
                    onCancel={() => {
                        setShowForm(false);
                        setEditingSaving(undefined);
                    }}
                />
            )}

            {/* Detail modal */}
            {viewingSaving && (
                <SavingDetail
                    saving={viewingSaving}
                    onClose={() => setViewingSaving(undefined)}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            )}
        </div>
    );
}
