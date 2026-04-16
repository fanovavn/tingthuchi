'use client';

import { useState } from 'react';
import { usePlanMoney } from '@/hooks/usePlanMoney';
import { PlanMoneyTimeline, PlanMoneyForm } from '@/components/plan-money';
import { PlanMoneyItem } from '@/types/plan-money';
import { Plus, RefreshCw, Loader2, X, Copy, Check } from 'lucide-react';

export default function PlanMoneyPage() {
    const { items, loading, error, addItem, updateItem, deleteItem, toggleCheck, clearAllChecks } = usePlanMoney();
    const [showForm, setShowForm] = useState(false);
    const [editingItem, setEditingItem] = useState<PlanMoneyItem | undefined>();
    const [defaultDay, setDefaultDay] = useState<number | undefined>();
    const [showPending, setShowPending] = useState(false);
    const [copiedTy, setCopiedTy] = useState(false);
    const [copiedMeo, setCopiedMeo] = useState(false);

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

    const pendingTy = items.filter(i => i.assignee === 'Tý' && i.type === 'expense' && !i.checked).sort((a, b) => a.dayNumber - b.dayNumber);
    const pendingMeo = items.filter(i => i.assignee === 'Mèo' && i.type === 'expense' && !i.checked).sort((a, b) => a.dayNumber - b.dayNumber);

    const formatCurrency = (amount: number) => amount.toLocaleString('vi-VN') + ' đ';

    const buildCopyText = (name: string, list: PlanMoneyItem[]) => {
        const total = list.reduce((s, i) => s + i.amount, 0);
        const lines = list.map(i => `- Ngày ${i.dayNumber}: ${i.note} — ${formatCurrency(i.amount)}`);
        return `${name} cần xử lý (${formatCurrency(total)}):\n${lines.join('\n')}`;
    };

    const handleCopy = (who: 'Tý' | 'Mèo') => {
        const list = who === 'Tý' ? pendingTy : pendingMeo;
        navigator.clipboard.writeText(buildCopyText(who, list));
        if (who === 'Tý') {
            setCopiedTy(true);
            setTimeout(() => setCopiedTy(false), 2000);
        } else {
            setCopiedMeo(true);
            setTimeout(() => setCopiedMeo(false), 2000);
        }
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
                onShowPending={() => setShowPending(true)}
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

            {/* Pending Modal */}
            {showPending && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
                    onClick={() => setShowPending(false)}
                >
                    <div
                        className="glass-card w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Modal header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)]">
                            <h2 className="text-base font-semibold">Danh sách chưa xử lý</h2>
                            <button onClick={() => setShowPending(false)} className="p-1.5 rounded-lg hover:bg-[var(--color-surface-hover)] transition-colors">
                                <X className="w-4 h-4 text-[var(--color-text-secondary)]" />
                            </button>
                        </div>

                        {/* Modal body */}
                        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-5">
                            {/* Tý list */}
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 bg-blue-500/10 rounded-full flex items-center justify-center">
                                            <span className="text-xs font-bold text-blue-400">T</span>
                                        </div>
                                        <span className="text-sm font-semibold text-blue-400">
                                            Tý — {formatCurrency(pendingTy.reduce((s, i) => s + i.amount, 0))}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => handleCopy('Tý')}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:bg-[var(--color-surface-hover)]"
                                        style={{ border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}
                                    >
                                        {copiedTy ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                                        {copiedTy ? 'Đã copy' : 'Copy'}
                                    </button>
                                </div>
                                {pendingTy.length === 0 ? (
                                    <p className="text-xs text-[var(--color-text-muted)] italic">Không có khoản nào chưa xử lý</p>
                                ) : (
                                    <div className="space-y-1.5">
                                        {pendingTy.map(item => (
                                            <div key={item.id} className="flex items-center justify-between py-1.5 px-3 rounded-lg" style={{ backgroundColor: 'var(--color-surface-elevated)' }}>
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <span className="text-xs text-[var(--color-text-muted)] shrink-0">Ngày {item.dayNumber}</span>
                                                    <span className="text-sm text-[var(--color-text-primary)] truncate">{item.note}</span>
                                                </div>
                                                <span className="text-sm font-medium text-red-400 shrink-0 ml-2">{formatCurrency(item.amount)}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="h-px bg-[var(--color-border)]" />

                            {/* Mèo list */}
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 bg-pink-500/10 rounded-full flex items-center justify-center">
                                            <span className="text-xs font-bold text-pink-400">M</span>
                                        </div>
                                        <span className="text-sm font-semibold text-pink-400">
                                            Mèo — {formatCurrency(pendingMeo.reduce((s, i) => s + i.amount, 0))}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => handleCopy('Mèo')}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:bg-[var(--color-surface-hover)]"
                                        style={{ border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}
                                    >
                                        {copiedMeo ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                                        {copiedMeo ? 'Đã copy' : 'Copy'}
                                    </button>
                                </div>
                                {pendingMeo.length === 0 ? (
                                    <p className="text-xs text-[var(--color-text-muted)] italic">Không có khoản nào chưa xử lý</p>
                                ) : (
                                    <div className="space-y-1.5">
                                        {pendingMeo.map(item => (
                                            <div key={item.id} className="flex items-center justify-between py-1.5 px-3 rounded-lg" style={{ backgroundColor: 'var(--color-surface-elevated)' }}>
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <span className="text-xs text-[var(--color-text-muted)] shrink-0">Ngày {item.dayNumber}</span>
                                                    <span className="text-sm text-[var(--color-text-primary)] truncate">{item.note}</span>
                                                </div>
                                                <span className="text-sm font-medium text-red-400 shrink-0 ml-2">{formatCurrency(item.amount)}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
