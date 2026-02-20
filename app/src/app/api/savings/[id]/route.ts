import { NextResponse } from 'next/server';
import { savingSheetsDB } from '@/lib/google-sheets';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const data = await request.json();
        await savingSheetsDB.update(id, data);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to update saving:', error);
        return NextResponse.json({ error: 'Failed to update saving' }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await savingSheetsDB.delete(id);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to delete saving:', error);
        return NextResponse.json({ error: 'Failed to delete saving' }, { status: 500 });
    }
}
