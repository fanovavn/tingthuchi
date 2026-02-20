'use client';

import { useState, useEffect } from 'react';
import { SavingTransaction } from '@/types/saving';
import { X } from 'lucide-react';

interface SavingFormProps {
    saving?: SavingTransaction;
    onSubmit: (data: Omit<SavingTransaction, 'id'>) => void;
    onCancel: () => void;
}

export function SavingForm({ saving, onSubmit, onCancel }: SavingFormProps) {
    const [date, setDate] = useState('');
    const [amount, setAmount] = useState('');
    const [displayAmount, setDisplayAmount] = useState('');
    const [note, setNote] = useState('');
    const [type, setType] = useState<'deposit' | 'withdraw'>('deposit');
    const [submitting, setSubmitting] = useState(false);

    const formatVND = (value: string) => {
        const num = value.replace(/\D/g, '');
        if (!num) return '';
        return num.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    };

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value.replace(/\D/g, '');
        setAmount(raw);
        setDisplayAmount(formatVND(raw));
    };

    useEffect(() => {
        if (saving) {
            const d = new Date(saving.date);
            setDate(d.toISOString().split('T')[0]);
            setAmount(saving.amount.toString());
            setDisplayAmount(formatVND(saving.amount.toString()));
            setNote(saving.note);
            setType(saving.type);
        } else {
            setDate(new Date().toISOString().split('T')[0]);
        }
    }, [saving]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || !date) return;

        setSubmitting(true);
        try {
            await onSubmit({
                date: new Date(date),
                amount: parseFloat(amount),
                note,
                type,
            });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="modal-backdrop" onClick={onCancel}>
            <div className="modal-content max-w-md" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold">
                        {saving ? 'Sửa Tiết Kiệm' : 'Thêm Tiết Kiệm'}
                    </h2>
                    <button
                        onClick={onCancel}
                        className="p-2 hover:bg-[var(--color-surface-hover)] rounded-lg"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Type selector */}
                    <div>
                        <label className="block text-sm text-[var(--color-text-secondary)] mb-2">
                            Loại giao dịch
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={() => setType('deposit')}
                                className={`p-3 rounded-xl text-sm font-medium border-2 transition-all ${type === 'deposit'
                                    ? 'border-[var(--color-success)] bg-[var(--color-success-bg)] text-[var(--color-success)]'
                                    : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-success)]'
                                    }`}
                            >
                                Gửi vào
                            </button>
                            <button
                                type="button"
                                onClick={() => setType('withdraw')}
                                className={`p-3 rounded-xl text-sm font-medium border-2 transition-all ${type === 'withdraw'
                                    ? 'border-[var(--color-danger)] bg-[var(--color-danger-bg)] text-[var(--color-danger)]'
                                    : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-danger)]'
                                    }`}
                            >
                                Rút ra
                            </button>
                        </div>
                    </div>

                    {/* Amount */}
                    <div>
                        <label className="block text-sm text-[var(--color-text-secondary)] mb-2">
                            Số tiền (đ)
                        </label>
                        <input
                            type="text"
                            inputMode="numeric"
                            value={displayAmount}
                            onChange={handleAmountChange}
                            placeholder="0"
                            required
                            className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] focus:border-[var(--color-primary)] focus:outline-none transition-colors font-semibold" style={{ fontSize: '24px' }}
                        />
                    </div>

                    {/* Date */}
                    <div>
                        <label className="block text-sm text-[var(--color-text-secondary)] mb-2">
                            Ngày
                        </label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            required
                            className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] focus:border-[var(--color-primary)] focus:outline-none transition-colors"
                        />
                    </div>

                    {/* Note */}
                    <div>
                        <label className="block text-sm text-[var(--color-text-secondary)] mb-2">
                            Ghi chú
                        </label>
                        <input
                            type="text"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Nhập ghi chú..."
                            className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] focus:border-[var(--color-primary)] focus:outline-none transition-colors"
                        />
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={submitting || !amount || !date}
                        className="btn btn-primary w-full mt-2"
                    >
                        {submitting ? 'Đang lưu...' : saving ? 'Cập nhật' : 'Thêm mới'}
                    </button>
                </form>
            </div>
        </div>
    );
}
