'use client';

import { useState, useEffect } from 'react';
import { LoanItem, LoanPriority, LoanType } from '@/types/loan';
import { X, Trash2 } from 'lucide-react';

interface LoanFormProps {
    item?: LoanItem;
    onSubmit: (data: Omit<LoanItem, 'id'>) => Promise<void>;
    onCancel: () => void;
    onDelete?: (id: string) => Promise<void>;
}

const PRIORITY_OPTIONS: LoanPriority[] = ['ASAP', 'Trả ngay'];
const TYPE_OPTIONS: LoanType[] = ['Thế chấp', 'Tín dụng', 'Trả góp', 'Khác'];

// Format number with dot separators: 5000000 → "5.000.000"
const formatMoney = (val: string | number): string => {
    const num = typeof val === 'number' ? val : parseFloat(String(val).replace(/\./g, '')) || 0;
    if (num === 0 && String(val) === '') return '';
    return num.toLocaleString('vi-VN');
};
// Parse formatted string back to number: "5.000.000" → 5000000
const parseMoney = (val: string): number => {
    return parseFloat(val.replace(/\./g, '')) || 0;
};

export function LoanForm({ item, onSubmit, onCancel, onDelete }: LoanFormProps) {
    const [title, setTitle] = useState(item?.title || '');
    const [amount, setAmount] = useState(item?.amount ? formatMoney(item.amount) : '');
    const [priority, setPriority] = useState<LoanPriority>(item?.priority || 'ASAP');
    const [typeLoan, setTypeLoan] = useState<LoanType>(item?.typeLoan || 'Tín dụng');
    const [monthlyInterest, setMonthlyInterest] = useState(item?.monthlyInterest ? formatMoney(item.monthlyInterest) : '0');
    const [monthlyPayment, setMonthlyPayment] = useState(item?.monthlyPayment ? formatMoney(item.monthlyPayment) : '0');
    const [description, setDescription] = useState(item?.description || '');
    const [needClear, setNeedClear] = useState(item?.needClear || false);
    const [clearAmount, setClearAmount] = useState(formatMoney(item?.clearAmount || item?.amount || 0));
    const [submitting, setSubmitting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const handleMoneyInput = (value: string, setter: (v: string) => void) => {
        // Strip non-digit chars, then format
        const digits = value.replace(/[^0-9]/g, '');
        if (digits === '' || digits === '0') {
            setter('0');
        } else {
            setter(formatMoney(parseInt(digits, 10)));
        }
    };

    useEffect(() => {
        if (item) {
            setTitle(item.title);
            setAmount(formatMoney(item.amount));
            setPriority(item.priority);
            setTypeLoan(item.typeLoan);
            setMonthlyInterest(formatMoney(item.monthlyInterest));
            setMonthlyPayment(formatMoney(item.monthlyPayment));
            setDescription(item.description);
            setNeedClear(item.needClear);
            setClearAmount(formatMoney(item.clearAmount || item.amount));
        }
    }, [item]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !amount) return;

        setSubmitting(true);
        try {
            await onSubmit({
                title: title.trim(),
                amount: parseMoney(amount),
                priority,
                typeLoan,
                monthlyInterest: parseMoney(monthlyInterest),
                monthlyPayment: parseMoney(monthlyPayment),
                description: description.trim(),
                needClear,
                clearAmount: needClear ? Math.min(parseMoney(clearAmount), parseMoney(amount)) : 0,
            });
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!item || !onDelete) return;
        setSubmitting(true);
        try {
            await onDelete(item.id);
        } finally {
            setSubmitting(false);
        }
    };

    const getPriorityColor = (p: LoanPriority) => {
        return p === 'ASAP' ? 'var(--color-danger)' : 'var(--color-warning)';
    };

    const getTypeColor = (t: LoanType) => {
        switch (t) {
            case 'Thế chấp': return '#8b5cf6';
            case 'Tín dụng': return '#f59e0b';
            case 'Trả góp': return '#22c55e';
            case 'Khác': return '#6366f1';
            default: return 'var(--color-primary)';
        }
    };

    return (
        <div className="modal-backdrop" onClick={onCancel}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '560px' }}>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold">
                        {item ? 'Chỉnh sửa khoản nợ' : 'Thêm khoản nợ mới'}
                    </h2>
                    <button onClick={onCancel} className="p-1 rounded-lg hover:bg-[var(--color-surface-hover)]">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                            Tên khoản nợ <span className="text-[var(--color-danger)]">*</span>
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="VD: Nợ mua nhà, Nợ tín dụng VCB..."
                            className="input"
                            required
                        />
                    </div>

                    {/* Amount */}
                    <div>
                        <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                            Tổng dư nợ (đ) <span className="text-[var(--color-danger)]">*</span>
                        </label>
                        <input
                            type="text"
                            inputMode="numeric"
                            value={amount}
                            onChange={(e) => handleMoneyInput(e.target.value, setAmount)}
                            placeholder="VD: 100.000.000"
                            className="input"
                            required
                        />
                    </div>

                    {/* Priority & Type - row */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                                Mức ưu tiên
                            </label>
                            <div className="flex gap-2">
                                {PRIORITY_OPTIONS.map((p) => (
                                    <button
                                        key={p}
                                        type="button"
                                        onClick={() => setPriority(p)}
                                        className="flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all"
                                        style={{
                                            background: priority === p ? getPriorityColor(p) : 'var(--color-surface-hover)',
                                            color: priority === p ? '#fff' : 'var(--color-text-secondary)',
                                            border: `1px solid ${priority === p ? getPriorityColor(p) : 'var(--color-border)'}`,
                                        }}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                                Loại khoản nợ
                            </label>
                            <div className="flex gap-1.5">
                                {TYPE_OPTIONS.map((t) => (
                                    <button
                                        key={t}
                                        type="button"
                                        onClick={() => setTypeLoan(t)}
                                        className="flex-1 py-2 px-2 rounded-lg text-xs font-medium transition-all"
                                        style={{
                                            background: typeLoan === t ? getTypeColor(t) : 'var(--color-surface-hover)',
                                            color: typeLoan === t ? '#fff' : 'var(--color-text-secondary)',
                                            border: `1px solid ${typeLoan === t ? getTypeColor(t) : 'var(--color-border)'}`,
                                        }}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Monthly Interest & Monthly Payment */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                                Lãi hàng tháng (đ)
                            </label>
                            <input
                                type="text"
                                inputMode="numeric"
                                value={monthlyInterest}
                                onChange={(e) => handleMoneyInput(e.target.value, setMonthlyInterest)}
                                placeholder="0"
                                className="input"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                                Tổng trả tháng (đ)
                            </label>
                            <input
                                type="text"
                                inputMode="numeric"
                                value={monthlyPayment}
                                onChange={(e) => handleMoneyInput(e.target.value, setMonthlyPayment)}
                                placeholder="0"
                                className="input"
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                            Ghi chú
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="VD: Trả trong 10 năm từ 2023 đến 2033"
                            className="input"
                            rows={2}
                            style={{ resize: 'vertical' }}
                        />
                    </div>

                    {/* NeedClear toggle */}
                    <div
                        className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all"
                        style={{
                            background: needClear ? 'rgba(239, 68, 68, 0.1)' : 'var(--color-surface-hover)',
                            border: `1px solid ${needClear ? 'var(--color-danger)' : 'var(--color-border)'}`,
                            borderRadius: needClear ? '0.75rem 0.75rem 0 0' : '0.75rem',
                        }}
                        onClick={() => {
                            const newNeedClear = !needClear;
                            setNeedClear(newNeedClear);
                            if (newNeedClear) {
                                // Default clearAmount to total amount
                                setClearAmount(amount || '0');
                            } else {
                                setClearAmount('0');
                            }
                        }}
                    >
                        <div
                            className="w-5 h-5 rounded flex items-center justify-center transition-all"
                            style={{
                                background: needClear ? 'var(--color-danger)' : 'transparent',
                                border: `2px solid ${needClear ? 'var(--color-danger)' : 'var(--color-border)'}`,
                            }}
                        >
                            {needClear && (
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                    <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            )}
                        </div>
                        <div>
                            <span className="text-sm font-medium">Cần ưu tiên trả</span>
                            <p className="text-xs text-[var(--color-text-muted)]">
                                Đánh dấu để tập trung clear trong ngắn hạn
                            </p>
                        </div>
                    </div>

                    {/* Clear Amount input — shows when needClear is on */}
                    {needClear && (
                        <div
                            className="p-3 rounded-xl"
                            style={{
                                background: 'rgba(239, 68, 68, 0.05)',
                                border: '1px solid var(--color-danger)',
                                borderTop: 'none',
                                borderRadius: '0 0 0.75rem 0.75rem',
                                marginTop: '-1px',
                            }}
                        >
                            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                                Số tiền muốn clear (đ)
                            </label>
                            <input
                                type="text"
                                inputMode="numeric"
                                value={clearAmount}
                                onChange={(e) => {
                                    const digits = e.target.value.replace(/[^0-9]/g, '');
                                    const val = parseInt(digits, 10) || 0;
                                    const maxAmount = parseMoney(amount);
                                    if (val > maxAmount) {
                                        setClearAmount(formatMoney(maxAmount));
                                    } else if (digits === '' || digits === '0') {
                                        setClearAmount('0');
                                    } else {
                                        setClearAmount(formatMoney(val));
                                    }
                                }}
                                placeholder="Nhập số tiền muốn clear"
                                className="input"
                                onClick={(e) => e.stopPropagation()}
                            />
                            {parseMoney(amount) > 0 && (
                                <div className="flex items-center justify-between mt-2">
                                    <span className="text-xs text-[var(--color-text-muted)]">
                                        Tương đương {(parseMoney(clearAmount) / parseMoney(amount) * 100).toFixed(1)}% tổng nợ
                                    </span>
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setClearAmount(amount);
                                        }}
                                        className="text-[10px] px-2 py-0.5 rounded-full font-medium transition-all"
                                        style={{
                                            background: 'rgba(239, 68, 68, 0.15)',
                                            color: 'var(--color-danger)',
                                        }}
                                    >
                                        Clear toàn bộ
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-3 pt-2">
                        {item && onDelete && (
                            <>
                                {showDeleteConfirm ? (
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={handleDelete}
                                            disabled={submitting}
                                            className="btn btn-danger text-xs"
                                        >
                                            Xác nhận xoá
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setShowDeleteConfirm(false)}
                                            className="btn btn-secondary text-xs"
                                        >
                                            Huỷ
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => setShowDeleteConfirm(true)}
                                        className="p-2 rounded-lg text-[var(--color-danger)] hover:bg-[var(--color-danger-bg)] transition-colors"
                                        title="Xoá khoản nợ"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                )}
                            </>
                        )}
                        <div className="flex-1" />
                        <button type="button" onClick={onCancel} className="btn btn-secondary">
                            Huỷ
                        </button>
                        <button
                            type="submit"
                            disabled={submitting || !title.trim() || !amount}
                            className="btn btn-primary"
                            style={{ opacity: submitting ? 0.6 : 1 }}
                        >
                            {submitting ? 'Đang lưu...' : item ? 'Cập nhật' : 'Thêm khoản nợ'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
