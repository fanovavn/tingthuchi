export type Assignee = 'Tý' | 'Mèo';

export interface PlanMoneyItem {
    id: string;
    dayNumber: number;   // 1–30
    note: string;
    amount: number;
    type: 'income' | 'expense';
    assignee: Assignee;
    description?: string;
    checked?: boolean;
}
