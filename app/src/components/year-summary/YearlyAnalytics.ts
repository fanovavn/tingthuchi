import { Transaction } from '@/types/transaction';
import { getYear, getMonth, format, isSameDay, parseISO } from 'date-fns';

export interface YearlyStats {
    year: number;
    totalIncome: number;
    totalExpense: number;
    netIncome: number;
    savingsRate: number;
    monthlyData: {
        month: number;
        income: number;
        expense: number;
        net: number;
    }[];
    categoryExpense: Record<string, number>;
    categoryIncome: Record<string, number>;
    topExpenseCategories: { category: string; amount: number; percentage: number }[];
    topIncomeSources: { source: string; amount: number; percentage: number }[];
    highlights: {
        maxExpenseMonth: { month: number; amount: number } | null;
        bestSavingsMonth: { month: number; amount: number } | null;
        avgMonthlyIncome: number;
        avgMonthlyExpense: number;
        biggestExpenseTx: Transaction | null;
        biggestIncomeTx: Transaction | null;
        totalTransactions: number;
        avgTransactionValue: { income: number; expense: number };
        topSpendingDays: { date: Date; amount: number }[];
    };
    heatmapData: Record<string, number>; // date "yyyy-MM-dd" -> count/amount? Request said "calendar heatmap", usually frequency or amount. Let's do frequency for now or amount intensity. Request says "ô đậm là chi nhiều" -> so Amount.
}

export function processYearlyData(transactions: Transaction[], year: number): YearlyStats {
    // Filter transactions for the selected year
    const yearTransactions = transactions.filter(t => getYear(new Date(t.date)) === year);

    // Initialize accumulators
    let totalIncome = 0;
    let totalExpense = 0;
    const monthlyStats = Array(12).fill(0).map((_, i) => ({ month: i + 1, income: 0, expense: 0, net: 0 }));
    const categoryExpense: Record<string, number> = {};
    const categoryIncome: Record<string, number> = {};
    const dailyExpense: Record<string, number> = {};
    let biggestExpenseTx: Transaction | null = null;
    let biggestIncomeTx: Transaction | null = null;
    let incomeCount = 0;
    let expenseCount = 0;

    // Process each transaction
    yearTransactions.forEach(t => {
        const amount = t.amount;
        const date = new Date(t.date);
        const monthIndex = getMonth(date); // 0-11
        const dateStr = format(date, 'yyyy-MM-dd');

        if (t.type === 'income') {
            totalIncome += amount;
            monthlyStats[monthIndex].income += amount;

            // Category Income
            categoryIncome[t.category] = (categoryIncome[t.category] || 0) + amount;

            // Biggest Income
            if (!biggestIncomeTx || amount > biggestIncomeTx.amount) {
                biggestIncomeTx = t;
            }
            incomeCount++;

        } else {
            totalExpense += amount;
            monthlyStats[monthIndex].expense += amount;

            // Category Expense
            categoryExpense[t.category] = (categoryExpense[t.category] || 0) + amount;

            // Biggest Expense
            if (!biggestExpenseTx || amount > biggestExpenseTx.amount) {
                biggestExpenseTx = t;
            }
            expenseCount++;

            // Daily Expense for Heatmap & Top Days
            dailyExpense[dateStr] = (dailyExpense[dateStr] || 0) + amount;
        }
    });

    // Calculate Net for each month
    monthlyStats.forEach(m => {
        m.net = m.income - m.expense;
    });

    // Net Income & Savings Rate
    const netIncome = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? (netIncome / totalIncome) * 100 : 0;

    // Top Categories
    const topExpenseCategories = Object.entries(categoryExpense)
        .map(([category, amount]) => ({
            category,
            amount,
            percentage: totalExpense > 0 ? (amount / totalExpense) * 100 : 0
        }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 10);

    const topIncomeSources = Object.entries(categoryIncome)
        .map(([source, amount]) => ({
            source,
            amount,
            percentage: totalIncome > 0 ? (amount / totalIncome) * 100 : 0
        }))
        .sort((a, b) => b.amount - a.amount);

    // Highlights
    const maxExpenseMonthStats = [...monthlyStats].sort((a, b) => b.expense - a.expense)[0];
    const bestSavingsMonthStats = [...monthlyStats].sort((a, b) => b.net - a.net)[0];

    // Top Spending Days
    const topSpendingDays = Object.entries(dailyExpense)
        .map(([dateStr, amount]) => ({ date: parseISO(dateStr), amount }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5);

    return {
        year,
        totalIncome,
        totalExpense,
        netIncome,
        savingsRate,
        monthlyData: monthlyStats,
        categoryExpense,
        categoryIncome,
        topExpenseCategories,
        topIncomeSources,
        highlights: {
            maxExpenseMonth: maxExpenseMonthStats.expense > 0 ? { month: maxExpenseMonthStats.month, amount: maxExpenseMonthStats.expense } : null,
            bestSavingsMonth: bestSavingsMonthStats.net > 0 ? { month: bestSavingsMonthStats.month, amount: bestSavingsMonthStats.net } : null, // Logic check: net could be negative, but best savings usually positive.
            avgMonthlyIncome: totalIncome / 12,
            avgMonthlyExpense: totalExpense / 12,
            biggestExpenseTx,
            biggestIncomeTx,
            totalTransactions: yearTransactions.length,
            avgTransactionValue: {
                income: incomeCount > 0 ? totalIncome / incomeCount : 0,
                expense: expenseCount > 0 ? totalExpense / expenseCount : 0,
            },
            topSpendingDays,
        },
        heatmapData: dailyExpense,
    };
}
