'use client';

import { useState, useEffect } from 'react';
import { InvestmentItem, InvestmentType, InvestmentStatus } from '@/types/investment';
import { X, Trash2 } from 'lucide-react';

interface InvestmentFormProps {
    item?: InvestmentItem;
    onSubmit: (data: Omit<InvestmentItem, 'id'>) => Promise<void>;
    onCancel: () => void;
    onDelete?: (id: string) => Promise<void>;
}

const TYPE_OPTIONS: InvestmentType[] = ['Vàng', 'Crypto', 'Cổ phiếu', 'Bất động sản', 'Tiết kiệm', 'Quỹ', 'Khác'];
const STATUS_OPTIONS: InvestmentStatus[] = ['Đang giữ', 'Đã bán', 'Chốt lời', 'Cắt lỗ'];

const formatMoney = (val: string | number): string => {
    const num = typeof val === 'number' ? val : parseFloat(String(val).replace(/\./g, '')) || 0;
    if (num === 0 && String(val) === '') return '';
    return num.toLocaleString('vi-VN');
};
const parseMoney = (val: string): number => parseFloat(val.replace(/\./g, '')) || 0;

const getTypeColor = (type: string): string => {
    const colors: Record<string, string> = {
        'Vàng': '#f59e0b',
        'Crypto': '#f97316',
        'Cổ phiếu': '#3b82f6',
        'Bất động sản': '#8b5cf6',
        'Tiết kiệm': '#22c55e',
        'Quỹ': '#14b8a6',
        'Khác': '#6366f1',
    };
    return colors[type] || '#6366f1';
};

const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
        'Đang giữ': '#3b82f6',
        'Đã bán': '#6b7280',
        'Chốt lời': '#22c55e',
        'Cắt lỗ': '#ef4444',
    };
    return colors[status] || '#6b7280';
};

