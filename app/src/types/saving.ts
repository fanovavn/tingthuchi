export interface SavingTransaction {
    id: string;
    date: Date;
    amount: number;
    note: string;
    type: 'deposit' | 'withdraw';
}

export interface SavingStats {
    totalDeposit: number;
    totalWithdraw: number;
    balance: number;
    transactionCount: number;
}
