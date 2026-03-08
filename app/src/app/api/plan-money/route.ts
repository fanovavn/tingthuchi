import { NextResponse } from 'next/server';
import { planMoneySheetsDB } from '@/lib/google-sheets';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const items = await planMoneySheetsDB.getAll();
        return NextResponse.json(items);
    } catch (error) {
        console.error('Failed to fetch plan money items:', error);
        const message = error instanceof Error ? error.message : 'Failed to fetch plan money items';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const data = await request.json();
        console.log('[PlanMoney API] POST data:', JSON.stringify(data));
        const newItem = await planMoneySheetsDB.add(data);
        console.log('[PlanMoney API] POST success:', JSON.stringify(newItem));
        return NextResponse.json(newItem);
    } catch (error) {
        console.error('[PlanMoney API] POST failed:', error);
        const message = error instanceof Error ? error.message : 'Failed to add plan money item';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
