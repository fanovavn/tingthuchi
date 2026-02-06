'use client';

import { useRef, useEffect } from 'react';
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
import { Bar } from 'react-chartjs-2';
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

interface TrendChartProps {
    data: Record<string, { income: number; expense: number }>;
    title?: string;
}

export function TrendChart({ data, title = 'Thu Chi Theo Ngày' }: TrendChartProps) {
    const labels = Object.keys(data);
    const incomeData = labels.map((key) => data[key].income);
    const expenseData = labels.map((key) => data[key].expense);

    const chartData = {
        labels,
        datasets: [
            {
                label: 'Thu nhập',
                data: incomeData,
                backgroundColor: 'rgba(34, 197, 94, 0.7)',
                borderColor: '#22c55e',
                borderWidth: 1,
                borderRadius: 4,
            },
            {
                label: 'Chi tiêu',
                data: expenseData,
                backgroundColor: 'rgba(239, 68, 68, 0.7)',
                borderColor: '#ef4444',
                borderWidth: 1,
                borderRadius: 4,
            },
        ],
    };

    const options: ChartOptions<'bar'> = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const,
                labels: {
                    color: 'rgba(255, 255, 255, 0.8)',
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
            // Data labels plugin configuration
            datalabels: {
                display: false,
            },
        },
        scales: {
            x: {
                grid: {
                    color: 'rgba(255, 255, 255, 0.05)',
                },
                ticks: {
                    color: 'rgba(255, 255, 255, 0.6)',
                },
            },
            y: {
                grid: {
                    color: 'rgba(255, 255, 255, 0.05)',
                },
                ticks: {
                    color: 'rgba(255, 255, 255, 0.6)',
                    callback: (value) => {
                        const num = typeof value === 'number' ? value : parseInt(value, 10);
                        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
                        if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
                        return num.toString();
                    },
                },
            },
        },
    };

    // Custom plugin to show values on top of bars
    const dataLabelPlugin = {
        id: 'dataLabelPlugin',
        afterDatasetsDraw(chart: ChartJS) {
            const { ctx } = chart;

            chart.data.datasets.forEach((dataset, datasetIndex) => {
                const meta = chart.getDatasetMeta(datasetIndex);
                meta.data.forEach((bar, index) => {
                    const value = dataset.data[index] as number;
                    if (value > 0) {
                        ctx.save();
                        ctx.fillStyle = dataset.borderColor as string;
                        ctx.font = 'bold 10px sans-serif';
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'bottom';

                        let displayValue: string;
                        if (value >= 1000000) {
                            displayValue = `${(value / 1000000).toFixed(1)}M`;
                        } else if (value >= 1000) {
                            displayValue = `${Math.round(value / 1000)}K`;
                        } else {
                            displayValue = value.toString();
                        }

                        ctx.fillText(displayValue, bar.x, bar.y - 4);
                        ctx.restore();
                    }
                });
            });
        },
    };

    return (
        <div className="glass-card p-6">
            <h3 className="text-lg font-semibold mb-4">{title}</h3>
            <div className="h-[300px]">
                <Bar data={chartData} options={options} plugins={[dataLabelPlugin]} />
            </div>
        </div>
    );
}
