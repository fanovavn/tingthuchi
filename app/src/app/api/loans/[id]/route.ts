import { NextResponse } from 'next/server';
import { loanManagementSheetsDB } from '@/lib/google-sheets';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const data = await request.json();
        await loanManagementSheetsDB.update(id, data);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to update loan:', error);
        return NextResponse.json({ error: 'Failed to update loan' }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await loanManagementSheetsDB.delete(id);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to delete loan:', error);
        return NextResponse.json({ error: 'Failed to delete loan' }, { status: 500 });
    }
}
