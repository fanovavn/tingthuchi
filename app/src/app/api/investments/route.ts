import { NextResponse } from 'next/server';
import { investmentSheetsDB } from '@/lib/google-sheets';

export async function GET() {
    try {
        const items = await investmentSheetsDB.getAll();
        return NextResponse.json(items);
    } catch (error) {
        console.error('Failed to fetch investments:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to fetch investments' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const newItem = await investmentSheetsDB.add(body);
        return NextResponse.json(newItem, { status: 201 });
    } catch (error) {
        console.error('Failed to add investment:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to add investment' },
            { status: 500 }
        );
    }
}
