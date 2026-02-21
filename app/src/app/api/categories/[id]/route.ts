import { NextResponse } from 'next/server';
import { categorySheetsDB } from '@/lib/google-sheets';

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const data = await request.json();
        await categorySheetsDB.update(id, data);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to update category:', error);
        const message = error instanceof Error ? error.message : 'Failed to update category';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function DELETE(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await categorySheetsDB.delete(id);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to delete category:', error);
        const message = error instanceof Error ? error.message : 'Failed to delete category';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
