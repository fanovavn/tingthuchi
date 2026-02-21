'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, TrendingUp, TrendingDown, Loader2, AlertTriangle } from 'lucide-react';

interface Category {
    id: string;
    name: string;
    type: 'income' | 'expense';
    color: string;
}

const PRESET_COLORS = [
    '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
    '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
    '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
    '#ec4899', '#f472b6', '#64748b', '#78716c', '#a1a1aa',
];

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [activeTab, setActiveTab] = useState<'expense' | 'income'>('expense');
    const [showForm, setShowForm] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | undefined>();
    const [formData, setFormData] = useState({ name: '', type: 'expense' as 'income' | 'expense', color: '#6366f1' });
    const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Load categories from API
    const fetchCategories = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await fetch('/api/categories');
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to fetch categories');
            }
            const data = await res.json();
            setCategories(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Lỗi khi tải danh mục');
            console.error('Failed to fetch categories:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const filteredCategories = categories.filter((c) => c.type === activeTab);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (editingCategory) {
                const res = await fetch(`/api/categories/${editingCategory.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: formData.name,
                        type: formData.type,
                        color: formData.color,
                    }),
                });
                if (!res.ok) throw new Error('Failed to update category');
            } else {
                const res = await fetch('/api/categories', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: formData.name,
                        type: formData.type,
                        color: formData.color,
                    }),
                });
                if (!res.ok) throw new Error('Failed to add category');
            }
            await fetchCategories();
            setShowForm(false);
            setEditingCategory(undefined);
            setFormData({ name: '', type: 'expense', color: '#6366f1' });
        } catch (err) {
            console.error('Failed to save category:', err);
            alert(err instanceof Error ? err.message : 'Lỗi khi lưu danh mục');
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (category: Category) => {
        setEditingCategory(category);
        setFormData({ name: category.name, type: category.type, color: category.color });
        setShowForm(true);
    };

    const handleDeleteConfirm = async () => {
        if (!deletingCategory) return;
        setIsDeleting(true);
        try {
            const res = await fetch(`/api/categories/${deletingCategory.id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete category');
            await fetchCategories();
            setDeletingCategory(null);
        } catch (err) {
            console.error('Failed to delete category:', err);
            alert(err instanceof Error ? err.message : 'Lỗi khi xóa danh mục');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleAddNew = () => {
        setEditingCategory(undefined);
        setFormData({ name: '', type: activeTab, color: '#6366f1' });
        setShowForm(true);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Quản Lý Danh Mục</h1>
                    <p className="text-[var(--color-text-muted)]">
                        Thêm, sửa, xóa các danh mục thu chi
                    </p>
                </div>
                <button onClick={handleAddNew} className="btn btn-primary">
                    <Plus className="w-4 h-4" />
                    <span>Thêm danh mục</span>
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2">
                <button
                    onClick={() => setActiveTab('expense')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'expense'
                        ? 'bg-[var(--color-danger)] text-white'
                        : 'bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)]'
                        }`}
                >
                    <TrendingDown className="w-4 h-4" />
                    Chi tiêu ({categories.filter((c) => c.type === 'expense').length})
                </button>
                <button
                    onClick={() => setActiveTab('income')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'income'
                        ? 'bg-[var(--color-success)] text-white'
                        : 'bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)]'
                        }`}
                >
                    <TrendingUp className="w-4 h-4" />
                    Thu nhập ({categories.filter((c) => c.type === 'income').length})
                </button>
            </div>

            {/* Error */}
            {error && (
                <div className="p-4 rounded-lg bg-[var(--color-danger)]/10 border border-[var(--color-danger)]/30 text-[var(--color-danger)]">
                    {error}
                </div>
            )}

            {/* Category list */}
            <div className="glass-card overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center text-[var(--color-text-muted)] flex flex-col items-center gap-2">
                        <Loader2 className="w-6 h-6 animate-spin" />
                        Đang tải danh mục...
                    </div>
                ) : filteredCategories.length === 0 ? (
                    <div className="p-12 text-center text-[var(--color-text-muted)]">
                        Chưa có danh mục nào
                    </div>
                ) : (
                    <div className="divide-y divide-[var(--color-border)]">
                        {filteredCategories.map((category) => (
                            <div
                                key={category.id}
                                className="flex items-center justify-between p-4 hover:bg-[var(--color-surface-hover)]"
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-4 h-4 rounded-full"
                                        style={{ backgroundColor: category.color }}
                                    />
                                    <span
                                        className="px-3 py-1 rounded-full text-sm font-medium"
                                        style={{
                                            backgroundColor: `${category.color}20`,
                                            color: category.color,
                                            border: `1px solid ${category.color}`,
                                        }}
                                    >
                                        {category.name}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => handleEdit(category)}
                                        className="p-2 hover:bg-[var(--color-surface)] rounded-lg transition-colors"
                                        title="Sửa"
                                    >
                                        <Edit2 className="w-4 h-4 text-[var(--color-text-secondary)]" />
                                    </button>
                                    <button
                                        onClick={() => setDeletingCategory(category)}
                                        className="p-2 rounded-lg transition-colors hover:bg-[var(--color-surface)]"
                                        title="Xóa"
                                    >
                                        <Trash2 className="w-4 h-4 text-[var(--color-text-secondary)]" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Form modal */}
            {showForm && (
                <div className="modal-backdrop" onClick={() => setShowForm(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2 className="text-xl font-bold mb-6">
                            {editingCategory ? 'Sửa Danh Mục' : 'Thêm Danh Mục'}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Type */}
                            <div>
                                <label className="block text-sm text-[var(--color-text-secondary)] mb-2">Loại</label>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, type: 'expense' })}
                                        className={`flex-1 py-3 rounded-lg font-medium transition-colors ${formData.type === 'expense'
                                            ? 'bg-[var(--color-danger)] text-white'
                                            : 'bg-[var(--color-surface-hover)] text-[var(--color-text-secondary)]'
                                            }`}
                                    >
                                        Chi tiêu
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, type: 'income' })}
                                        className={`flex-1 py-3 rounded-lg font-medium transition-colors ${formData.type === 'income'
                                            ? 'bg-[var(--color-success)] text-white'
                                            : 'bg-[var(--color-surface-hover)] text-[var(--color-text-secondary)]'
                                            }`}
                                    >
                                        Thu nhập
                                    </button>
                                </div>
                            </div>

                            {/* Name */}
                            <div>
                                <label className="block text-sm text-[var(--color-text-secondary)] mb-2">Tên danh mục</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="input"
                                    placeholder="Nhập tên danh mục..."
                                    required
                                    autoFocus
                                />
                            </div>

                            {/* Color */}
                            <div>
                                <label className="block text-sm text-[var(--color-text-secondary)] mb-2">Màu sắc</label>
                                <div className="grid grid-cols-10 gap-2 mb-3">
                                    {PRESET_COLORS.map((color) => (
                                        <button
                                            key={color}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, color })}
                                            className={`w-8 h-8 rounded-full transition-transform ${formData.color === color ? 'ring-2 ring-white ring-offset-2 ring-offset-[var(--color-surface)] scale-110' : ''
                                                }`}
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="color"
                                        value={formData.color}
                                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                        className="w-10 h-10 rounded cursor-pointer"
                                    />
                                    <span className="text-sm text-[var(--color-text-muted)]">
                                        Hoặc chọn màu tùy chỉnh
                                    </span>
                                </div>
                            </div>

                            {/* Preview */}
                            <div>
                                <label className="block text-sm text-[var(--color-text-secondary)] mb-2">Xem trước</label>
                                <span
                                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                                    style={{
                                        backgroundColor: `${formData.color}20`,
                                        color: formData.color,
                                        border: `1px solid ${formData.color}`,
                                    }}
                                >
                                    {formData.name || 'Tên danh mục'}
                                </span>
                            </div>

                            {/* Submit */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="btn btn-secondary flex-1"
                                >
                                    Hủy
                                </button>
                                <button type="submit" className="btn btn-primary flex-1" disabled={saving}>
                                    {saving ? (
                                        <><Loader2 className="w-4 h-4 animate-spin" /> Đang lưu...</>
                                    ) : (
                                        editingCategory ? 'Cập nhật' : 'Thêm'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete confirmation modal */}
            {deletingCategory && (
                <div className="modal-backdrop" onClick={() => !isDeleting && setDeletingCategory(null)}>
                    <div className="modal-content max-w-sm" onClick={(e) => e.stopPropagation()}>
                        <div className="flex flex-col items-center text-center">
                            <div className="w-14 h-14 rounded-full bg-[var(--color-danger)]/15 flex items-center justify-center mb-4">
                                <AlertTriangle className="w-7 h-7 text-[var(--color-danger)]" />
                            </div>
                            <h2 className="text-lg font-bold mb-2">Xóa danh mục?</h2>
                            <p className="text-[var(--color-text-muted)] mb-1">
                                Bạn có chắc muốn xóa danh mục
                            </p>
                            <span
                                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mb-4"
                                style={{
                                    backgroundColor: `${deletingCategory.color}20`,
                                    color: deletingCategory.color,
                                    border: `1px solid ${deletingCategory.color}`,
                                }}
                            >
                                {deletingCategory.name}
                            </span>
                            <p className="text-sm text-[var(--color-text-muted)] mb-6">
                                Hành động này không thể hoàn tác.
                            </p>
                            <div className="flex gap-3 w-full">
                                <button
                                    onClick={() => setDeletingCategory(null)}
                                    className="btn btn-secondary flex-1"
                                    disabled={isDeleting}
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={handleDeleteConfirm}
                                    className="btn flex-1 bg-[var(--color-danger)] text-white hover:opacity-90"
                                    disabled={isDeleting}
                                >
                                    {isDeleting ? (
                                        <><Loader2 className="w-4 h-4 animate-spin" /> Đang xóa...</>
                                    ) : (
                                        'Xóa'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
