import { sheetsDB } from '@/lib/google-sheets';
import { YearSummaryClient } from './YearSummaryClient';

export const dynamic = 'force-dynamic';

export default async function YearSummaryPage() {
    // Fetch all transactions from Google Sheets
    // In a real app with huge data, we might want to cache this or use a more efficient query.
    // For personal finance (thousands of rows), fetching all is acceptable.
    const transactions = await sheetsDB.getAll();

    return (
        <div className="pb-32">
            <YearSummaryClient transactions={transactions} />
        </div>
    );
}
