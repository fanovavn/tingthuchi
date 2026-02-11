import { sheetsDB } from '@/lib/google-sheets';
import { YearSummaryClient } from './YearSummaryClient';

export const dynamic = 'force-dynamic';

export default async function YearSummaryPage() {
    // Fetch all transactions from Google Sheets
    // In a real app with huge data, we might want to cache this or use a more efficient query.
    // For personal finance (thousands of rows), fetching all is acceptable.
    const transactions = await sheetsDB.getAll();

    // Serialize dates to pass to client component
    const serializedTransactions = transactions.map(t => ({
        ...t,
        date: t.date.toISOString(),
        // amount: t.amount // number is fine
    }));

    return (
        <div className="pb-32">
            <YearSummaryClient transactions={serializedTransactions as any} />
        </div>
    );
}
