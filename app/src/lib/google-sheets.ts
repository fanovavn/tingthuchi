import { google } from 'googleapis';
import { Transaction } from '@/types/transaction';
import { SavingTransaction } from '@/types/saving';
import { PlanMoneyItem, Assignee } from '@/types/plan-money';
import { InvestmentItem, InvestmentType, InvestmentStatus } from '@/types/investment';
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

    // Keep ONLY digits, dots, commas, and minus sign — strips ALL currency symbols
    // (đ U+0111, ₫ U+20AB, VND, spaces, non-breaking spaces, etc.)
    let cleaned = amountStr.toString().replace(/[^\d.,-]/g, '').trim();

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

// ── PlanMoney Sheet DB ───────────────────────────────────────────────────
// Sheet structure: A = DayNumber | B = Note | C = Amount | D = Type | E = Assignee | F = Id | G = Description | H = Checked

const PLAN_MONEY_SHEET_NAME = 'PlanMoney';

export class PlanMoneySheetsDB {
    async getAll(): Promise<PlanMoneyItem[]> {
        const spreadsheetId = getSpreadsheetId();
        if (!spreadsheetId) {
            throw new Error('Chưa cấu hình Google Spreadsheet ID.');
        }

        const sheets = getSheets();
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: `${PLAN_MONEY_SHEET_NAME}!A:H`,
        });

        const rows = response.data.values;
        if (!rows || rows.length <= 1) return [];

        const dataRows = rows.slice(1); // Skip header row
        const items: PlanMoneyItem[] = [];

        for (const row of dataRows) {
            const [dayNumberStr, note, amountStr, typeStr, assignee, id, description, checked] = row;
            if (!dayNumberStr && !note) continue;

            items.push({
                id: id || generateId(),
                dayNumber: parseInt(dayNumberStr, 10) || 1,
                note: note || '',
                amount: parseAmount(amountStr),
                type: typeStr === 'Thu nhập' ? 'income' : 'expense',
                assignee: (assignee as Assignee) || 'Tý',
                description: description || '',
                checked: checked === 'TRUE' || checked === '1',
            });
        }

        // Sort by day number
        items.sort((a, b) => a.dayNumber - b.dayNumber);
        return items;
    }

    async add(item: Omit<PlanMoneyItem, 'id'>): Promise<PlanMoneyItem> {
        const spreadsheetId = getSpreadsheetId();
        if (!spreadsheetId) throw new Error('Chưa cấu hình Google Spreadsheet ID');

        const sheets = getSheets();
        const newId = generateId();

        const newRow = [
            item.dayNumber,
            item.note,
            item.amount,
            item.type === 'income' ? 'Thu nhập' : 'Chi phí',
            item.assignee,
            newId,
            item.description || '',
            '',
        ];

        await sheets.spreadsheets.values.append({
            spreadsheetId,
            range: `${PLAN_MONEY_SHEET_NAME}!A:H`,
            valueInputOption: 'USER_ENTERED',
            insertDataOption: 'INSERT_ROWS',
            requestBody: { values: [newRow] },
        });

        return { ...item, id: newId, checked: false };
    }

    async update(id: string, updates: Partial<PlanMoneyItem>): Promise<void> {
        const spreadsheetId = getSpreadsheetId();
        if (!spreadsheetId) throw new Error('Chưa cấu hình Google Spreadsheet ID');

        const sheets = getSheets();
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: `${PLAN_MONEY_SHEET_NAME}!A:H`,
        });

        const rows = response.data.values;
        if (!rows) throw new Error('No data found in sheet');

        // Find row by ID (column F)
        let rowIndex = -1;
        for (let i = 1; i < rows.length; i++) {
            if (rows[i][5] === id) {
                rowIndex = i + 1; // 1-indexed for Sheets API
                break;
            }
        }
        if (rowIndex === -1) throw new Error(`PlanMoney item with ID ${id} not found`);

        const currentRow = rows[rowIndex - 1];
        const updatedRow = [
            updates.dayNumber !== undefined ? updates.dayNumber : currentRow[0],
            updates.note !== undefined ? updates.note : currentRow[1],
            updates.amount !== undefined ? updates.amount : currentRow[2],
            updates.type ? (updates.type === 'income' ? 'Thu nhập' : 'Chi phí') : currentRow[3],
            updates.assignee || currentRow[4],
            id,
            updates.description !== undefined ? updates.description : (currentRow[6] || ''),
            updates.checked !== undefined ? (updates.checked ? 'TRUE' : '') : (currentRow[7] || ''),
        ];

        await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: `${PLAN_MONEY_SHEET_NAME}!A${rowIndex}:H${rowIndex}`,
            valueInputOption: 'USER_ENTERED',
            requestBody: { values: [updatedRow] },
        });
    }

    async toggleCheck(id: string): Promise<boolean> {
        const spreadsheetId = getSpreadsheetId();
        if (!spreadsheetId) throw new Error('Chưa cấu hình Google Spreadsheet ID');

        const sheets = getSheets();
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: `${PLAN_MONEY_SHEET_NAME}!F:H`,
        });

        const rows = response.data.values;
        if (!rows) throw new Error('No data found');

        let rowIndex = -1;
        for (let i = 1; i < rows.length; i++) {
            if (rows[i][0] === id) {
                rowIndex = i + 1;
                break;
            }
        }
        if (rowIndex === -1) throw new Error(`Item ${id} not found`);

        const currentChecked = rows[rowIndex - 1][2] === 'TRUE' || rows[rowIndex - 1][2] === '1';
        const newChecked = !currentChecked;

        await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: `${PLAN_MONEY_SHEET_NAME}!H${rowIndex}`,
            valueInputOption: 'USER_ENTERED',
            requestBody: { values: [[newChecked ? 'TRUE' : '']] },
        });

        return newChecked;
    }

    async clearAllChecks(): Promise<void> {
        const spreadsheetId = getSpreadsheetId();
        if (!spreadsheetId) throw new Error('Chưa cấu hình Google Spreadsheet ID');

        const sheets = getSheets();
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: `${PLAN_MONEY_SHEET_NAME}!H:H`,
        });

        const rows = response.data.values;
        if (!rows || rows.length <= 1) return;

        // Clear all H column values (skip header)
        const clearValues = rows.slice(1).map(() => ['']);

        await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: `${PLAN_MONEY_SHEET_NAME}!H2:H${rows.length}`,
            valueInputOption: 'USER_ENTERED',
            requestBody: { values: clearValues },
        });
    }


    async delete(id: string): Promise<void> {
        const spreadsheetId = getSpreadsheetId();
        if (!spreadsheetId) throw new Error('Chưa cấu hình Google Spreadsheet ID');

        const sheets = getSheets();
        const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
        const sheet = spreadsheet.data.sheets?.find(
            s => s.properties?.title === PLAN_MONEY_SHEET_NAME
        );
        if (!sheet?.properties?.sheetId) throw new Error(`Sheet ${PLAN_MONEY_SHEET_NAME} not found`);

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: `${PLAN_MONEY_SHEET_NAME}!A:F`,
        });

        const rows = response.data.values;
        if (!rows) throw new Error('No data found in sheet');

        // Find row by ID (column F)
        let rowIndex = -1;
        for (let i = 1; i < rows.length; i++) {
            if (rows[i][5] === id) {
                rowIndex = i;
                break;
            }
        }
        if (rowIndex === -1) throw new Error(`PlanMoney item with ID ${id} not found`);

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

