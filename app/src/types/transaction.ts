export interface Transaction {
    id: string;
    date: Date;
    amount: number;
    category: string;
    description: string;
    type: 'income' | 'expense';
}

export interface TransactionFilter {
    startDate?: Date;
    endDate?: Date;
    type?: 'income' | 'expense' | 'all';
    category?: string;
    searchQuery?: string;
}

export interface DashboardStats {
    totalIncome: number;
    totalExpense: number;
    balance: number;
    transactionCount: number;
}

export const CATEGORIES = [
    'Ăn uống',
    'Nấu ăn/siêu thị',
    'Mua sắm',
    'Sức khoẻ',
    'Hoá đơn (ĐT, net, cc...)',
    'Trả nợ',
    'Đi lại: Đổ xăng',
    'Làm đẹp',
    'Tiệc tùng/vui chơi',
    'Đi lại: Thuê xe',
    'Thú cưng',
    'Học tập',
    'Freelancer',
    'Đi lại: Taxi',
    'Làm việc',
    'Quà tặng',
    'Tiền học kitty',
    'Lương tháng',
    'Được tặng',
    'Bảo hiểm',
    'Sửa nhà',
    'Du lịch',
    'Đi lại: Sửa xe',
    'Khoản thu khác',
] as const;

export type Category = typeof CATEGORIES[number];
