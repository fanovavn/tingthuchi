'use client';

import { Transaction } from '@/types/transaction';
import { formatCurrency, formatDate } from '@/lib/utils';
import { X, ArrowUpRight, ArrowDownRight, Calendar, Tag, FileText } from 'lucide-react';
import { CategoryLabel } from '@/components/ui/CategoryLabel';

interface TransactionDetailProps {
    transaction: Transaction;
    onClose: () => void;
}

export function TransactionDetail({ transaction, onClose }: TransactionDetailProps) {
    const isIncome = transaction.type === 'income';

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content max-w-md overflow-hidden" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold">Chi Tiết Giao Dịch</h2>
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
                        className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${isIncome ? 'bg-[var(--color-success-bg)]' : 'bg-[var(--color-danger-bg)]'
                            }`}
                    >
                        {isIncome ? (
                            <ArrowUpRight className="w-8 h-8 text-[var(--color-success)]" />
                        ) : (
                            <ArrowDownRight className="w-8 h-8 text-[var(--color-danger)]" />
                        )}
                    </div>
                    <div
                        className={`text-3xl font-bold mb-2 ${isIncome ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'
                            }`}
                    >
                        {isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </div>
                    <span
                        className={`inline-block px-3 py-1 rounded-full text-sm ${isIncome ? 'bg-[var(--color-success-bg)] text-[var(--color-success)]' : 'bg-[var(--color-danger-bg)] text-[var(--color-danger)]'
                            }`}
                    >
                        {isIncome ? 'Thu nhập' : 'Chi tiêu'}
                    </span>
                </div>

                {/* Details */}
                <div className="space-y-4">
                    {/* Category */}
                    <div className="flex items-start gap-3 p-3 bg-[var(--color-surface-hover)] rounded-lg">
                        <Tag className="w-5 h-5 text-[var(--color-text-muted)] mt-0.5" />
                        <div className="flex-1">
                            <p className="text-xs text-[var(--color-text-muted)] mb-1">Danh mục</p>
                            <CategoryLabel category={transaction.category} size="md" />
                        </div>
                    </div>

                    {/* Date */}
                    <div className="flex items-start gap-3 p-3 bg-[var(--color-surface-hover)] rounded-lg">
                        <Calendar className="w-5 h-5 text-[var(--color-text-muted)] mt-0.5" />
                        <div className="flex-1">
                            <p className="text-xs text-[var(--color-text-muted)] mb-1">Ngày</p>
                            <p className="font-medium">{formatDate(transaction.date)}</p>
                        </div>
                    </div>

                    {/* Description */}
                    {transaction.description && (
                        <div className="flex items-start gap-3 p-3 bg-[var(--color-surface-hover)] rounded-lg">
                            <FileText className="w-5 h-5 text-[var(--color-text-muted)] mt-0.5" />
                            <div className="flex-1">
                                <p className="text-xs text-[var(--color-text-muted)] mb-1">Mô tả</p>
                                <p className="font-medium">{transaction.description}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Close button */}
                <button onClick={onClose} className="btn btn-secondary w-full mt-6">
                    Đóng
                </button>
            </div>
        </div>
    );
}
