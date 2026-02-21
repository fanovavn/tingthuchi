import { google } from 'googleapis';
import { Transaction } from '@/types/transaction';
import { SavingTransaction } from '@/types/saving';
import { generateId } from './utils';
import { format } from 'date-fns';

// Get Spreadsheet ID from environment variable
const getSpreadsheetId = (): string | null => {
    return process.env.GOOGLE_SPREADSHEET_ID || null;
};

const SHEET_NAME = 'Transaction'; // Sheet tab name

// Initialize Google Sheets API
const getAuth = () => {
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;

    if (!privateKey || !clientEmail) {
        throw new Error('Missing Google Sheets credentials in environment variables');
    }

    return new google.auth.GoogleAuth({
        credentials: {
            client_email: clientEmail,
            private_key: privateKey,
        },
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
};

const getSheets = () => {
    const auth = getAuth();
    return google.sheets({ version: 'v4', auth });
};

// Date formatting
const formatDateForSheet = (date: Date): string => {
    return format(date, 'dd/MM/yyyy');
};

const parseSheetDate = (dateStr: string | number): Date => {
    if (typeof dateStr === 'number') {
        // Excel serial date
        return new Date((dateStr - 25569) * 86400 * 1000);
    }
    if (typeof dateStr === 'string') {
        const parts = dateStr.split(/[, ]+/);
        const datePart = parts.find(p => p.includes('/'));
        if (datePart) {
            const [day, month, year] = datePart.split('/').map(Number);
            return new Date(year, month - 1, day);
        }
    }
    return new Date();
};

// Parse Vietnamese number format (uses . as thousand separator)
const parseAmount = (amountStr: string | number): number => {
    if (typeof amountStr === 'number') {
        return amountStr;
    }
    if (!amountStr) return 0;

    // Remove currency symbol, spaces, and "đ"
    let cleaned = amountStr.toString().replace(/[đ\s]/g, '').trim();

    // If contains dot as thousand separator (Vietnamese format like "205.000")
    // Check if it looks like Vietnamese format: dots followed by exactly 3 digits
    if (/^\d{1,3}(\.\d{3})+$/.test(cleaned)) {
        // Vietnamese format - remove dots (thousand separators)
        cleaned = cleaned.replace(/\./g, '');
    } else if (cleaned.includes(',')) {
        // Handle comma as thousand separator
        cleaned = cleaned.replace(/,/g, '');
    }

    return parseFloat(cleaned) || 0;
};

export class GoogleSheetsDB {
    async getAll(): Promise<Transaction[]> {
        const spreadsheetId = getSpreadsheetId();
        if (!spreadsheetId) {
            throw new Error('Chưa cấu hình Google Spreadsheet ID. Vui lòng vào Cài đặt để cấu hình.');
        }

        const sheets = getSheets();
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: `${SHEET_NAME}!A:F`,
        });

        const rows = response.data.values;
        if (!rows || rows.length <= 1) {
            return [];
        }

        // Skip header row
        const dataRows = rows.slice(1);
        const transactions: Transaction[] = [];

        for (const row of dataRows) {
            const [dateStr, amountStr, category, description, typeStr, id] = row;

            if (!dateStr && !amountStr) continue; // Skip empty rows

            transactions.push({
                id: id || generateId(),
                date: parseSheetDate(dateStr),
                amount: parseAmount(amountStr),
                category: category || 'Khác',
                description: description || '',
                type: typeStr === 'Thu nhập' ? 'income' : 'expense',
            });
        }

        // Sort by date descending (newest first)
        transactions.sort((a, b) => b.date.getTime() - a.date.getTime());

        return transactions;
    }

    async add(transaction: Omit<Transaction, 'id'>): Promise<Transaction> {
        const spreadsheetId = getSpreadsheetId();
        if (!spreadsheetId) {
            throw new Error('Chưa cấu hình Google Spreadsheet ID');
        }

        const sheets = getSheets();
        const newId = generateId();

        const newRow = [
            formatDateForSheet(new Date(transaction.date)),
            transaction.amount,
            transaction.category,
            transaction.description,
            transaction.type === 'income' ? 'Thu nhập' : 'Chi phí',
            newId,
        ];

        // Append to the sheet (after all existing data)
        await sheets.spreadsheets.values.append({
            spreadsheetId,
            range: `${SHEET_NAME}!A:F`,
            valueInputOption: 'USER_ENTERED',
            insertDataOption: 'INSERT_ROWS',
            requestBody: {
                values: [newRow],
            },
        });

        return {
            ...transaction,
            date: new Date(transaction.date),
            id: newId,
        };
    }

    async update(id: string, updates: Partial<Transaction>): Promise<void> {
        const spreadsheetId = getSpreadsheetId();
        if (!spreadsheetId) {
            throw new Error('Chưa cấu hình Google Spreadsheet ID');
        }

        const sheets = getSheets();

        // Get all data to find the row
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: `${SHEET_NAME}!A:F`,
        });

        const rows = response.data.values;
        if (!rows) {
            throw new Error('No data found in sheet');
        }

        // Find row by ID (column F)
        let rowIndex = -1;
        for (let i = 1; i < rows.length; i++) {
            if (rows[i][5] === id) {
                rowIndex = i + 1; // 1-indexed for Sheets API
                break;
            }
        }

        if (rowIndex === -1) {
            throw new Error(`Transaction with ID ${id} not found`);
        }

        // Get current row data
        const currentRow = rows[rowIndex - 1];

        // Update values
        const updatedRow = [
            updates.date ? formatDateForSheet(new Date(updates.date)) : currentRow[0],
            updates.amount !== undefined ? updates.amount : currentRow[1],
            updates.category || currentRow[2],
            updates.description !== undefined ? updates.description : currentRow[3],
            updates.type ? (updates.type === 'income' ? 'Thu nhập' : 'Chi phí') : currentRow[4],
            id,
        ];

        await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: `${SHEET_NAME}!A${rowIndex}:F${rowIndex}`,
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: [updatedRow],
            },
        });
    }

    async delete(id: string): Promise<void> {
        const spreadsheetId = getSpreadsheetId();
        if (!spreadsheetId) {
            throw new Error('Chưa cấu hình Google Spreadsheet ID');
        }

        const sheets = getSheets();

        // Get spreadsheet info to find sheet ID
        const spreadsheet = await sheets.spreadsheets.get({
            spreadsheetId,
        });

        const sheet = spreadsheet.data.sheets?.find(
            s => s.properties?.title === SHEET_NAME
        );

        if (!sheet?.properties?.sheetId) {
            throw new Error(`Sheet ${SHEET_NAME} not found`);
        }

        // Get all data to find the row
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: `${SHEET_NAME}!A:F`,
        });

        const rows = response.data.values;
        if (!rows) {
            throw new Error('No data found in sheet');
        }

        // Find row by ID (column F)
        let rowIndex = -1;
        for (let i = 1; i < rows.length; i++) {
            if (rows[i][5] === id) {
                rowIndex = i; // 0-indexed for delete request
                break;
            }
        }

        if (rowIndex === -1) {
            throw new Error(`Transaction with ID ${id} not found`);
        }

        // Delete the row
        await sheets.spreadsheets.batchUpdate({
            spreadsheetId,
            requestBody: {
                requests: [
                    {
                        deleteDimension: {
                            range: {
                                sheetId: sheet.properties.sheetId,
                                dimension: 'ROWS',
                                startIndex: rowIndex,
                                endIndex: rowIndex + 1,
                            },
                        },
                    },
                ],
            },
        });
    }
}

