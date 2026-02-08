import { NextRequest, NextResponse } from 'next/server';
import { sendTelegramMessage, formatTransactionMessage } from '@/lib/telegram';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { amount, description, date, category, type } = body;

        if (!amount || !category || !type) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const message = formatTransactionMessage(
            amount,
            description || '',
            new Date(date),
            category,
            type
        );

        const result = await sendTelegramMessage(message);

        if (result.success) {
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json(
                { success: false, error: result.error },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error('Telegram notification error:', error);
        return NextResponse.json(
            { error: 'Failed to send notification' },
            { status: 500 }
        );
    }
}
