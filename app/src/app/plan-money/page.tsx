'use client';

import { useState } from 'react';
import { usePlanMoney } from '@/hooks/usePlanMoney';
import { PlanMoneyTimeline, PlanMoneyForm } from '@/components/plan-money';
import { PlanMoneyItem } from '@/types/plan-money';
import { Plus, RefreshCw, Loader2 } from 'lucide-react';

export default function PlanMoneyPage() {
    const { items, loading, error, addItem, updateItem, deleteItem, toggleCheck, clearAllChecks } = usePlanMoney();
    const [showForm, setShowForm] = useState(false);
    const [editingItem, setEditingItem] = useState<PlanMoneyItem | undefined>();
    const [defaultDay, setDefaultDay] = useState<number | undefined>();

    const handleAdd = async (data: Omit<PlanMoneyItem, 'id'>) => {
        try {
            await addItem(data);
            setShowForm(false);
        } catch (err) {
            alert('Lỗi khi thêm hạng mục. Vui lòng thử lại.');
            console.error(err);
        }
    };

    const handleUpdate = async (data: Omit<PlanMoneyItem, 'id'>) => {
        if (!editingItem) return;
        try {
            await updateItem(editingItem.id, data);
            setEditingItem(undefined);
            setShowForm(false);
        } catch (err) {
            alert('Lỗi khi cập nhật hạng mục. Vui lòng thử lại.');
            console.error(err);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteItem(id);
            setEditingItem(undefined);
            setShowForm(false);
        } catch (err) {
            alert('Lỗi khi xóa hạng mục. Vui lòng thử lại.');
            console.error(err);
        }
    };

    const handleEdit = (item: PlanMoneyItem) => {
        setEditingItem(item);
        setDefaultDay(undefined);
        setShowForm(true);
    };

    const handleAddToDay = (day: number) => {
        setEditingItem(undefined);
        setDefaultDay(day);
        setShowForm(true);
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
                        <RefreshCw className="w-6 h-6 sm:w-7 sm:h-7 text-[var(--color-primary)]" />
                        Kế Hoạch Chi Tiêu
                    </h1>
                    <p className="text-sm text-[var(--color-text-muted)]">
                        Theo dõi thu/chi định kỳ trong tháng (cố định 30 ngày)
                    </p>
                </div>
                <button
                    onClick={() => {
                        setEditingItem(undefined);
                        setDefaultDay(undefined);
                        setShowForm(true);
                    }}
                    className="btn btn-primary flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    <span>Thêm hạng mục</span>
                </button>
            </div>

            {/* Timeline */}
            <PlanMoneyTimeline
                items={items}
                onDelete={handleDelete}
                onEdit={handleEdit}
                onAddToDay={handleAddToDay}
                onToggleCheck={toggleCheck}
                onClearAllChecks={clearAllChecks}
            />

            {/* Form Modal (Add / Edit) */}
            {showForm && (
                <PlanMoneyForm
                    item={editingItem}
                    defaultDay={defaultDay}
                    onSubmit={editingItem ? handleUpdate : handleAdd}
                    onCancel={() => {
                        setShowForm(false);
                        setEditingItem(undefined);
                        setDefaultDay(undefined);
                    }}
                    onDelete={editingItem ? handleDelete : undefined}
                />
            )}
        </div>
    );
}