export const sheetsDB = new GoogleSheetsDB();

// ── Saving Sheet DB ──────────────────────────────────────────────────────
const SAVING_SHEET_NAME = 'Saving';

export class SavingSheetsDB {
    async getAll(): Promise<SavingTransaction[]> {
        const spreadsheetId = getSpreadsheetId();
        if (!spreadsheetId) {
            throw new Error('Chưa cấu hình Google Spreadsheet ID.');
        }

        const sheets = getSheets();
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: `${SAVING_SHEET_NAME}!A:E`,
        });

        const rows = response.data.values;
        if (!rows || rows.length <= 1) return [];

        const dataRows = rows.slice(1);
        const savings: SavingTransaction[] = [];

        for (const row of dataRows) {
            const [dateStr, amountStr, note, typeStr, id] = row;
            if (!dateStr && !amountStr) continue;

            savings.push({
                id: id || generateId(),
                date: parseSheetDate(dateStr),
                amount: parseAmount(amountStr),
                note: note || '',
                type: typeStr === 'Gửi vào' ? 'deposit' : 'withdraw',
            });
        }

        savings.sort((a, b) => b.date.getTime() - a.date.getTime());
        return savings;
    }

    async add(saving: Omit<SavingTransaction, 'id'>): Promise<SavingTransaction> {
        const spreadsheetId = getSpreadsheetId();
        if (!spreadsheetId) throw new Error('Chưa cấu hình Google Spreadsheet ID');

        const sheets = getSheets();
        const newId = generateId();

        const newRow = [
            `'${formatDateForSheet(new Date(saving.date))}`,
            saving.amount,
            saving.note,
            saving.type === 'deposit' ? 'Gửi vào' : 'Rút ra',
            newId,
        ];

        await sheets.spreadsheets.values.append({
            spreadsheetId,
            range: `${SAVING_SHEET_NAME}!A:E`,
            valueInputOption: 'USER_ENTERED',
            insertDataOption: 'INSERT_ROWS',
            requestBody: { values: [newRow] },
        });

        return { ...saving, date: new Date(saving.date), id: newId };
    }

    async update(id: string, updates: Partial<SavingTransaction>): Promise<void> {
        const spreadsheetId = getSpreadsheetId();
        if (!spreadsheetId) throw new Error('Chưa cấu hình Google Spreadsheet ID');

        const sheets = getSheets();
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: `${SAVING_SHEET_NAME}!A:E`,
        });

        const rows = response.data.values;
        if (!rows) throw new Error('No data found in sheet');

        let rowIndex = -1;
        for (let i = 1; i < rows.length; i++) {
            if (rows[i][4] === id) {
                rowIndex = i + 1;
                break;
            }
        }
        if (rowIndex === -1) throw new Error(`Saving with ID ${id} not found`);

        const currentRow = rows[rowIndex - 1];
        const updatedRow = [
            updates.date ? `'${formatDateForSheet(new Date(updates.date))}` : currentRow[0],
            updates.amount !== undefined ? updates.amount : currentRow[1],
            updates.note !== undefined ? updates.note : currentRow[2],
            updates.type ? (updates.type === 'deposit' ? 'Gửi vào' : 'Rút ra') : currentRow[3],
            id,
        ];

        await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: `${SAVING_SHEET_NAME}!A${rowIndex}:E${rowIndex}`,
            valueInputOption: 'USER_ENTERED',
            requestBody: { values: [updatedRow] },
        });
    }

    async delete(id: string): Promise<void> {
        const spreadsheetId = getSpreadsheetId();
        if (!spreadsheetId) throw new Error('Chưa cấu hình Google Spreadsheet ID');

        const sheets = getSheets();
        const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
        const sheet = spreadsheet.data.sheets?.find(
            s => s.properties?.title === SAVING_SHEET_NAME
        );
        if (!sheet?.properties?.sheetId) throw new Error(`Sheet ${SAVING_SHEET_NAME} not found`);

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: `${SAVING_SHEET_NAME}!A:E`,
        });

        const rows = response.data.values;
        if (!rows) throw new Error('No data found in sheet');

        let rowIndex = -1;
        for (let i = 1; i < rows.length; i++) {
            if (rows[i][4] === id) {
                rowIndex = i;
                break;
            }
        }
        if (rowIndex === -1) throw new Error(`Saving with ID ${id} not found`);

        await sheets.spreadsheets.batchUpdate({
            spreadsheetId,
            requestBody: {
                requests: [{
                    deleteDimension: {
                        range: {
                            sheetId: sheet.properties.sheetId,
                            dimension: 'ROWS',
                            startIndex: rowIndex,
                            endIndex: rowIndex + 1,
                        },
                    },
                }],
            },
        });
    }
}

