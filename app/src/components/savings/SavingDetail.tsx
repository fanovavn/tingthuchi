'use client';

import { useState } from 'react';
import { SavingTransaction } from '@/types/saving';
import { formatCurrency, formatDate } from '@/lib/utils';
import { X, ArrowDownToLine, ArrowUpFromLine, Calendar, FileText, Edit2, Trash2 } from 'lucide-react';
import { ConfirmDeleteDialog } from '@/components/transactions/ConfirmDeleteDialog';

interface SavingDetailProps {
    saving: SavingTransaction;
    onClose: () => void;
    onEdit?: (saving: SavingTransaction) => void;
    onDelete?: (id: string) => void;
}

export function SavingDetail({ saving, onClose, onEdit, onDelete }: SavingDetailProps) {
    const isDeposit = saving.type === 'deposit';
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const handleEdit = () => {
        onClose();
        onEdit?.(saving);
    };

    const handleDelete = () => {
        setShowDeleteConfirm(true);
    };

    const handleConfirmDelete = () => {
        onDelete?.(saving.id);
        setShowDeleteConfirm(false);
        onClose();
    };

    return (
        <>
            <div className="modal-backdrop" onClick={onClose}>
                <div className="modal-content max-w-md overflow-hidden" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold">Chi Tiết Tiết Kiệm</h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-[var(--color-surface-hover)] rounded-lg"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Amount display */}
                    <div className="text-center mb-8">
                        <div
                            className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${isDeposit ? 'bg-[var(--color-success-bg)]' : 'bg-[var(--color-danger-bg)]'
                                }`}
                        >
                            {isDeposit ? (
                                <ArrowDownToLine className="w-8 h-8 text-[var(--color-success)]" />
                            ) : (
                                <ArrowUpFromLine className="w-8 h-8 text-[var(--color-danger)]" />
                            )}
                        </div>
                        <div
                            className={`text-3xl font-bold mb-2 ${isDeposit ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'
                                }`}
                        >
                            {isDeposit ? '+' : '-'}{formatCurrency(saving.amount)}
                        </div>
                        <span
                            className={`inline-block px-3 py-1 rounded-full text-sm ${isDeposit
                                    ? 'bg-[var(--color-success-bg)] text-[var(--color-success)]'
                                    : 'bg-[var(--color-danger-bg)] text-[var(--color-danger)]'
                                }`}
                        >
                            {isDeposit ? 'Gửi vào' : 'Rút ra'}
                        </span>
                    </div>

                    {/* Details */}
                    <div className="space-y-4">
                        {/* Date */}
                        <div className="flex items-start gap-3 p-3 bg-[var(--color-surface-hover)] rounded-lg">
                            <Calendar className="w-5 h-5 text-[var(--color-text-muted)] mt-0.5" />
                            <div className="flex-1">
                                <p className="text-xs text-[var(--color-text-muted)] mb-1">Ngày</p>
                                <p className="font-medium">{formatDate(saving.date)}</p>
                            </div>
                        </div>

                        {/* Note */}
                        {saving.note && (
                            <div className="flex items-start gap-3 p-3 bg-[var(--color-surface-hover)] rounded-lg">
                                <FileText className="w-5 h-5 text-[var(--color-text-muted)] mt-0.5" />
                                <div className="flex-1">
                                    <p className="text-xs text-[var(--color-text-muted)] mb-1">Ghi chú</p>
                                    <p className="font-medium">{saving.note}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Action buttons */}
                    {(onEdit || onDelete) && (
                        <div className="flex gap-3 mt-6">
                            {onEdit && (
                                <button
                                    onClick={handleEdit}
                                    className="btn btn-primary flex-1 flex items-center justify-center gap-2"
                                >
                                    <Edit2 className="w-4 h-4" />
                                    Sửa
                                </button>
                            )}
                            {onDelete && (
                                <button
                                    onClick={handleDelete}
                                    className="btn flex-1 flex items-center justify-center gap-2 border-2 border-[var(--color-danger)] text-[var(--color-danger)] hover:bg-[var(--color-danger-bg)]"
                                    style={{ background: 'transparent' }}
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Xóa
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <ConfirmDeleteDialog
                open={showDeleteConfirm}
                onOpenChange={(open) => !open && setShowDeleteConfirm(false)}
                onConfirm={handleConfirmDelete}
                title="Xóa giao dịch tiết kiệm?"
                description="Hành động này không thể hoàn tác. Bạn có chắc chắn muốn xóa giao dịch tiết kiệm này không?"
            />
        </>
    );
}
