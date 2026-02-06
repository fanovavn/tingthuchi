import { NextResponse } from 'next/server';

// GET - Read current Spreadsheet ID from environment variable
export async function GET() {
    try {
        const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID || null;
        return NextResponse.json({ spreadsheetId });
    } catch (error) {
        console.error('Failed to read config:', error);
        return NextResponse.json({ error: 'Failed to read config' }, { status: 500 });
    }
}

// POST - Not supported on serverless (returns info message)
export async function POST() {
    return NextResponse.json({
        error: 'Spreadsheet ID must be configured via Environment Variables on your hosting platform (Vercel/Render).',
        instruction: 'Add GOOGLE_SPREADSHEET_ID to your environment variables.'
    }, { status: 400 });
}
