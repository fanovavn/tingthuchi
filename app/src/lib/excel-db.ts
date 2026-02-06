
import * as XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';
import { Transaction } from '@/types/transaction';
import { generateId } from './utils';
import { format } from 'date-fns';

const FILE_PATH = path.join(process.cwd(), 'data', 'transactions.xlsx');

interface ExcelRow {
    'Ngày': string;
    'Amount': number;
    'Phân nhóm': string;
    'Mô tả': string;
    'Kiểu giao dịch': string;
    'ID'?: string; // New persistent ID column
}

const formatDateForExcel = (date: Date): string => {
    return format(date, 'dd/MM/yyyy');
};

const parseExcelDate = (dateStr: string | number): Date => {
    if (typeof dateStr === 'number') {
        return new Date((dateStr - (25567 + 2)) * 86400 * 1000);
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

export class ExcelDB {
    private getWorkbook() {
        if (!fs.existsSync(FILE_PATH)) {
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.json_to_sheet([]);
            XLSX.utils.book_append_sheet(wb, ws, 'Transactions');
            return wb;
        }
        const fileBuffer = fs.readFileSync(FILE_PATH);
        return XLSX.read(fileBuffer, { type: 'buffer' });
    }

    private saveWorkbook(wb: XLSX.WorkBook) {
        const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
        fs.writeFileSync(FILE_PATH, buffer);
    }

    async getAll(): Promise<Transaction[]> {
        const wb = this.getWorkbook();
        const sheet = wb.Sheets[wb.SheetNames[0]];
        let data = XLSX.utils.sheet_to_json<ExcelRow>(sheet);

        // Auto-generate IDs for rows missing them
        let hasChanges = false;
        const transactions = data.map((row) => {
            if (!row.ID) {
                row.ID = generateId();
                hasChanges = true;
            }
            return {
                id: row.ID!,
                date: parseExcelDate(row['Ngày']),
                amount: row['Amount'] || 0,
                category: row['Phân nhóm'] || 'Khác',
                description: row['Mô tả'] || '',
                type: (row['Kiểu giao dịch'] === 'Thu nhập' ? 'income' : 'expense') as 'income' | 'expense',
            };
        });

        if (hasChanges) {
            // Write back ID updates
            const newSheet = XLSX.utils.json_to_sheet(data);
            wb.Sheets[wb.SheetNames[0]] = newSheet;
            try {
                this.saveWorkbook(wb);
            } catch (error) {
                console.error('Error saving updated IDs to Excel:', error);
                // Continue even if save fails, but IDs wont persist
            }
        }

        return transactions;
    }

    async add(transaction: Omit<Transaction, 'id'>): Promise<Transaction> {
        const wb = this.getWorkbook();
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json<ExcelRow>(sheet);

        const newId = generateId();
        const newRow: ExcelRow = {
            'Ngày': formatDateForExcel(transaction.date),
            'Amount': transaction.amount,
            'Phân nhóm': transaction.category,
            'Mô tả': transaction.description,
            'Kiểu giao dịch': transaction.type === 'income' ? 'Thu nhập' : 'Chi phí',
            'ID': newId
        };

        data.unshift(newRow);

        const newSheet = XLSX.utils.json_to_sheet(data);
        wb.Sheets[wb.SheetNames[0]] = newSheet;
        this.saveWorkbook(wb);

        return {
            ...transaction,
            id: newId
        };
    }

    async update(id: string, updates: Partial<Transaction>) {
        const wb = this.getWorkbook();
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json<ExcelRow>(sheet);

        const rowIndex = data.findIndex(row => row.ID === id);

        if (rowIndex >= 0) {
            const currentRow = data[rowIndex];

            if (updates.date) currentRow['Ngày'] = formatDateForExcel(updates.date);
            if (updates.amount !== undefined) currentRow['Amount'] = updates.amount;
            if (updates.category) currentRow['Phân nhóm'] = updates.category;
            if (updates.description !== undefined) currentRow['Mô tả'] = updates.description;
            if (updates.type) currentRow['Kiểu giao dịch'] = updates.type === 'income' ? 'Thu nhập' : 'Chi phí';

            const newSheet = XLSX.utils.json_to_sheet(data);
            wb.Sheets[wb.SheetNames[0]] = newSheet;
            this.saveWorkbook(wb);
        } else {
            throw new Error(`Transaction with ID ${id} not found`);
        }
    }

    async delete(id: string) {
        const wb = this.getWorkbook();
        const sheet = wb.Sheets[wb.SheetNames[0]];
        let data = XLSX.utils.sheet_to_json<ExcelRow>(sheet);

        const initialLength = data.length;
        data = data.filter(row => row.ID !== id);

        if (data.length < initialLength) {
            const newSheet = XLSX.utils.json_to_sheet(data);
            wb.Sheets[wb.SheetNames[0]] = newSheet;
            this.saveWorkbook(wb);
        } else {
            throw new Error(`Transaction with ID ${id} not found`);
        }
    }
}

export const excelDB = new ExcelDB();
