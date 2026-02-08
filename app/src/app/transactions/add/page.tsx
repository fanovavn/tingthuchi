'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useTransactions } from '@/hooks/useTransactions';
import { Transaction } from '@/types/transaction';
import { TransactionForm } from '@/components/transactions';

function AddTransactionContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const returnUrl = searchParams.get('returnUrl') || '/transactions';

    const { addTransaction } = useTransactions();

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

        // Navigate back
        router.push(returnUrl);
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
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                mode="page"
            />
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
