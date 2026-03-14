import { NextResponse } from 'next/server';
import { loanManagementSheetsDB } from '@/lib/google-sheets';

export async function POST(request: Request) {
    try {
        const { id, clearAmount } = await request.json();
        const result = await loanManagementSheetsDB.toggleNeedClear(id, clearAmount);
        return NextResponse.json({ success: true, ...result });
    } catch (error) {
        console.error('Failed to toggle need-clear:', error);
        return NextResponse.json({ error: 'Failed to toggle need-clear' }, { status: 500 });
    }
}
