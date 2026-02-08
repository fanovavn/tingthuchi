// Telegram Bot API utility for sending notifications

const TELEGRAM_API_URL = 'https://api.telegram.org/bot';

interface SendMessageResult {
    success: boolean;
    error?: string;
}

export async function sendTelegramMessage(message: string): Promise<SendMessageResult> {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
        console.warn('Telegram not configured: missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID');
        return { success: false, error: 'Telegram not configured' };
    }

    try {
        const url = `${TELEGRAM_API_URL}${botToken}/sendMessage`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: chatId,
                text: message,
                parse_mode: 'HTML',
            }),
        });

        if (!response.ok) {
            const error = await response.text();
            console.error('Telegram API error:', error);
            return { success: false, error };
        }

        return { success: true };
    } catch (error) {
        console.error('Failed to send Telegram message:', error);
        return { success: false, error: String(error) };
    }
}

// Format transaction for Telegram message
export function formatTransactionMessage(
    amount: number,
    description: string,
    date: Date,
    category: string,
    type: 'income' | 'expense'
): string {
    const formattedAmount = amount.toLocaleString('vi-VN');
    const sign = type === 'income' ? '+' : '-';
    const dateStr = date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
    });

    return `${sign}${formattedAmount}₫ - ${description || 'Không có mô tả'} - ${dateStr}`;
}
