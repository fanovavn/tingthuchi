'use client';

import { useState } from 'react';
import { useInvestments } from '@/hooks/useInvestments';
import { InvestmentDashboard, InvestmentForm } from '@/components/investments';
import { InvestmentItem } from '@/types/investment';
import { Plus, Loader2, TrendingUp } from 'lucide-react';

export default function InvestmentsPage() {
    const { items, loading, error, addItem, updateItem, deleteItem } = useInvestments();
    const [showForm, setShowForm] = useState(false);
    const [editingItem, setEditingItem] = useState<InvestmentItem | undefined>();

    const handleAdd = async (data: Omit<InvestmentItem, 'id'>) => {
        try {
            await addItem(data);
            setShowForm(false);
        } catch (err) {
            alert('Lỗi khi thêm khoản đầu tư. Vui lòng thử lại.');
            console.error(err);
        }
    };

    const handleUpdate = async (data: Omit<InvestmentItem, 'id'>) => {
        if (!editingItem) return;
        try {
            await updateItem(editingItem.id, data);
            setEditingItem(undefined);
            setShowForm(false);
        } catch (err) {
            alert('Lỗi khi cập nhật. Vui lòng thử lại.');
            console.error(err);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteItem(id);
            setEditingItem(undefined);
            setShowForm(false);
        } catch (err) {
            alert('Lỗi khi xoá. Vui lòng thử lại.');
            console.error(err);
        }
    };

    const handleEdit = (item: InvestmentItem) => {
        setEditingItem(item);
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
                        <TrendingUp className="w-6 h-6 sm:w-7 sm:h-7 text-[#22c55e]" />
                        Danh Mục Đầu Tư
                    </h1>
                    <p className="text-sm text-[var(--color-text-muted)]">
                        Quản lý và theo dõi hiệu suất các khoản đầu tư
                    </p>
                </div>
                <button
                    onClick={() => {
                        setEditingItem(undefined);
                        setShowForm(true);
                    }}
                    className="btn flex items-center gap-2 text-white font-semibold"
                    style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}
                >
                    <Plus className="w-4 h-4" />
                    <span>Thêm đầu tư</span>
                </button>
            </div>

            {/* Dashboard */}
            <InvestmentDashboard
                items={items}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            {/* Form Modal */}
            {showForm && (
                <InvestmentForm
                    item={editingItem}
                    onSubmit={editingItem ? handleUpdate : handleAdd}
                    onCancel={() => {
                        setShowForm(false);
                        setEditingItem(undefined);
                    }}
                    onDelete={editingItem ? handleDelete : undefined}
                />
            )}
        </div>
    );
}
