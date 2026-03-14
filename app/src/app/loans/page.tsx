'use client';

import { useState } from 'react';
import { useLoans } from '@/hooks/useLoans';
import { LoanDashboard, LoanForm } from '@/components/loans';
import { LoanItem } from '@/types/loan';
import { Plus, Loader2, Landmark } from 'lucide-react';

export default function LoansPage() {
    const { items, loading, error, addItem, updateItem, deleteItem, toggleNeedClear } = useLoans();
    const [showForm, setShowForm] = useState(false);
    const [editingItem, setEditingItem] = useState<LoanItem | undefined>();

    const handleAdd = async (data: Omit<LoanItem, 'id'>) => {
        try {
            await addItem(data);
            setShowForm(false);
        } catch (err) {
            alert('Lỗi khi thêm khoản nợ. Vui lòng thử lại.');
            console.error(err);
        }
    };

    const handleUpdate = async (data: Omit<LoanItem, 'id'>) => {
        if (!editingItem) return;
        try {
            await updateItem(editingItem.id, data);
            setEditingItem(undefined);
            setShowForm(false);
        } catch (err) {
            alert('Lỗi khi cập nhật khoản nợ. Vui lòng thử lại.');
            console.error(err);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteItem(id);
            setEditingItem(undefined);
            setShowForm(false);
        } catch (err) {
            alert('Lỗi khi xoá khoản nợ. Vui lòng thử lại.');
            console.error(err);
        }
    };

    const handleEdit = (item: LoanItem) => {
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
                        <Landmark className="w-6 h-6 sm:w-7 sm:h-7 text-[var(--color-danger)]" />
                        Quản Lý Nợ
                    </h1>
                    <p className="text-sm text-[var(--color-text-muted)]">
                        Theo dõi và quản lý các khoản nợ cá nhân
                    </p>
                </div>
                <button
                    onClick={() => {
                        setEditingItem(undefined);
                        setShowForm(true);
                    }}
                    className="btn btn-primary flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    <span>Thêm khoản nợ</span>
                </button>
            </div>

            {/* Dashboard */}
            <LoanDashboard
                items={items}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleNeedClear={toggleNeedClear}
            />

            {/* Form Modal (Add / Edit) */}
            {showForm && (
                <LoanForm
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
