import { NextResponse } from 'next/server';
import { savingSheetsDB } from '@/lib/google-sheets';
import { sendTelegramMessage, formatSavingMessage } from '@/lib/telegram';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const savings = await savingSheetsDB.getAll();
        return NextResponse.json(savings);
    } catch (error) {
        console.error('Failed to fetch savings:', error);
        const message = error instanceof Error ? error.message : 'Failed to fetch savings';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const data = await request.json();
        console.log('[Savings API] POST data:', JSON.stringify(data));
        const newSaving = await savingSheetsDB.add(data);
        console.log('[Savings API] POST success:', JSON.stringify(newSaving));

        // Calculate balance and send Telegram notification
        try {
            const allSavings = await savingSheetsDB.getAll();
            const totalDeposit = allSavings
                .filter(s => s.type === 'deposit')
                .reduce((sum, s) => sum + s.amount, 0);
            const totalWithdraw = allSavings
                .filter(s => s.type === 'withdraw')
                .reduce((sum, s) => sum + s.amount, 0);
            const balance = totalDeposit - totalWithdraw;

            const telegramMsg = formatSavingMessage(
                data.amount,
                data.type,
                data.note || '',
                balance
            );
            await sendTelegramMessage(telegramMsg);
        } catch (telegramErr) {
            // Don't fail the request if Telegram fails
            console.error('[Savings API] Telegram notification failed:', telegramErr);
        }

        return NextResponse.json(newSaving);
    } catch (error) {
        console.error('[Savings API] POST failed:', error);
        const message = error instanceof Error ? error.message : 'Failed to add saving';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
