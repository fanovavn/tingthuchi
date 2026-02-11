import { TrendingDown, TrendingUp, Wallet, PiggyBank, ArrowUp, ArrowDown } from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";

interface KPIProps {
    title: string;
    value: number;
    prevValue?: number;
    icon: React.ElementType;
    format?: 'currency' | 'percent';
    type: 'income' | 'expense' | 'balance' | 'savings';
}

function KPICard({ title, value, prevValue, icon: Icon, format = 'currency', type }: KPIProps) {
    const formattedValue = format === 'currency' ? formatCurrency(value) : `${value.toFixed(1)}%`;

    let trend = 0;
    let isPositive = true;

    if (prevValue !== undefined && prevValue !== 0) {
        trend = ((value - prevValue) / Math.abs(prevValue)) * 100;
        // Logic for "Positive" color:
        // Income/Savings/Balance: Increase is Good (Green)
        // Expense: Increase is Bad (Red)
        if (type === 'expense') {
            isPositive = trend < 0;
        } else {
            isPositive = trend > 0;
        }
    }

    // Determine colors based on type
    let colorClass = "";
    let bgClass = "";

    switch (type) {
        case 'income':
            colorClass = "text-[var(--color-success)]";
            bgClass = "bg-[var(--color-success-bg)]";
            break;
        case 'expense':
            colorClass = "text-[var(--color-danger)]";
            bgClass = "bg-[var(--color-danger-bg)]";
            break;
        case 'balance':
            colorClass = "text-[var(--color-primary)]";
            bgClass = "bg-[rgba(99,102,241,0.1)]";
            break;
        case 'savings':
            colorClass = "text-[var(--color-warning)]";
            bgClass = "bg-[rgba(245,158,11,0.1)]";
            break;
    }

    return (
        <div className={`stat-card hover-lift`}>
            <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-[var(--color-text-secondary)]">
                    {title}
                </span>
                <div className={`p-2 rounded-lg ${bgClass}`}>
                    <Icon className={`w-5 h-5 ${colorClass}`} />
                </div>
            </div>
            <div className={`text-2xl font-bold mb-1 ${colorClass}`}>
                {formattedValue}
            </div>
            {prevValue !== undefined && (
                <div className={cn("text-xs flex items-center mt-2", isPositive ? "text-[var(--color-success)]" : "text-[var(--color-danger)]")}>
                    {trend > 0 ? <ArrowUp className="h-3 w-3 mr-1" /> : <ArrowDown className="h-3 w-3 mr-1" />}
                    {Math.abs(trend).toFixed(1)}% so với năm trước
                </div>
            )}
        </div>
    );
}

interface YearlyKPIsProps {
    currentYearData: {
        totalIncome: number;
        totalExpense: number;
        netIncome: number;
        savingsRate: number;
    };
    prevYearData?: {
        totalIncome: number;
        totalExpense: number;
        netIncome: number;
        savingsRate: number;
    };
}

export function YearlyKPIs({ currentYearData, prevYearData }: YearlyKPIsProps) {
    return (
        <div className="grid grid-cols-2 min-[1280px]:grid-cols-4 gap-4 md:gap-6">
            <KPICard
                title="Tổng Thu Năm"
                value={currentYearData.totalIncome}
                prevValue={prevYearData?.totalIncome}
                icon={TrendingUp}
                type="income"
            />
            <KPICard
                title="Tổng Chi Năm"
                value={currentYearData.totalExpense}
                prevValue={prevYearData?.totalExpense}
                icon={TrendingDown}
                type="expense"
            />
            <KPICard
                title="Chênh Lệch (Thu - Chi)"
                value={currentYearData.netIncome}
                prevValue={prevYearData?.netIncome}
                icon={Wallet}
                type="balance"
            />
            <KPICard
                title="Chỉ Số Dư Dả"
                value={currentYearData.savingsRate}
                prevValue={prevYearData?.savingsRate}
                icon={PiggyBank}
                format="percent"
                type="savings"
            />
        </div>
    );
}
