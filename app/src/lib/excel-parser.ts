import * as XLSX from 'xlsx';
import { Transaction } from '@/types/transaction';
import { parseExcelDate, generateId } from './utils';

interface ExcelRow {
    'Ngày': string;
    'Amount': number;
    'Phân nhóm': string;
    'Mô tả': string;
    'Kiểu giao dịch': string;
}

interface CategoryExcelRow {
    'ID': string;
    'Tên danh mục': string;
    'Nhóm danh mục': string;
}

export interface Category {
    id: string;
    name: string;
    type: 'income' | 'expense';
    color: string;
}

const CATEGORIES_STORAGE_KEY = 'crm-categories';

// Default category colors for new categories
const DEFAULT_COLORS = [
    '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
    '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
    '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
    '#ec4899', '#f472b6', '#64748b', '#78716c', '#a1a1aa',
];

function getRandomColor(): string {
    return DEFAULT_COLORS[Math.floor(Math.random() * DEFAULT_COLORS.length)];
}

export function parseExcelData(buffer: ArrayBuffer): Transaction[] {
    const workbook = XLSX.read(buffer, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json<ExcelRow>(worksheet);

    return data.map((row) => ({
        id: generateId(),
        date: parseExcelDate(row['Ngày']),
        amount: row['Amount'],
        category: normalizeCategory(row['Phân nhóm']),
        description: row['Mô tả'] || '',
        type: row['Kiểu giao dịch'] === 'Thu nhập' ? 'income' : 'expense',
    }));
}

export function parseCategoriesFromExcel(buffer: ArrayBuffer): Category[] {
    const workbook = XLSX.read(buffer, { type: 'array' });

    // Find Category sheet (could be named "Category" or "Danh mục")
    const categorySheetName = workbook.SheetNames.find(
        name => name.toLowerCase() === 'category' || name === 'Danh mục'
    );

    if (!categorySheetName) {
        return [];
    }

    const worksheet = workbook.Sheets[categorySheetName];
    const data = XLSX.utils.sheet_to_json<CategoryExcelRow>(worksheet);

    return data.map((row) => ({
        id: row['ID'] || generateId(),
        name: row['Tên danh mục'],
        type: row['Nhóm danh mục'] === 'Thu nhập' ? 'income' : 'expense',
        color: getRandomColor(),
    }));
}

function normalizeCategory(category: string): string {
    if (!category) return 'Khác';

    // Remove duplicate words like "Ăn uống Ăn uống Ăn uống"
    const words = category.split(' ');
    const uniqueWords: string[] = [];

    for (let i = 0; i < words.length; i++) {
        if (i === 0 || words[i] !== words[i - 1]) {
            uniqueWords.push(words[i]);
        }
    }

    // Check for duplicated phrases (e.g., "Nấu ăn/siêu thị Nấu ăn/siêu thị")
    const result = uniqueWords.join(' ');
    const halfLength = Math.floor(result.length / 2);
    const firstHalf = result.substring(0, halfLength).trim();
    const secondHalf = result.substring(halfLength).trim();

    if (firstHalf === secondHalf) {
        return firstHalf;
    }

    return result;
}

export async function loadExcelFromUrl(url: string): Promise<{ transactions: Transaction[]; categories: Category[] }> {
    const response = await fetch(url);
    const buffer = await response.arrayBuffer();

    const transactions = parseExcelData(buffer);
    const categories = parseCategoriesFromExcel(buffer);

    return { transactions, categories };
}

export function exportToExcel(transactions: Transaction[], categories?: Category[]): Blob {
    const workbook = XLSX.utils.book_new();

    // Sheet 1: Transactions (without account/balance)
    const transactionData = transactions.map((t) => ({
        'Ngày': `${t.date.getHours().toString().padStart(2, '0')}:${t.date.getMinutes().toString().padStart(2, '0')} ${t.date.getDate().toString().padStart(2, '0')}/${(t.date.getMonth() + 1).toString().padStart(2, '0')}/${t.date.getFullYear()}`,
        'Amount': t.amount,
        'Phân nhóm': t.category,
        'Mô tả': t.description,
        'Kiểu giao dịch': t.type === 'income' ? 'Thu nhập' : 'Chi phí',
    }));

    const transactionSheet = XLSX.utils.json_to_sheet(transactionData);
    XLSX.utils.book_append_sheet(workbook, transactionSheet, 'Transaction');

    // Sheet 2: Categories
    const cats = categories && categories.length > 0 ? categories : getCategories();
    if (cats.length > 0) {
        const categoryData = cats.map((c) => ({
            'ID': c.id,
            'Tên danh mục': c.name,
            'Nhóm danh mục': c.type === 'income' ? 'Thu nhập' : 'Chi tiêu',
        }));

        const categorySheet = XLSX.utils.json_to_sheet(categoryData);
        XLSX.utils.book_append_sheet(workbook, categorySheet, 'Category');
    }

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}

export function getCategories(): Category[] {
    if (typeof window === 'undefined') return [];

    const stored = localStorage.getItem(CATEGORIES_STORAGE_KEY);
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch {
            return [];
        }
    }
    return [];
}

export function saveCategories(categories: Category[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
}

export function addCategoryIfNotExists(categoryName: string, type: 'income' | 'expense' = 'expense'): void {
    const categories = getCategories();
    const exists = categories.some(c => c.name.toLowerCase() === categoryName.toLowerCase());

    if (!exists && categoryName && categoryName !== 'Khác') {
        const newCategory: Category = {
            id: generateId(),
            name: categoryName,
            type,
            color: getRandomColor(),
        };
        categories.push(newCategory);
        saveCategories(categories);
    }
}