export const savingSheetsDB = new SavingSheetsDB();

// ── Category Sheet DB ────────────────────────────────────────────────────
// Sheet structure: A = ID | B = Tên danh mục | C = Nhóm danh mục | D = Color
const CATEGORY_SHEET_NAME = 'Category';

export interface SheetCategory {
    id: string;
    name: string;
    type: 'income' | 'expense';
    color: string;
}

export class CategorySheetsDB {
    async getAll(): Promise<SheetCategory[]> {
        const spreadsheetId = getSpreadsheetId();
        if (!spreadsheetId) {
            throw new Error('Chưa cấu hình Google Spreadsheet ID.');
        }

        const sheets = getSheets();
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: `${CATEGORY_SHEET_NAME}!A:D`,
        });

        const rows = response.data.values;
        if (!rows || rows.length <= 1) return [];

        const dataRows = rows.slice(1); // Skip header row
        const categories: SheetCategory[] = [];

        for (const row of dataRows) {
            const [id, name, typeStr, color] = row;
            if (!name) continue;

            categories.push({
                id: id || generateId(),
                name: name,
                type: typeStr === 'Thu nhập' ? 'income' : 'expense',
                color: color || '#6366f1',
            });
        }

        return categories;
    }

    async add(category: Omit<SheetCategory, 'id'>): Promise<SheetCategory> {
        const spreadsheetId = getSpreadsheetId();
        if (!spreadsheetId) throw new Error('Chưa cấu hình Google Spreadsheet ID');

        const sheets = getSheets();

        // Get current data to determine next ID
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: `${CATEGORY_SHEET_NAME}!A:A`,
        });
        const rows = response.data.values || [];
        // Find max numeric ID
        let maxId = 0;
        for (let i = 1; i < rows.length; i++) {
            const num = parseInt(rows[i][0], 10);
            if (!isNaN(num) && num > maxId) maxId = num;
        }
        const newId = String(maxId + 1);

        const newRow = [
            newId,
            category.name,
            category.type === 'income' ? 'Thu nhập' : 'Chi tiêu',
            category.color || '#6366f1',
        ];

        await sheets.spreadsheets.values.append({
            spreadsheetId,
            range: `${CATEGORY_SHEET_NAME}!A:D`,
            valueInputOption: 'USER_ENTERED',
            insertDataOption: 'INSERT_ROWS',
            requestBody: { values: [newRow] },
        });

        return { ...category, id: newId };
    }

    async update(id: string, updates: Partial<SheetCategory>): Promise<void> {
        const spreadsheetId = getSpreadsheetId();
        if (!spreadsheetId) throw new Error('Chưa cấu hình Google Spreadsheet ID');

        const sheets = getSheets();
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: `${CATEGORY_SHEET_NAME}!A:D`,
        });

        const rows = response.data.values;
        if (!rows) throw new Error('No data found in sheet');

        // Find row by ID (column A)
        let rowIndex = -1;
        for (let i = 1; i < rows.length; i++) {
            if (rows[i][0] === id) {
                rowIndex = i + 1; // 1-indexed for Sheets API
                break;
            }
        }
        if (rowIndex === -1) throw new Error(`Category with ID ${id} not found`);

        const currentRow = rows[rowIndex - 1];
        const updatedRow = [
            id,
            updates.name || currentRow[1],
            updates.type ? (updates.type === 'income' ? 'Thu nhập' : 'Chi tiêu') : currentRow[2],
            updates.color || currentRow[3] || '#6366f1',
        ];

        await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: `${CATEGORY_SHEET_NAME}!A${rowIndex}:D${rowIndex}`,
            valueInputOption: 'USER_ENTERED',
            requestBody: { values: [updatedRow] },
        });
    }

    async delete(id: string): Promise<void> {
        const spreadsheetId = getSpreadsheetId();
        if (!spreadsheetId) throw new Error('Chưa cấu hình Google Spreadsheet ID');

        const sheets = getSheets();
        const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
        const sheet = spreadsheet.data.sheets?.find(
            s => s.properties?.title === CATEGORY_SHEET_NAME
        );
        if (!sheet?.properties?.sheetId) throw new Error(`Sheet ${CATEGORY_SHEET_NAME} not found`);

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: `${CATEGORY_SHEET_NAME}!A:D`,
        });

        const rows = response.data.values;
        if (!rows) throw new Error('No data found in sheet');

        // Find row by ID (column A)
        let rowIndex = -1;
        for (let i = 1; i < rows.length; i++) {
            if (rows[i][0] === id) {
                rowIndex = i;
                break;
            }
        }
        if (rowIndex === -1) throw new Error(`Category with ID ${id} not found`);

        await sheets.spreadsheets.batchUpdate({
            spreadsheetId,
            requestBody: {
                requests: [{
                    deleteDimension: {
                        range: {
                            sheetId: sheet.properties.sheetId,
                            dimension: 'ROWS',
                            startIndex: rowIndex,
                            endIndex: rowIndex + 1,
                        },
                    },
                }],
            },
        });
    }
}

export const categorySheetsDB = new CategorySheetsDB();
