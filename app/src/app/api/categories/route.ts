import { NextResponse } from 'next/server';
import { categorySheetsDB } from '@/lib/google-sheets';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const categories = await categorySheetsDB.getAll();
        return NextResponse.json(categories);
    } catch (error) {
        console.error('Failed to fetch categories:', error);
        const message = error instanceof Error ? error.message : 'Failed to fetch categories';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const newCategory = await categorySheetsDB.add(data);
        return NextResponse.json(newCategory);
    } catch (error) {
        console.error('Failed to add category:', error);
        const message = error instanceof Error ? error.message : 'Failed to add category';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
