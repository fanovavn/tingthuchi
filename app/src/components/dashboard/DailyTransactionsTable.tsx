'use client';

import React from 'react';
import { format } from 'date-fns';
import { formatCurrency } from '@/lib/utils';

export interface DailyStats {
    date: Date;
    income: number;
    expense: number;
    count: number;
}

interface DailyTransactionsTableProps {
    data: DailyStats[];
    title?: string;
    onRowClick?: (date: Date) => void;
}

export function DailyTransactionsTable({ data, title = 'Thu Chi Theo Ngày', onRowClick }: DailyTransactionsTableProps) {
    // Sort data by date descending (newest first)
    const sortedData = [...data].sort((a, b) => b.date.getTime() - a.date.getTime());

    return (
        <div className="glass-card p-6 overflow-hidden">
            <h3 className="text-lg font-semibold mb-4">{title}</h3>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs uppercase bg-[var(--color-surface-hover)] text-[var(--color-text-muted)]">
                        <tr>
                            <th className="px-4 py-3 rounded-l-lg">Ngày</th>
                            <th className="px-4 py-3 text-right">Tổng Thu</th>
                            <th className="px-4 py-3 text-right">Tổng Chi</th>
                            <th className="px-4 py-3 text-right">Chênh Lệch (vs Hôm qua)</th>
                            <th className="px-4 py-3 text-right rounded-r-lg">TB Giao Dịch</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedData.length > 0 ? (
                            sortedData.map((day, index) => {
                                // Calculate difference with next item in sorted array (which is the previous day chronologically)
                                const previousDay = sortedData[index + 1];

                                // Compare Expense only
                                const currentExpense = day.expense;
                                const previousExpense = previousDay ? previousDay.expense : 0;

                                // Difference in Expense
                                const difference = previousDay ? (currentExpense - previousExpense) : 0;

                                // Average Transaction Value = (Total Volume) / Count
                                const avgValue = day.count > 0 ? (day.income + day.expense) / day.count : 0;

                                // Check if this day is today
                                const isToday = new Date().toDateString() === day.date.toDateString();

                                const rowContent = (
                                    <tr
                                        key={day.date.toISOString()}
                                        onClick={() => onRowClick && onRowClick(day.date)}
                                        className={`transition-all cursor-pointer ${isToday
                                            ? 'bg-purple-50 dark:bg-purple-900/30 shadow-md relative z-10'
                                            : 'border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-surface-hover)]'
                                            }`}
                                    >
                                        <td className={`px-4 py-3 font-medium ${isToday ? 'text-base font-bold rounded-l-lg border-y-2 border-l-2 border-purple-600 dark:border-purple-400' : ''}`}>
                                            {format(day.date, 'dd/MM/yyyy')}
                                        </td>
                                        <td className={`px-4 py-3 text-right text-green-500 font-medium ${isToday ? 'text-base font-bold border-y-2 border-purple-600 dark:border-purple-400' : ''}`}>
                                            {formatCurrency(day.income)}
                                        </td>
                                        <td className={`px-4 py-3 text-right text-red-500 font-medium ${isToday ? 'text-base font-bold border-y-2 border-purple-600 dark:border-purple-400' : ''}`}>
                                            {formatCurrency(day.expense)}
                                        </td>
                                        <td className={`px-4 py-3 text-right ${isToday ? 'text-base font-bold border-y-2 border-purple-600 dark:border-purple-400' : ''}`}>
                                            <div className="flex items-center justify-end gap-1">
                                                {!previousDay ? (
                                                    <span className="text-[var(--color-text-muted)]">-</span>
                                                ) : difference > 0 ? (
                                                    <span className="text-red-500 font-medium whitespace-nowrap">
                                                        Tăng {formatCurrency(difference)}
                                                    </span>
                                                ) : difference < 0 ? (
                                                    <span className="text-green-500 font-medium whitespace-nowrap">
                                                        Giảm {formatCurrency(Math.abs(difference))}
                                                    </span>
                                                ) : (
                                                    <span className="text-[var(--color-text-muted)]">0 ₫</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className={`px-4 py-3 text-right ${isToday ? 'text-base font-bold rounded-r-lg border-y-2 border-r-2 border-purple-600 dark:border-purple-400' : ''}`}>
                                            {formatCurrency(avgValue)}
                                        </td>
                                    </tr>
                                );

                                if (isToday) {
                                    return (
                                        <React.Fragment key={`${day.date.toISOString()}-group`}>
                                            {/* Spacer before */}
                                            <tr className="h-4 border-none pointer-events-none bg-transparent">
                                                <td colSpan={5} className="p-0 border-none"></td>
                                            </tr>

                                            {rowContent}

                                            {/* Spacer after */}
                                            <tr className="h-4 border-none pointer-events-none bg-transparent">
                                                <td colSpan={5} className="p-0 border-none"></td>
                                            </tr>
                                        </React.Fragment>
                                    );
                                }

                                return rowContent;
                            })
                        ) : (
                            <tr>
                                <td colSpan={5} className="px-4 py-8 text-center text-[var(--color-text-muted)]">
                                    Chưa có dữ liệu giao dịch
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