export const planMoneySheetsDB = new PlanMoneySheetsDB();

// ── LoanManagement Sheet DB ─────────────────────────────────────────────
// Sheet structure: A = Id | B = Title | C = Amount | D = Priority | E = TypeLoan | F = Lãi hàng tháng | G = Tổng trả tháng | H = Description | I = NeedClear
import { LoanItem, LoanPriority, LoanType } from '@/types/loan';

const LOAN_SHEET_NAME = 'LoanManagement';

export class LoanManagementSheetsDB {
    async getAll(): Promise<LoanItem[]> {
        const spreadsheetId = getSpreadsheetId();
        if (!spreadsheetId) {
            throw new Error('Chưa cấu hình Google Spreadsheet ID.');
        }

        const sheets = getSheets();
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: `${LOAN_SHEET_NAME}!A:J`,
        });

        const rows = response.data.values;
        if (!rows || rows.length <= 1) return [];

        const dataRows = rows.slice(1);
        const items: LoanItem[] = [];

        for (const row of dataRows) {
            const [id, title, amountStr, priority, typeLoan, monthlyInterestStr, monthlyPaymentStr, description, needClear, clearAmountStr] = row;
            if (!id && !title) continue;

            const amount = parseAmount(amountStr);
            items.push({
                id: id || generateId(),
                title: title || '',
                amount,
                priority: (priority as LoanPriority) || 'ASAP',
                typeLoan: (typeLoan as LoanType) || 'Tín dụng',
                monthlyInterest: parseAmount(monthlyInterestStr),
                monthlyPayment: parseAmount(monthlyPaymentStr),
                description: description || '',
                needClear: needClear === 'TRUE' || needClear === '1',
                clearAmount: parseAmount(clearAmountStr) || 0,
            });
        }

        // Sort by amount descending (largest loan first)
        items.sort((a, b) => b.amount - a.amount);
        return items;
    }

    async add(item: Omit<LoanItem, 'id'>): Promise<LoanItem> {
        const spreadsheetId = getSpreadsheetId();
        if (!spreadsheetId) throw new Error('Chưa cấu hình Google Spreadsheet ID');

        const sheets = getSheets();
        const newId = generateId();

        const newRow = [
            newId,
            item.title,
            item.amount,
            item.priority,
            item.typeLoan,
            item.monthlyInterest || 0,
            item.monthlyPayment || 0,
            item.description || '',
            item.needClear ? 'TRUE' : 'FALSE',
            item.clearAmount || 0,
        ];

        await sheets.spreadsheets.values.append({
            spreadsheetId,
            range: `${LOAN_SHEET_NAME}!A:J`,
            valueInputOption: 'USER_ENTERED',
            insertDataOption: 'INSERT_ROWS',
            requestBody: { values: [newRow] },
        });

        return { ...item, id: newId };
    }

    async update(id: string, updates: Partial<LoanItem>): Promise<void> {
        const spreadsheetId = getSpreadsheetId();
        if (!spreadsheetId) throw new Error('Chưa cấu hình Google Spreadsheet ID');

        const sheets = getSheets();
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: `${LOAN_SHEET_NAME}!A:J`,
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
        if (rowIndex === -1) throw new Error(`Loan with ID ${id} not found`);

        const currentRow = rows[rowIndex - 1];
        const updatedRow = [
            id,
            updates.title !== undefined ? updates.title : currentRow[1],
            updates.amount !== undefined ? updates.amount : currentRow[2],
            updates.priority || currentRow[3],
            updates.typeLoan || currentRow[4],
            updates.monthlyInterest !== undefined ? updates.monthlyInterest : currentRow[5],
            updates.monthlyPayment !== undefined ? updates.monthlyPayment : currentRow[6],
            updates.description !== undefined ? updates.description : (currentRow[7] || ''),
            updates.needClear !== undefined ? (updates.needClear ? 'TRUE' : 'FALSE') : (currentRow[8] || 'FALSE'),
            updates.clearAmount !== undefined ? updates.clearAmount : (currentRow[9] || 0),
        ];

        await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: `${LOAN_SHEET_NAME}!A${rowIndex}:J${rowIndex}`,
            valueInputOption: 'USER_ENTERED',
            requestBody: { values: [updatedRow] },
        });
    }

    async toggleNeedClear(id: string, clearAmount?: number): Promise<{ needClear: boolean; clearAmount: number }> {
        const spreadsheetId = getSpreadsheetId();
        if (!spreadsheetId) throw new Error('Chưa cấu hình Google Spreadsheet ID');

        const sheets = getSheets();
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: `${LOAN_SHEET_NAME}!A:J`,
        });

        const rows = response.data.values;
        if (!rows) throw new Error('No data found');

        let rowIndex = -1;
        for (let i = 1; i < rows.length; i++) {
            if (rows[i][0] === id) {
                rowIndex = i + 1;
                break;
            }
        }
        if (rowIndex === -1) throw new Error(`Loan ${id} not found`);

        const currentRow = rows[rowIndex - 1];
        const currentNeedClear = currentRow[8] === 'TRUE' || currentRow[8] === '1';
        const newNeedClear = !currentNeedClear;
        // When enabling: use provided clearAmount or default to loan amount; when disabling: set to 0
        const loanAmount = parseAmount(currentRow[2]);
        const newClearAmount = newNeedClear
            ? (clearAmount !== undefined ? Math.min(clearAmount, loanAmount) : loanAmount)
            : 0;

        await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: `${LOAN_SHEET_NAME}!I${rowIndex}:J${rowIndex}`,
            valueInputOption: 'USER_ENTERED',
            requestBody: { values: [[newNeedClear ? 'TRUE' : 'FALSE', newClearAmount]] },
        });

        return { needClear: newNeedClear, clearAmount: newClearAmount };
    }

    async delete(id: string): Promise<void> {
        const spreadsheetId = getSpreadsheetId();
        if (!spreadsheetId) throw new Error('Chưa cấu hình Google Spreadsheet ID');

        const sheets = getSheets();
        const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
        const sheet = spreadsheet.data.sheets?.find(
            s => s.properties?.title === LOAN_SHEET_NAME
        );
        if (!sheet?.properties?.sheetId) throw new Error(`Sheet ${LOAN_SHEET_NAME} not found`);

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: `${LOAN_SHEET_NAME}!A:J`,
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
        if (rowIndex === -1) throw new Error(`Loan with ID ${id} not found`);

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

export const loanManagementSheetsDB = new LoanManagementSheetsDB();

// ─── Investment Management ──────────────────────────────────────────────────
const INVESTMENT_SHEET_NAME = 'Investment';

export class InvestmentSheetsDB {
    async getAll(): Promise<InvestmentItem[]> {
        const spreadsheetId = getSpreadsheetId();
        if (!spreadsheetId) throw new Error('Chưa cấu hình Google Spreadsheet ID.');

        const sheets = getSheets();
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: `${INVESTMENT_SHEET_NAME}!A:N`,
        });

        const rows = response.data.values;
        if (!rows || rows.length <= 1) return [];

        const dataRows = rows.slice(1);
        const items: InvestmentItem[] = [];

        for (const row of dataRows) {
            const [id, title, type, buyPriceStr, quantityStr, totalInvestedStr, currentPriceStr, currentValueStr, profitLossStr, profitPercentStr, buyDate, status, platform, note] = row;
            if (!id && !title) continue;

            const buyPrice = parseAmount(buyPriceStr);
            const quantity = parseFloat(quantityStr) || 0;
            const totalInvested = parseAmount(totalInvestedStr) || buyPrice * quantity;
            const currentPrice = parseAmount(currentPriceStr);
            const currentValue = parseAmount(currentValueStr) || currentPrice * quantity;
            const profitLoss = parseAmount(profitLossStr) || currentValue - totalInvested;
            const profitPercent = parseFloat(profitPercentStr) || (totalInvested > 0 ? ((profitLoss / totalInvested) * 100) : 0);

            items.push({
                id: id || generateId(),
                title: title || '',
                type: (type as InvestmentType) || 'Khác',
                buyPrice,
                quantity,
                totalInvested,
                currentPrice,
                currentValue,
                profitLoss,
                profitPercent,
                buyDate: buyDate || '',
                status: (status as InvestmentStatus) || 'Đang giữ',
                platform: platform || '',
                note: note || '',
            });
        }

        // Sort by totalInvested descending
        items.sort((a, b) => b.totalInvested - a.totalInvested);
        return items;
    }

    async add(item: Omit<InvestmentItem, 'id'>): Promise<InvestmentItem> {
        const spreadsheetId = getSpreadsheetId();
        if (!spreadsheetId) throw new Error('Chưa cấu hình Google Spreadsheet ID');

        const sheets = getSheets();
        const newId = generateId();
        const totalInvested = item.buyPrice * item.quantity;
        const currentValue = item.currentPrice * item.quantity;
        const profitLoss = currentValue - totalInvested;
        const profitPercent = totalInvested > 0 ? ((profitLoss / totalInvested) * 100) : 0;

        const newRow = [
            newId,
            item.title,
            item.type,
            item.buyPrice,
            item.quantity,
            totalInvested,
            item.currentPrice,
            currentValue,
            profitLoss,
            profitPercent.toFixed(2),
            item.buyDate,
            item.status,
            item.platform || '',
            item.note || '',
        ];

        await sheets.spreadsheets.values.append({
            spreadsheetId,
            range: `${INVESTMENT_SHEET_NAME}!A:N`,
            valueInputOption: 'USER_ENTERED',
            insertDataOption: 'INSERT_ROWS',
            requestBody: { values: [newRow] },
        });

        return {
            ...item,
            id: newId,
            totalInvested,
            currentValue,
            profitLoss,
            profitPercent,
        };
    }

    async update(id: string, updates: Partial<InvestmentItem>): Promise<void> {
        const spreadsheetId = getSpreadsheetId();
        if (!spreadsheetId) throw new Error('Chưa cấu hình Google Spreadsheet ID');

        const sheets = getSheets();
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: `${INVESTMENT_SHEET_NAME}!A:N`,
        });

        const rows = response.data.values;
        if (!rows) throw new Error('No data found in sheet');

        let rowIndex = -1;
        for (let i = 1; i < rows.length; i++) {
            if (rows[i][0] === id) {
                rowIndex = i + 1;
                break;
            }
        }
        if (rowIndex === -1) throw new Error(`Investment with ID ${id} not found`);

        const currentRow = rows[rowIndex - 1];

        const buyPrice = updates.buyPrice !== undefined ? updates.buyPrice : parseAmount(currentRow[3]);
        const quantity = updates.quantity !== undefined ? updates.quantity : (parseFloat(currentRow[4]) || 0);
        const currentPrice = updates.currentPrice !== undefined ? updates.currentPrice : parseAmount(currentRow[6]);
        const totalInvested = buyPrice * quantity;
        const currentValue = currentPrice * quantity;
        const profitLoss = currentValue - totalInvested;
        const profitPercent = totalInvested > 0 ? ((profitLoss / totalInvested) * 100) : 0;

        const updatedRow = [
            id,
            updates.title !== undefined ? updates.title : currentRow[1],
            updates.type || currentRow[2],
            buyPrice,
            quantity,
            totalInvested,
            currentPrice,
            currentValue,
            profitLoss,
            profitPercent.toFixed(2),
            updates.buyDate !== undefined ? updates.buyDate : (currentRow[10] || ''),
            updates.status || currentRow[11],
            updates.platform !== undefined ? updates.platform : (currentRow[12] || ''),
            updates.note !== undefined ? updates.note : (currentRow[13] || ''),
        ];

        await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: `${INVESTMENT_SHEET_NAME}!A${rowIndex}:N${rowIndex}`,
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
            s => s.properties?.title === INVESTMENT_SHEET_NAME
        );
        if (!sheet?.properties?.sheetId) throw new Error(`Sheet ${INVESTMENT_SHEET_NAME} not found`);

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: `${INVESTMENT_SHEET_NAME}!A:N`,
        });

        const rows = response.data.values;
        if (!rows) throw new Error('No data found in sheet');

        let rowIndex = -1;
        for (let i = 1; i < rows.length; i++) {
            if (rows[i][0] === id) {
                rowIndex = i;
                break;
            }
        }
        if (rowIndex === -1) throw new Error(`Investment with ID ${id} not found`);

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

export const investmentSheetsDB = new InvestmentSheetsDB();
