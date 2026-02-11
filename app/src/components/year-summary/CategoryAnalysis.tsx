'use client';

import { Chart as ChartJS, ArcElement, Tooltip, Legend, ChartOptions } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { formatCurrency } from '@/lib/utils';
import { CategoryLabel } from '@/components/ui/CategoryLabel';

ChartJS.register(ArcElement, Tooltip, Legend);

interface CategoryAnalysisProps {
    expenseCategories: { category: string; amount: number; percentage: number }[];
    incomeSources: { source: string; amount: number; percentage: number }[];
}

export function CategoryAnalysis({ expenseCategories, incomeSources }: CategoryAnalysisProps) {
    // Expense Pie Chart Data
    const expenseData = {
        labels: expenseCategories.map(c => c.category),
        datasets: [
            {
                data: expenseCategories.map(c => c.amount),
                backgroundColor: [
                    '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981',
                    '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1', '#a855f7',
                ],
                borderWidth: 1,
                borderColor: '#1e293b',
            },
        ],
    };

    // Income Pie Chart Data
    const incomeData = {
        labels: incomeSources.map(s => s.source),
        datasets: [
            {
                data: incomeSources.map(s => s.amount),
                backgroundColor: [
                    '#22c55e', '#3b82f6', '#f59e0b', '#a855f7', '#ec4899',
                ],
                borderWidth: 1,
                borderColor: '#1e293b',
            },
        ],
    };

    const options: ChartOptions<'pie'> = {
        responsive: true,
        plugins: {
            legend: {
                position: 'right' as const,
                labels: {
                    color: 'var(--color-text-secondary)',
                    boxWidth: 12,
                    font: { size: 11 },
                },
            },
            tooltip: {
                callbacks: {
                    label: (context) => {
                        const label = context.label || '';
                        const value = context.parsed || 0;
                        const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                        const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
                        return `${label}: ${formatCurrency(value)} (${percentage}%)`;
                    },
                },
            },
        },
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Expense Breakdown */}
            <div className="glass-card p-6">
                <h3 className="text-lg font-semibold mb-4 text-[var(--color-text-primary)]">Phân Bổ Chi Tiêu</h3>
                <div className="h-[300px] flex justify-center">
                    <Pie data={expenseData} options={options} />
                </div>
            </div>

            {/* Income Breakdown */}
            <div className="glass-card p-6">
                <h3 className="text-lg font-semibold mb-4 text-[var(--color-text-primary)]">Nguồn Thu Nhập</h3>
                <div className="h-[300px] flex justify-center">
                    <Pie data={incomeData} options={options} />
                </div>
            </div>

            {/* Top Expenses List */}
            <div className="glass-card p-6 lg:col-span-2">
                <h3 className="text-lg font-semibold mb-4 text-[var(--color-text-primary)]">Top 10 Danh Mục Chi Tiêu</h3>
                <div className="space-y-3">
                    {expenseCategories.map((item, index) => (
                        <div key={item.category} className="flex items-center justify-between p-3 rounded-lg bg-[var(--color-surface-hover)]">
                            <div className="flex items-center gap-3">
                                <span className="text-sm font-bold text-[var(--color-text-muted)] w-6">{index + 1}</span>
                                <CategoryLabel category={item.category} showIcon />
                            </div>
                            <div className="text-right">
                                <div className="font-bold text-[var(--color-danger)]">{formatCurrency(item.amount)}</div>
                                <div className="text-xs text-[var(--color-text-muted)]">{item.percentage.toFixed(1)}%</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
