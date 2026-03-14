import { NextResponse } from 'next/server';
import { investmentSheetsDB } from '@/lib/google-sheets';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await request.json();
        await investmentSheetsDB.update(id, body);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to update investment:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to update' },
            { status: 500 }
        );
    }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await investmentSheetsDB.delete(id);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to delete investment:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to delete' },
            { status: 500 }
        );
    }
}
