import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const CONFIG_PATH = path.join(process.cwd(), 'data', 'sheets-config.json');

// Ensure data directory exists
const ensureDataDir = () => {
    const dataDir = path.dirname(CONFIG_PATH);
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }
};

export async function GET() {
    try {
        ensureDataDir();

        if (!fs.existsSync(CONFIG_PATH)) {
            return NextResponse.json({ spreadsheetId: '' });
        }

        const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
        return NextResponse.json(config);
    } catch (error) {
        console.error('Failed to read config:', error);
        return NextResponse.json({ spreadsheetId: '' });
    }
}

export async function POST(request: Request) {
    try {
        ensureDataDir();

        const { spreadsheetId } = await request.json();

        const config = { spreadsheetId };
        fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to save config:', error);
        return NextResponse.json({ error: 'Failed to save config' }, { status: 500 });
    }
}
