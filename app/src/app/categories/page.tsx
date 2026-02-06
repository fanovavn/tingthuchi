'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Tag, TrendingUp, TrendingDown } from 'lucide-react';
import { CategoryLabel, getCategoryColor } from '@/components/ui/CategoryLabel';

interface Category {
    id: string;
    name: string;
    type: 'income' | 'expense';
    color: string;
}

const STORAGE_KEY = 'crm-categories';

// Default categories
const DEFAULT_CATEGORIES: Category[] = [
    // Expense categories
    { id: '1', name: 'Ăn uống', type: 'expense', color: '#ef4444' },
    { id: '2', name: 'Nấu ăn/siêu thị', type: 'expense', color: '#f97316' },
    { id: '3', name: 'Mua sắm', type: 'expense', color: '#ec4899' },
    { id: '4', name: 'Sức khoẻ', type: 'expense', color: '#22c55e' },
    { id: '5', name: 'Hoá đơn (ĐT, net, cc...)', type: 'expense', color: '#3b82f6' },
    { id: '6', name: 'Trả nợ', type: 'expense', color: '#a855f7' },
    { id: '7', name: 'Đi lại: Đổ xăng', type: 'expense', color: '#eab308' },
    { id: '8', name: 'Đi lại: Taxi', type: 'expense', color: '#f59e0b' },
    { id: '9', name: 'Đi lại: Thuê xe', type: 'expense', color: '#fbbf24' },
    { id: '10', name: 'Đi lại: Sửa xe', type: 'expense', color: '#a1a1aa' },
    { id: '11', name: 'Làm đẹp', type: 'expense', color: '#f472b6' },
    { id: '12', name: 'Tiệc tùng/vui chơi', type: 'expense', color: '#8b5cf6' },
    { id: '13', name: 'Thú cưng', type: 'expense', color: '#84cc16' },
    { id: '14', name: 'Học tập', type: 'expense', color: '#06b6d4' },
    { id: '15', name: 'Làm việc', type: 'expense', color: '#6366f1' },
    { id: '16', name: 'Quà tặng', type: 'expense', color: '#d946ef' },
    { id: '17', name: 'Tiền học kitty', type: 'expense', color: '#14b8a6' },
    { id: '18', name: 'Bảo hiểm', type: 'expense', color: '#64748b' },
    { id: '19', name: 'Sửa nhà', type: 'expense', color: '#78716c' },
    { id: '20', name: 'Du lịch', type: 'expense', color: '#0ea5e9' },
    // Income categories
    { id: '21', name: 'Lương tháng', type: 'income', color: '#22c55e' },
    { id: '22', name: 'Freelancer', type: 'income', color: '#10b981' },
    { id: '23', name: 'Được tặng', type: 'income', color: '#34d399' },
    { id: '24', name: 'Khoản thu khác', type: 'income', color: '#6ee7b7' },
];

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [activeTab, setActiveTab] = useState<'expense' | 'income'>('expense');
    const [showForm, setShowForm] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | undefined>();
    const [formData, setFormData] = useState({ name: '', type: 'expense' as 'income' | 'expense', color: '#6366f1' });
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

    // Load categories from localStorage
    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                setCategories(JSON.parse(stored));
            } catch {
                setCategories(DEFAULT_CATEGORIES);
            }
        } else {
            setCategories(DEFAULT_CATEGORIES);
        }
    }, []);

    // Save to localStorage
    useEffect(() => {
        if (categories.length > 0) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
        }
    }, [categories]);

    const filteredCategories = categories.filter((c) => c.type === activeTab);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingCategory) {
            setCategories((prev) =>
                prev.map((c) =>
                    c.id === editingCategory.id
                        ? { ...c, name: formData.name, type: formData.type, color: formData.color }
                        : c
                )
            );
        } else {
            const newCategory: Category = {
                id: Date.now().toString(),
                name: formData.name,
                type: formData.type,
                color: formData.color,
            };
            setCategories((prev) => [...prev, newCategory]);
        }
        setShowForm(false);
        setEditingCategory(undefined);
        setFormData({ name: '', type: 'expense', color: '#6366f1' });
    };

    const handleEdit = (category: Category) => {
        setEditingCategory(category);
        setFormData({ name: category.name, type: category.type, color: category.color });
        setShowForm(true);
    };

    const handleDelete = (id: string) => {
        if (deleteConfirm === id) {
            setCategories((prev) => prev.filter((c) => c.id !== id));
            setDeleteConfirm(null);
        } else {
            setDeleteConfirm(id);
            setTimeout(() => setDeleteConfirm(null), 3000);
        }
    };

    const handleAddNew = () => {
        setEditingCategory(undefined);
        setFormData({ name: '', type: activeTab, color: '#6366f1' });
        setShowForm(true);
    };

    const PRESET_COLORS = [
        '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
        '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
        '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
        '#ec4899', '#f472b6', '#64748b', '#78716c', '#a1a1aa',
    ];

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

            {/* Category list */}
            <div className="glass-card overflow-hidden">
                {filteredCategories.length === 0 ? (
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
                                        onClick={() => handleDelete(category.id)}
                                        className={`p-2 rounded-lg transition-colors ${deleteConfirm === category.id
                                                ? 'bg-[var(--color-danger)] text-white'
                                                : 'hover:bg-[var(--color-surface)]'
                                            }`}
                                        title={deleteConfirm === category.id ? 'Nhấn lần nữa để xóa' : 'Xóa'}
                                    >
                                        <Trash2
                                            className={`w-4 h-4 ${deleteConfirm === category.id
                                                    ? 'text-white'
                                                    : 'text-[var(--color-text-secondary)]'
                                                }`}
                                        />
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
                                <label className="block text-sm text-[var(--color-text-secondary)] mb-2">
                                    Loại
                                </label>
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
                                <label className="block text-sm text-[var(--color-text-secondary)] mb-2">
                                    Tên danh mục
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="input"
                                    placeholder="Nhập tên danh mục..."
                                    required
                                />
                            </div>

                            {/* Color */}
                            <div>
                                <label className="block text-sm text-[var(--color-text-secondary)] mb-2">
                                    Màu sắc
                                </label>
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
                                <label className="block text-sm text-[var(--color-text-secondary)] mb-2">
                                    Xem trước
                                </label>
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
                                <button type="submit" className="btn btn-primary flex-1">
                                    {editingCategory ? 'Cập nhật' : 'Thêm'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
