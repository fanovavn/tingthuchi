import { NextResponse } from 'next/server';
import { planMoneySheetsDB } from '@/lib/google-sheets';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const data = await request.json();
        await planMoneySheetsDB.update(id, data);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to update plan money item:', error);
        return NextResponse.json({ error: 'Failed to update plan money item' }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await planMoneySheetsDB.delete(id);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to delete plan money item:', error);
        return NextResponse.json({ error: 'Failed to delete plan money item' }, { status: 500 });
    }
}