export function InvestmentForm({ item, onSubmit, onCancel, onDelete }: InvestmentFormProps) {
    const [title, setTitle] = useState(item?.title || '');
    const [type, setType] = useState<InvestmentType>(item?.type || 'Cổ phiếu');
    const [buyPrice, setBuyPrice] = useState(item?.buyPrice ? formatMoney(item.buyPrice) : '');
    const [quantity, setQuantity] = useState(item?.quantity?.toString() || '1');
    const [currentPrice, setCurrentPrice] = useState(item?.currentPrice ? formatMoney(item.currentPrice) : '');
    const [buyDate, setBuyDate] = useState(item?.buyDate || '');
    const [status, setStatus] = useState<InvestmentStatus>(item?.status || 'Đang giữ');
    const [platform, setPlatform] = useState(item?.platform || '');
    const [note, setNote] = useState(item?.note || '');
    const [submitting, setSubmitting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const handleMoneyInput = (value: string, setter: (v: string) => void) => {
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
            setType(item.type);
            setBuyPrice(formatMoney(item.buyPrice));
            setQuantity(item.quantity.toString());
            setCurrentPrice(formatMoney(item.currentPrice));
            setBuyDate(item.buyDate);
            setStatus(item.status);
            setPlatform(item.platform);
            setNote(item.note);
        }
    }, [item]);

    // Computed values
    const bp = parseMoney(buyPrice);
    const qty = parseFloat(quantity) || 0;
    const cp = parseMoney(currentPrice);
    const totalInvested = bp * qty;
    const currentValue = cp * qty;
    const profitLoss = currentValue - totalInvested;
    const profitPercent = totalInvested > 0 ? ((profitLoss / totalInvested) * 100) : 0;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !buyPrice) return;
        setSubmitting(true);
        try {
            await onSubmit({
                title: title.trim(),
                type,
                buyPrice: bp,
                quantity: qty,
                totalInvested,
                currentPrice: cp,
                currentValue,
                profitLoss,
                profitPercent,
                buyDate,
                status,
                platform: platform.trim(),
                note: note.trim(),
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
            setShowDeleteConfirm(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
            <div
                className="glass-card w-full max-w-lg max-h-[90vh] overflow-y-auto"
                style={{ border: '1px solid var(--color-border)' }}
            >
                <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
                    <h2 className="text-lg font-bold">
                        {item ? 'Chỉnh sửa khoản đầu tư' : 'Thêm khoản đầu tư mới'}
                    </h2>
                    <button onClick={onCancel} className="p-1 rounded-lg hover:bg-[var(--color-surface-hover)]">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 p-4">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                            Tên khoản đầu tư <span className="text-[var(--color-danger)]">*</span>
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="VD: Vàng SJC, Bitcoin, Cổ phiếu FPT..."
                            className="input"
                            required
                        />
                    </div>

                    {/* Type */}
                    <div>
                        <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                            Loại đầu tư
                        </label>
                        <div className="flex gap-2 flex-wrap">
                            {TYPE_OPTIONS.map((t) => (
                                <button
                                    key={t}
                                    type="button"
                                    onClick={() => setType(t)}
                                    className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                                    style={{
                                        background: type === t ? `${getTypeColor(t)}20` : 'var(--color-surface-hover)',
                                        color: type === t ? getTypeColor(t) : 'var(--color-text-muted)',
                                        border: `1.5px solid ${type === t ? getTypeColor(t) : 'transparent'}`,
                                    }}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Buy Price & Quantity */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                                Giá mua (đ) <span className="text-[var(--color-danger)]">*</span>
                            </label>
                            <input
                                type="text"
                                inputMode="numeric"
                                value={buyPrice}
                                onChange={(e) => handleMoneyInput(e.target.value, setBuyPrice)}
                                placeholder="VD: 92.000.000"
                                className="input"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                                Số lượng
                            </label>
                            <input
                                type="text"
                                inputMode="decimal"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                placeholder="VD: 2, 0.5..."
                                className="input"
                            />
                        </div>
                    </div>

                    {/* Current Price */}
                    <div>
                        <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                            Giá hiện tại (đ)
                        </label>
                        <input
                            type="text"
                            inputMode="numeric"
                            value={currentPrice}
                            onChange={(e) => handleMoneyInput(e.target.value, setCurrentPrice)}
                            placeholder="VD: 95.000.000"
                            className="input"
                        />
                    </div>

                    {/* Computed preview */}
                    {totalInvested > 0 && (
                        <div className="p-3 rounded-xl space-y-2" style={{
                            background: profitLoss >= 0 ? 'rgba(34, 197, 94, 0.06)' : 'rgba(239, 68, 68, 0.06)',
                            border: `1px solid ${profitLoss >= 0 ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
                        }}>
                            <div className="flex justify-between text-sm">
                                <span className="text-[var(--color-text-muted)]">Tổng vốn</span>
                                <span className="font-semibold">{formatMoney(totalInvested)} đ</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-[var(--color-text-muted)]">Giá trị hiện tại</span>
                                <span className="font-semibold">{formatMoney(currentValue)} đ</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-[var(--color-text-muted)]">Lãi / Lỗ</span>
                                <span className="font-bold" style={{ color: profitLoss >= 0 ? '#22c55e' : '#ef4444' }}>
                                    {profitLoss >= 0 ? '+' : ''}{formatMoney(profitLoss)} đ ({profitPercent >= 0 ? '+' : ''}{profitPercent.toFixed(1)}%)
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Status & Date */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                                Trạng thái
                            </label>
                            <div className="flex gap-1.5 flex-wrap">
                                {STATUS_OPTIONS.map((s) => (
                                    <button
                                        key={s}
                                        type="button"
                                        onClick={() => setStatus(s)}
                                        className="px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all"
                                        style={{
                                            background: status === s ? `${getStatusColor(s)}20` : 'var(--color-surface-hover)',
                                            color: status === s ? getStatusColor(s) : 'var(--color-text-muted)',
                                            border: `1.5px solid ${status === s ? getStatusColor(s) : 'transparent'}`,
                                        }}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                                Ngày mua
                            </label>
                            <input
                                type="date"
                                value={buyDate}
                                onChange={(e) => setBuyDate(e.target.value)}
                                className="input"
                            />
                        </div>
                    </div>

                    {/* Platform */}
                    <div>
                        <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                            Sàn / Nơi giao dịch
                        </label>
                        <input
                            type="text"
                            value={platform}
                            onChange={(e) => setPlatform(e.target.value)}
                            placeholder="VD: Binance, SSI, SJC, Vietcombank..."
                            className="input"
                        />
                    </div>

                    {/* Note */}
                    <div>
                        <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                            Ghi chú
                        </label>
                        <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="VD: Mua DCA hàng tháng..."
                            className="input"
                            rows={2}
                            style={{ resize: 'vertical' }}
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 pt-2">
                        {item && onDelete && (
                            !showDeleteConfirm ? (
                                <button
                                    type="button"
                                    onClick={() => setShowDeleteConfirm(true)}
                                    className="flex items-center gap-1 text-[var(--color-danger)] text-sm font-medium p-2 rounded-lg hover:bg-[rgba(239,68,68,0.1)] transition-all"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Xóa
                                </button>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={handleDelete}
                                        disabled={submitting}
                                        className="text-xs font-medium px-3 py-1.5 rounded-lg text-white transition-all"
                                        style={{ background: 'var(--color-danger)' }}
                                    >
                                        {submitting ? 'Đang xóa...' : 'Xác nhận xóa'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowDeleteConfirm(false)}
                                        className="text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-[var(--color-surface-hover)]"
                                    >
                                        Hủy
                                    </button>
                                </div>
                            )
                        )}
                        <div className="flex-1" />
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-4 py-2 rounded-xl text-sm font-medium hover:bg-[var(--color-surface-hover)] transition-all"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={submitting || !title.trim()}
                            className="px-5 py-2 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50"
                            style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}
                        >
                            {submitting ? 'Đang lưu...' : item ? 'Cập nhật' : 'Thêm mới'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
