'use client';

import { useState } from 'react';
import { X, User, Trash2 } from 'lucide-react';
import { PlanMoneyItem, Assignee } from '@/types/plan-money';

interface PlanMoneyFormProps {
    item?: PlanMoneyItem;
    defaultDay?: number;
    onSubmit: (data: Omit<PlanMoneyItem, 'id'>) => Promise<void>;
    onCancel: () => void;
    onDelete?: (id: string) => void;
}

const days = Array.from({ length: 30 }, (_, i) => i + 1);

export function PlanMoneyForm({ item, defaultDay, onSubmit, onCancel, onDelete }: PlanMoneyFormProps) {
    const [formData, setFormData] = useState({
        dayNumber: item?.dayNumber || defaultDay || 1,
        note: item?.note || '',
        amount: item?.amount?.toString() || '',
        type: (item?.type || 'expense') as 'income' | 'expense',
        assignee: (item?.assignee || 'Tý') as Assignee,
        description: item?.description || '',
    });
    const [submitting, setSubmitting] = useState(false);
    const [confirmingDelete, setConfirmingDelete] = useState(false);

    const handleSubmit = async () => {
        if (!formData.note || !formData.amount) return;
        setSubmitting(true);
        try {
            await onSubmit({
                dayNumber: formData.dayNumber,
                note: formData.note,
                amount: Number(formData.amount),
                type: formData.type,
                assignee: formData.assignee,
                description: formData.description,
            });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="modal-backdrop" onClick={onCancel}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold">
                        {item ? 'Sửa hạng mục' : 'Thêm hạng mục theo dõi'}
                    </h3>
                    <button
                        onClick={onCancel}
                        className="p-1 hover:bg-[var(--color-surface-hover)] rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-[var(--color-text-muted)]" />
                    </button>
                </div>

                <div className="flex flex-col gap-4">
                    {/* Type selector */}
                    <div>
                        <label className="block mb-2 text-sm text-[var(--color-text-secondary)]">Loại</label>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setFormData(p => ({ ...p, type: 'expense' }))}
                                className={`flex-1 py-2.5 rounded-lg border text-sm font-medium transition-all ${formData.type === 'expense'
                                    ? 'bg-[var(--color-danger-bg)] border-[var(--color-danger)] text-[var(--color-danger)]'
                                    : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-secondary)]'
                                    }`}
                            >
                                Chi tiêu
                            </button>
                            <button
                                onClick={() => setFormData(p => ({ ...p, type: 'income' }))}
                                className={`flex-1 py-2.5 rounded-lg border text-sm font-medium transition-all ${formData.type === 'income'
                                    ? 'bg-[var(--color-success-bg)] border-[var(--color-success)] text-[var(--color-success)]'
                                    : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-secondary)]'
                                    }`}
                            >
                                Thu nhập
                            </button>
                        </div>
                    </div>

                    {/* Person selector */}
                    <div>
                        <label className="block mb-2 text-sm text-[var(--color-text-secondary)]">Người xử lý</label>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setFormData(p => ({ ...p, assignee: 'Tý' }))}
                                className={`flex-1 py-2.5 rounded-lg border text-sm font-medium transition-all flex items-center justify-center gap-2 ${formData.assignee === 'Tý'
                                    ? 'bg-blue-500/10 border-blue-400 text-blue-400'
                                    : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-secondary)]'
                                    }`}
                            >
                                <User className="w-4 h-4" />
                                Tý
                            </button>
                            <button
                                onClick={() => setFormData(p => ({ ...p, assignee: 'Mèo' }))}
                                className={`flex-1 py-2.5 rounded-lg border text-sm font-medium transition-all flex items-center justify-center gap-2 ${formData.assignee === 'Mèo'
                                    ? 'bg-pink-500/10 border-pink-400 text-pink-400'
                                    : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-secondary)]'
                                    }`}
                            >
                                <User className="w-4 h-4" />
                                Mèo
                            </button>
                        </div>
                    </div>

                    {/* Day selector */}
                    <div>
                        <label className="block mb-2 text-sm text-[var(--color-text-secondary)]">Ngày trong tháng</label>
                        <select
                            value={formData.dayNumber}
                            onChange={(e) => setFormData(p => ({ ...p, dayNumber: Number(e.target.value) }))}
                            className="input select"
                        >
                            {days.map((d) => (
                                <option key={d} value={d}>Ngày {d}</option>
                            ))}
                        </select>
                    </div>

                    {/* Note */}
                    <div>
                        <label className="block mb-2 text-sm text-[var(--color-text-secondary)]">Tiêu đề</label>
                        <input
                            type="text"
                            value={formData.note}
                            onChange={(e) => setFormData(p => ({ ...p, note: e.target.value }))}
                            placeholder="VD: Tiền thuê nhà, Lương tháng..."
                            className="input"
                        />
                    </div>

                    {/* Amount */}
                    <div>
                        <label className="block mb-2 text-sm text-[var(--color-text-secondary)]">Số tiền (VNĐ)</label>
                        <input
                            type="text"
                            inputMode="numeric"
                            value={formData.amount ? Number(formData.amount).toLocaleString('vi-VN') : ''}
                            onChange={(e) => {
                                const raw = e.target.value.replace(/\D/g, '');
                                setFormData(p => ({ ...p, amount: raw }));
                            }}
                            placeholder="VD: 5.000.000"
                            className="input"
                            style={{ fontSize: '24px', fontWeight: 700, letterSpacing: '0.5px' }}
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block mb-2 text-sm text-[var(--color-text-secondary)]">Ghi chú thêm</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
                            placeholder="Thêm ghi chú..."
                            className="input"
                            rows={2}
                            style={{ resize: 'vertical', minHeight: '60px' }}
                        />
                    </div>

                    {/* Submit button */}
                    <button
                        onClick={handleSubmit}
                        disabled={!formData.note || !formData.amount || submitting}
                        className="btn btn-primary w-full py-3 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {submitting ? 'Đang xử lý...' : item ? 'Cập nhật' : 'Thêm hạng mục'}
                    </button>

                    {/* Delete button (edit mode only) */}
                    {item && onDelete && !confirmingDelete && (
                        <button
                            onClick={() => setConfirmingDelete(true)}
                            disabled={submitting}
                            className="w-full py-3 rounded-lg border border-[var(--color-danger)] text-[var(--color-danger)] hover:bg-[var(--color-danger-bg)] transition-all flex items-center justify-center gap-2 text-sm font-medium disabled:opacity-50"
                        >
                            <Trash2 className="w-4 h-4" />
                            Xóa hạng mục
                        </button>
                    )}

                    {/* Delete confirmation */}
                    {item && onDelete && confirmingDelete && (
                        <div className="rounded-lg border border-[var(--color-danger)] p-4 space-y-3" style={{ background: 'var(--color-danger-bg)' }}>
                            <p className="text-sm text-center text-[var(--color-danger)] font-medium">
                                Bạn có chắc muốn xóa hạng mục này?
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setConfirmingDelete(false)}
                                    className="flex-1 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-sm font-medium transition-all hover:bg-[var(--color-surface-hover)]"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={() => onDelete(item.id)}
                                    disabled={submitting}
                                    className="flex-1 py-2.5 rounded-lg bg-[var(--color-danger)] text-white text-sm font-medium transition-all hover:opacity-90 flex items-center justify-center gap-1.5 disabled:opacity-50"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    Xác nhận xóa
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
