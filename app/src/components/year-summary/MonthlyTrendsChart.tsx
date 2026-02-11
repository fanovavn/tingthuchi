'use client';

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend,
    ChartOptions,
} from 'chart.js';
import { Chart } from 'react-chartjs-2';
import { formatCurrency } from '@/lib/utils';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend
);

interface MonthlyTrendsChartProps {
    data: {
        month: number;
        income: number;
        expense: number;
        net: number;
    }[];
}

export function MonthlyTrendsChart({ data }: MonthlyTrendsChartProps) {
    const labels = data.map(d => `T${d.month}`);
    const incomeData = data.map(d => d.income);
    const expenseData = data.map(d => d.expense);
    const netData = data.map(d => d.net);

    const chartData = {
        labels,
        datasets: [
            {
                type: 'line' as const,
                label: 'Dòng tiền ròng (Net)',
                data: netData,
                borderColor: '#3b82f6', // blue-500
                backgroundColor: 'rgba(59, 130, 246, 0.5)',
                borderWidth: 2,
                pointRadius: 4,
                tension: 0.3,
                yAxisID: 'y',
            },
            {
                type: 'bar' as const,
                label: 'Thu nhập',
                data: incomeData,
                backgroundColor: 'rgba(34, 197, 94, 0.7)', // green-500
                borderColor: '#22c55e',
                borderWidth: 1,
                borderRadius: 4,
                yAxisID: 'y',
            },
            {
                type: 'bar' as const,
                label: 'Chi tiêu',
                data: expenseData,
                backgroundColor: 'rgba(239, 68, 68, 0.7)', // red-500
                borderColor: '#ef4444',
                borderWidth: 1,
                borderRadius: 4,
                yAxisID: 'y',
            },
        ],
    };

    const options: ChartOptions<'bar' | 'line'> = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const,
                labels: {
                    color: 'var(--color-text-secondary)',
                    font: { size: 12 },
                    usePointStyle: true,
                    padding: 16,
                },
            },
            tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                titleColor: '#fff',
                bodyColor: 'rgba(255, 255, 255, 0.8)',
                borderColor: 'rgba(99, 102, 241, 0.3)',
                borderWidth: 1,
                cornerRadius: 8,
                padding: 12,
                callbacks: {
                    label: (context) => {
                        const label = context.dataset.label || '';
                        const value = context.parsed.y ?? 0;
                        return `${label}: ${formatCurrency(value)}`;
                    },
                },
            },
        },
        interaction: {
            mode: 'index',
            intersect: false,
        },
        scales: {
            x: {
                grid: {
                    display: true,
                    color: 'rgba(200, 200, 200, 0.2)',
                },
                ticks: {
                    color: 'var(--color-text-secondary)',
                },
            },
            y: {
                beginAtZero: true,
                grid: {
                    display: true,
                    color: 'rgba(200, 200, 200, 0.2)',
                },
                ticks: {
                    color: 'var(--color-text-secondary)',
                    callback: (value) => {
                        const num = typeof value === 'number' ? value : parseInt(value, 10);
                        if (num >= 1000000) return `${(num / 1000000).toFixed(0)}M`;
                        if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
                        return num.toString();
                    },
                },
            },
        },
    };

    return (
        <div className="glass-card p-6">
            <h3 className="text-lg font-semibold mb-4 text-[var(--color-text-primary)]">Xu Hướng Thu Chi Theo Tháng</h3>
            <div className="h-[350px]">
                <Chart type="bar" data={chartData} options={options} />
            </div>
        </div>
    );
}
