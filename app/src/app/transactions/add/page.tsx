'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { ArrowLeft, CheckCircle, Plus, List } from 'lucide-react';
import { useTransactions } from '@/hooks/useTransactions';
import { Transaction } from '@/types/transaction';
import { TransactionForm } from '@/components/transactions';

function AddTransactionContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const returnUrl = searchParams.get('returnUrl') || '/transactions';

    const { addTransaction } = useTransactions();
    const [showSuccess, setShowSuccess] = useState(false);
    const [formKey, setFormKey] = useState(0); // Key to reset form

    const handleSubmit = async (data: Omit<Transaction, 'id'>) => {
        // Add transaction to database
        addTransaction(data);

        // Send Telegram notification (fire-and-forget, don't block user)
        fetch('/api/telegram', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                amount: data.amount,
                description: data.description,
                date: data.date.toISOString(),
                category: data.category,
                type: data.type,
            }),
        }).catch(err => console.error('Telegram notification failed:', err));

        // Show success popup
        setShowSuccess(true);
    };

    const handleAddAnother = () => {
        setShowSuccess(false);
        setFormKey(prev => prev + 1); // Reset form by changing key
    };

    const handleGoToList = () => {
        router.push('/transactions');
    };

    const handleCancel = () => {
        router.push(returnUrl);
    };

    return (
        <div className="max-w-lg mx-auto">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <button
                    onClick={handleCancel}
                    className="p-2 hover:bg-[var(--color-surface-hover)] rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold">Thêm Giao Dịch</h1>
                    <p className="text-sm text-[var(--color-text-muted)]">
                        Tạo giao dịch mới
                    </p>
                </div>
            </div>

            {/* Form - page mode */}
            <TransactionForm
                key={formKey}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                mode="page"
            />

            {/* Success Modal */}
            {showSuccess && (
                <div className="modal-backdrop" onClick={() => setShowSuccess(false)}>
                    <div
                        className="modal-content max-w-sm text-center"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-center mb-4">
                            <div className="w-16 h-16 rounded-full bg-[var(--color-success)]/20 flex items-center justify-center">
                                <CheckCircle className="w-10 h-10 text-[var(--color-success)]" />
                            </div>
                        </div>

                        <h2 className="text-xl font-bold mb-2">Thành công!</h2>
                        <p className="text-[var(--color-text-muted)] mb-6">
                            Giao dịch đã được thêm thành công.
                        </p>

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={handleAddAnother}
                                className="btn btn-primary w-full flex items-center justify-center gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                Thêm giao dịch khác
                            </button>
                            <button
                                onClick={handleGoToList}
                                className="btn btn-secondary w-full flex items-center justify-center gap-2"
                            >
                                <List className="w-4 h-4" />
                                Về danh sách giao dịch
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function AddTransactionPage() {
    return (
        <Suspense fallback={
            <div className="max-w-lg mx-auto">
                <div className="glass-card p-8 text-center">
                    <div className="skeleton h-8 w-32 mx-auto mb-4" />
                    <p className="text-[var(--color-text-muted)]">Đang tải...</p>
                </div>
            </div>
        }>
            <AddTransactionContent />
        </Suspense>
    );
}
