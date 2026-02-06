'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Transaction, CATEGORIES } from '@/types/transaction';

interface TransactionFormProps {
    transaction?: Transaction;
    onSubmit: (data: Omit<Transaction, 'id'>) => void;
    onSubmitBatch?: (data: Omit<Transaction, 'id'>[]) => void;
    onCancel: () => void;
}

const LAST_DATE_KEY = 'ting-last-transaction-date';
const LAST_CATEGORY_KEY = 'ting-last-transaction-category';
const LAST_TYPE_KEY = 'ting-last-transaction-type';

const getLastDate = (): string => {
    if (typeof window !== 'undefined') {
        const saved = localStorage.getItem(LAST_DATE_KEY);
        if (saved) return saved;
    }
    return new Date().toISOString().slice(0, 10);
};

const getLastCategory = (type: 'income' | 'expense'): string => {
    if (typeof window !== 'undefined') {
        const savedCategory = localStorage.getItem(LAST_CATEGORY_KEY);
        const savedType = localStorage.getItem(LAST_TYPE_KEY);
        if (savedCategory && savedType === type) {
            return savedCategory;
        }
    }
    return type === 'expense' ? 'Ăn uống' : 'Lương tháng';
};

const getLastType = (): 'income' | 'expense' => {
    if (typeof window !== 'undefined') {
        const saved = localStorage.getItem(LAST_TYPE_KEY);
        if (saved === 'income' || saved === 'expense') return saved;
    }
    return 'expense';
};

const saveLastSelections = (date: string, category: string, type: 'income' | 'expense') => {
    if (typeof window !== 'undefined') {
        localStorage.setItem(LAST_DATE_KEY, date);
        localStorage.setItem(LAST_CATEGORY_KEY, category);
        localStorage.setItem(LAST_TYPE_KEY, type);
    }
};

const getCategoriesForType = (type: 'income' | 'expense') => {
    if (type === 'income') {
        return ['Lương tháng', 'Freelancer', 'Được tặng', 'Khoản thu khác'];
    }
    return CATEGORIES.filter(c => !['Lương tháng', 'Freelancer', 'Được tặng', 'Khoản thu khác'].includes(c));
};

const formatAmountInput = (value: string): string => {
    const numericValue = value.replace(/[^\d]/g, '');
    if (!numericValue) return '';
    return parseInt(numericValue, 10).toLocaleString('vi-VN');
};

interface FormData {
    type: 'income' | 'expense';
    amount: string;
    category: string;
    date: string;
    description: string;
}

export function TransactionForm({ transaction, onSubmit, onCancel }: TransactionFormProps) {
    const isEditing = !!transaction;

    const [formData, setFormData] = useState<FormData>(() => {
        if (transaction) {
            return {
                type: transaction.type,
                amount: transaction.amount.toLocaleString('vi-VN'),
                category: transaction.category,
                date: new Date(transaction.date).toISOString().slice(0, 10),
                description: transaction.description,
            };
        }
        const lastType = getLastType();
        return {
            type: lastType,
            amount: '',
            category: getLastCategory(lastType),
            date: getLastDate(),
            description: '',
        };
    });

    const updateFormData = (field: keyof FormData, value: string) => {
        setFormData(prev => {
            const updated = { ...prev, [field]: value };
            if (field === 'type') {
                const newType = value as 'income' | 'expense';
                const cats = getCategoriesForType(newType);
                // Try to use last saved category for this type, or default to first
                const savedCategory = getLastCategory(newType);
                updated.category = cats.includes(savedCategory) ? savedCategory : cats[0];
            }
            if (field === 'amount') {
                updated.amount = formatAmountInput(value);
            }
            return updated;
        });
    };

    const parseAmount = (amountStr: string): number => {
        return parseFloat(amountStr.replace(/\./g, '').replace(/,/g, '')) || 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const amount = parseAmount(formData.amount);
        if (amount <= 0) {
            alert('Vui lòng nhập số tiền hợp lệ');
            return;
        }

        // Save last selections for next time
        saveLastSelections(formData.date, formData.category, formData.type);

        onSubmit({
            type: formData.type,
            amount: amount,
            category: formData.category,
            date: new Date(formData.date),
            description: formData.description,
        });

        onCancel();
    };

    return (
        <div className="modal-backdrop" onClick={onCancel}>
            <div className="modal-content max-w-md" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">
                        {isEditing ? 'Sửa Giao Dịch' : 'Thêm Giao Dịch'}
                    </h2>
                    <button onClick={onCancel} className="p-2 hover:bg-[var(--color-surface-hover)] rounded-lg">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Type toggle */}
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => updateFormData('type', 'expense')}
                            className={`flex-1 py-2.5 rounded-lg font-medium transition-colors ${formData.type === 'expense'
                                ? 'bg-[var(--color-danger)] text-white'
                                : 'bg-[var(--color-surface-hover)] text-[var(--color-text-secondary)]'
                                }`}
                        >
                            Chi tiêu
                        </button>
                        <button
                            type="button"
                            onClick={() => updateFormData('type', 'income')}
                            className={`flex-1 py-2.5 rounded-lg font-medium transition-colors ${formData.type === 'income'
                                ? 'bg-[var(--color-success)] text-white'
                                : 'bg-[var(--color-surface-hover)] text-[var(--color-text-secondary)]'
                                }`}
                        >
                            Thu nhập
                        </button>
                    </div>

                    {/* Amount */}
                    <div>
                        <label className="block text-xs text-[var(--color-text-muted)] mb-1">
                            Số tiền (VND) *
                        </label>
                        <input
                            type="text"
                            inputMode="numeric"
                            value={formData.amount}
                            onChange={(e) => updateFormData('amount', e.target.value)}
                            className="input w-full text-lg font-semibold"
                            placeholder="0"
                            autoComplete="off"
                            autoFocus
                        />
                    </div>

                    {/* Category & Date */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs text-[var(--color-text-muted)] mb-1">
                                Danh mục
                            </label>
                            <select
                                value={formData.category}
                                onChange={(e) => updateFormData('category', e.target.value)}
                                className="input w-full"
                            >
                                {getCategoriesForType(formData.type).map((cat) => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs text-[var(--color-text-muted)] mb-1">
                                Ngày
                            </label>
                            <input
                                type="date"
                                value={formData.date}
                                onChange={(e) => updateFormData('date', e.target.value)}
                                className="input w-full"
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-xs text-[var(--color-text-muted)] mb-1">
                            Mô tả
                        </label>
                        <input
                            type="text"
                            value={formData.description}
                            onChange={(e) => updateFormData('description', e.target.value)}
                            className="input w-full"
                            placeholder="Nhập mô tả..."
                            autoComplete="off"
                        />
                    </div>

                    {/* Submit buttons */}
                    <div className="flex gap-3 pt-4">
                        <button type="button" onClick={onCancel} className="btn btn-secondary flex-1">
                            Hủy
                        </button>
                        <button type="submit" className="btn btn-primary flex-1">
                            {isEditing ? 'Cập nhật' : 'Thêm'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
