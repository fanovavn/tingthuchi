import { Flame, PiggyBank, TrendingDown, TrendingUp, Calendar, Wallet } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { YearlyStats } from "./YearlyAnalytics";
import { CategoryLabel } from "@/components/ui/CategoryLabel";

interface KeyHighlightsProps {
    highlights: YearlyStats['highlights'];
}

export function KeyHighlights({ highlights }: KeyHighlightsProps) {
    return (
        <div className="space-y-6">
            {/* Big Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Biggest Expense */}
                {highlights.biggestExpenseTx && (
                    <div className="glass-card p-6 border-l-4 border-l-[var(--color-danger)]">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm text-[var(--color-text-muted)] mb-1">Khoản chi lớn nhất</p>
                                <h3 className="text-2xl font-bold text-[var(--color-danger)]">
                                    {formatCurrency(highlights.biggestExpenseTx.amount)}
                                </h3>
                                <div className="mt-3 flex items-center gap-2">
                                    <CategoryLabel category={highlights.biggestExpenseTx.category} size="sm" />
                                </div>
                                <p className="text-sm text-[var(--color-text-secondary)] mt-2 italic">
                                    "{highlights.biggestExpenseTx.description || 'Không có ghi chú'}"
                                </p>
                            </div>
                            <div className="p-3 rounded-full bg-[var(--color-danger-bg)] text-[var(--color-danger)]">
                                <Flame className="w-6 h-6" />
                            </div>
                        </div>
                        <p className="text-xs text-[var(--color-text-muted)] mt-4">
                            Ngày: {formatDate(new Date(highlights.biggestExpenseTx.date))}
                        </p>
                    </div>
                )}

                {/* Biggest Income */}
                {highlights.biggestIncomeTx && (
                    <div className="glass-card p-6 border-l-4 border-l-[var(--color-success)]">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm text-[var(--color-text-muted)] mb-1">Khoản thu lớn nhất</p>
                                <h3 className="text-2xl font-bold text-[var(--color-success)]">
                                    {formatCurrency(highlights.biggestIncomeTx.amount)}
                                </h3>
                                <div className="mt-3 flex items-center gap-2">
                                    <CategoryLabel category={highlights.biggestIncomeTx.category} size="sm" />
                                </div>
                                <p className="text-sm text-[var(--color-text-secondary)] mt-2 italic">
                                    "{highlights.biggestIncomeTx.description || 'Không có ghi chú'}"
                                </p>
                            </div>
                            <div className="p-3 rounded-full bg-[var(--color-success-bg)] text-[var(--color-success)]">
                                <Wallet className="w-6 h-6" />
                            </div>
                        </div>
                        <p className="text-xs text-[var(--color-text-muted)] mt-4">
                            Ngày: {formatDate(new Date(highlights.biggestIncomeTx.date))}
                        </p>
                    </div>
                )}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Max Expense Month */}
                {highlights.maxExpenseMonth && (
                    <div className="stat-card">
                        <div className="flex items-center gap-2 mb-2 text-[var(--color-text-muted)]">
                            <Calendar className="w-4 h-4" />
                            <span className="text-xs">Tháng chi nhiều nhất</span>
                        </div>
                        <p className="text-xl font-bold text-[var(--color-danger)]">
                            Tháng {highlights.maxExpenseMonth.month}
                        </p>
                        <p className="text-sm text-[var(--color-text-secondary)]">
                            {formatCurrency(highlights.maxExpenseMonth.amount)}
                        </p>
                    </div>
                )}

                {/* Best Savings Month */}
                {highlights.bestSavingsMonth && (
                    <div className="stat-card">
                        <div className="flex items-center gap-2 mb-2 text-[var(--color-text-muted)]">
                            <PiggyBank className="w-4 h-4" />
                            <span className="text-xs">Dư dả tốt nhất</span>
                        </div>
                        <p className="text-xl font-bold text-[var(--color-success)]">
                            Tháng {highlights.bestSavingsMonth.month}
                        </p>
                        <p className="text-sm text-[var(--color-text-secondary)]">
                            {formatCurrency(highlights.bestSavingsMonth.amount)}
                        </p>
                    </div>
                )}

                {/* Avg Income */}
                <div className="stat-card">
                    <div className="flex items-center gap-2 mb-2 text-[var(--color-text-muted)]">
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-xs">TB Thu / Tháng</span>
                    </div>
                    <p className="text-lg font-bold text-[var(--color-success)]">
                        {formatCurrency(highlights.avgMonthlyIncome)}
                    </p>
                </div>

                {/* Avg Expense */}
                <div className="stat-card">
                    <div className="flex items-center gap-2 mb-2 text-[var(--color-text-muted)]">
                        <TrendingDown className="w-4 h-4" />
                        <span className="text-xs">TB Chi / Tháng</span>
                    </div>
                    <p className="text-lg font-bold text-[var(--color-danger)]">
                        {formatCurrency(highlights.avgMonthlyExpense)}
                    </p>
                </div>
            </div>

            {/* Average Transaction Value */}
            <div className="glass-card p-4">
                <h4 className="text-sm font-semibold mb-3">Giá trị giao dịch trung bình</h4>
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col">
                        <span className="text-xs text-[var(--color-text-muted)]">Chi tiêu</span>
                        <span className="text-lg font-bold text-[var(--color-danger)]">
                            {formatCurrency(highlights.avgTransactionValue.expense)}
                        </span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs text-[var(--color-text-muted)]">Thu nhập</span>
                        <span className="text-lg font-bold text-[var(--color-success)]">
                            {formatCurrency(highlights.avgTransactionValue.income)}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
