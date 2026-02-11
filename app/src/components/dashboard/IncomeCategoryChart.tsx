'use client';

import { Chart as ChartJS, ArcElement, Tooltip, Legend, ChartOptions, DoughnutController } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { formatCurrency } from '@/lib/utils';
import { getCategoryColor } from '@/components/ui/CategoryLabel';

ChartJS.register(ArcElement, Tooltip, Legend, DoughnutController);

interface IncomeCategoryChartProps {
    data: { category: string; amount: number }[];
    title?: string;
}

export function IncomeCategoryChart({ data, title = 'Phân Loại Thu Nhập' }: IncomeCategoryChartProps) {
    const totalAmount = data.reduce((sum, item) => sum + item.amount, 0);

    const chartData = {
        labels: data.map((item) => item.category),
        datasets: [
            {
                data: data.map((item) => item.amount),
                backgroundColor: data.map((item) => {
                    const colors = getCategoryColor(item.category);
                    return colors.bg.replace('0.15', '0.8');
                }),
                borderColor: data.map((item) => getCategoryColor(item.category).border),
                borderWidth: 2,
            },
        ],
    };

    const options: ChartOptions<'doughnut'> = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '60%',
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                titleColor: '#fff',
                bodyColor: 'rgba(255, 255, 255, 0.8)',
                borderColor: 'rgba(34, 197, 94, 0.3)',
                borderWidth: 1,
                cornerRadius: 8,
                padding: 12,
                callbacks: {
                    label: (context) => {
                        const value = context.parsed ?? 0;
                        const percentage = ((value / totalAmount) * 100).toFixed(1);
                        return `${formatCurrency(value)} (${percentage}%)`;
                    },
                },
            },
        },
    };

    if (data.length === 0) {
        return (
            <div className="glass-card p-6">
                <h3 className="text-lg font-semibold mb-4">{title}</h3>
                <div className="flex items-center justify-center h-[280px] text-[var(--color-text-muted)]">
                    Không có dữ liệu thu nhập
                </div>
            </div>
        );
    }

    return (
        <div className="glass-card p-6">
            <h3 className="text-lg font-semibold mb-4">{title}</h3>

            {/* Chart centered */}
            <div className="flex justify-center mb-6">
                <div className="relative w-[250px] h-[250px]">
                    <Doughnut data={chartData} options={options} />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="text-center">
                            <p className="text-xs text-[var(--color-text-muted)]">Tổng thu</p>
                            <p className="text-lg font-bold text-[var(--color-success)]">
                                {formatCurrency(totalAmount)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Grid layout for all categories - no scrolling */}
            <div className="grid grid-cols-2 gap-2">
                {data.map((item, index) => {
                    const colors = getCategoryColor(item.category);
                    const percentage = ((item.amount / totalAmount) * 100).toFixed(1);
                    return (
                        <div
                            key={index}
                            className="flex items-center justify-between p-2 rounded-lg bg-[var(--color-surface-hover)]"
                        >
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                                <div
                                    className="w-2 h-2 rounded-full flex-shrink-0"
                                    style={{ backgroundColor: colors.border }}
                                />
                                <span className="text-xs truncate">{item.category}</span>
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0 ml-1">
                                <span className="text-xs font-medium text-[var(--color-success)]">
                                    {item.amount >= 1000000
                                        ? `${(item.amount / 1000000).toFixed(1)}M`
                                        : item.amount >= 1000
                                            ? `${Math.round(item.amount / 1000)}K`
                                            : formatCurrency(item.amount)}
                                </span>
                                <span className="text-[10px] text-[var(--color-text-muted)]">
                                    {percentage}%
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
