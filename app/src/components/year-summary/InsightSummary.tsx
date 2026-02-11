import { YearlyStats } from "./YearlyAnalytics";
import { formatCurrency } from "@/lib/utils";
import { Sparkles } from "lucide-react";

interface InsightSummaryProps {
    stats: YearlyStats;
}

export function InsightSummary({ stats }: InsightSummaryProps) {
    const { totalIncome, savingsRate, topExpenseCategories, highlights } = stats;

    const insights = [];

    // Insight 1: Spending Category
    if (topExpenseCategories.length > 0) {
        insights.push(`Bạn đã chi tiêu nhiều nhất cho "${topExpenseCategories[0].category}" (${formatCurrency(topExpenseCategories[0].amount)}).`);
    }

    // Insight 2: Savings
    if (savingsRate > 20) {
        insights.push(`Tuyệt vời! Bạn đã đạt chỉ số dư dả ${savingsRate.toFixed(1)}% thu nhập năm nay.`);
    } else if (savingsRate > 0) {
        insights.push(`Bạn đang duy trì chỉ số dư dả dương (${savingsRate.toFixed(1)}%). Hãy cố gắng tối ưu thêm nhé!`);
    } else {
        insights.push("Năm nay chi tiêu của bạn đang vượt quá thu nhập. Cần điều chỉnh lại ngân sách.");
    }

    // Insight 3: Peak Spending
    if (highlights.maxExpenseMonth) {
        insights.push(`Tháng ${highlights.maxExpenseMonth.month} là tháng tiêu pha "mạnh tay" nhất.`);
    }

    return (
        <div className="glass-card p-6 border-l-4 border-l-indigo-500">
            <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">Tổng Quan & Insight</h3>
            </div>
            <ul className="space-y-2">
                {insights.map((insight, index) => (
                    <li key={index} className="flex items-start gap-2 text-[var(--color-text-secondary)]">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                        <span>{insight}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}
