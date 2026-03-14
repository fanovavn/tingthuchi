import { NextResponse } from 'next/server';
import { loanManagementSheetsDB } from '@/lib/google-sheets';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const items = await loanManagementSheetsDB.getAll();
        return NextResponse.json(items);
    } catch (error) {
        console.error('Failed to fetch loans:', error);
        const message = error instanceof Error ? error.message : 'Failed to fetch loans';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const data = await request.json();
        console.log('[Loans API] POST data:', JSON.stringify(data));
        const newItem = await loanManagementSheetsDB.add(data);
        console.log('[Loans API] POST success:', JSON.stringify(newItem));
        return NextResponse.json(newItem);
    } catch (error) {
        console.error('[Loans API] POST failed:', error);
        const message = error instanceof Error ? error.message : 'Failed to add loan';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
