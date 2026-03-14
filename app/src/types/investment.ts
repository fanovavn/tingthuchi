export type InvestmentType = 'Vàng' | 'Crypto' | 'Cổ phiếu' | 'Bất động sản' | 'Tiết kiệm' | 'Quỹ' | 'Khác';
export type InvestmentStatus = 'Đang giữ' | 'Đã bán' | 'Chốt lời' | 'Cắt lỗ';

export interface InvestmentItem {
    id: string;
    title: string;
    type: InvestmentType;
    buyPrice: number;
    quantity: number;
    totalInvested: number;
    currentPrice: number;
    currentValue: number;
    profitLoss: number;
    profitPercent: number;
    buyDate: string;
    status: InvestmentStatus;
    platform: string;
    note: string;
}
