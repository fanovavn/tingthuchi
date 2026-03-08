import { NextRequest, NextResponse } from 'next/server';
import { planMoneySheetsDB } from '@/lib/google-sheets';

// POST /api/plan-money/check - Toggle check for a single item
export async function POST(request: NextRequest) {
    try {
        const { id } = await request.json();
        if (!id) {
            return NextResponse.json({ error: 'Missing id' }, { status: 400 });
        }
        const newChecked = await planMoneySheetsDB.toggleCheck(id);
        return NextResponse.json({ checked: newChecked });
    } catch (error) {
        console.error('Error toggling check:', error);
        return NextResponse.json({ error: 'Failed to toggle check' }, { status: 500 });
    }
}

// DELETE /api/plan-money/check - Clear all checks
export async function DELETE() {
    try {
        await planMoneySheetsDB.clearAllChecks();
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error clearing checks:', error);
        return NextResponse.json({ error: 'Failed to clear checks' }, { status: 500 });
    }
}
