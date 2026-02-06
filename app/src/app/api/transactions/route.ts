
import { NextResponse } from 'next/server';
import { sheetsDB } from '@/lib/google-sheets';
import { Transaction } from '@/types/transaction';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const transactions = await sheetsDB.getAll();
        return NextResponse.json(transactions);
    } catch (error) {
        console.error('Failed to fetch transactions:', error);
        return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const data = await request.json();
        // Validation could go here

        const newTransaction = await sheetsDB.add(data);
        return NextResponse.json(newTransaction);
    } catch (error) {
        console.error('Failed to add transaction:', error);
        return NextResponse.json({ error: 'Failed to add transaction' }, { status: 500 });
    }
}
