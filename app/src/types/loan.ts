export type LoanPriority = 'ASAP' | 'Trả ngay';
export type LoanType = 'Thế chấp' | 'Tín dụng' | 'Trả góp' | 'Khác';

export interface LoanItem {
    id: string;
    title: string;
    amount: number;
    priority: LoanPriority;
    typeLoan: LoanType;
    monthlyInterest: number;
    monthlyPayment: number;
    description: string;
    needClear: boolean;
    clearAmount: number;
}
