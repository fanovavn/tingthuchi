// Category color mapping
const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
    'Ăn uống': { bg: 'rgba(239, 68, 68, 0.15)', text: '#ef4444', border: '#ef4444' },
    'Nấu ăn/siêu thị': { bg: 'rgba(249, 115, 22, 0.15)', text: '#f97316', border: '#f97316' },
    'Mua sắm': { bg: 'rgba(236, 72, 153, 0.15)', text: '#ec4899', border: '#ec4899' },
    'Sức khoẻ': { bg: 'rgba(34, 197, 94, 0.15)', text: '#22c55e', border: '#22c55e' },
    'Hoá đơn (ĐT, net, cc...)': { bg: 'rgba(59, 130, 246, 0.15)', text: '#3b82f6', border: '#3b82f6' },
    'Trả nợ': { bg: 'rgba(168, 85, 247, 0.15)', text: '#a855f7', border: '#a855f7' },
    'Đi lại: Đổ xăng': { bg: 'rgba(234, 179, 8, 0.15)', text: '#eab308', border: '#eab308' },
    'Làm đẹp': { bg: 'rgba(244, 114, 182, 0.15)', text: '#f472b6', border: '#f472b6' },
    'Tiệc tùng/vui chơi': { bg: 'rgba(139, 92, 246, 0.15)', text: '#8b5cf6', border: '#8b5cf6' },
    'Đi lại: Thuê xe': { bg: 'rgba(251, 191, 36, 0.15)', text: '#fbbf24', border: '#fbbf24' },
    'Thú cưng': { bg: 'rgba(132, 204, 22, 0.15)', text: '#84cc16', border: '#84cc16' },
    'Học tập': { bg: 'rgba(6, 182, 212, 0.15)', text: '#06b6d4', border: '#06b6d4' },
    'Freelancer': { bg: 'rgba(16, 185, 129, 0.15)', text: '#10b981', border: '#10b981' },
    'Đi lại: Taxi': { bg: 'rgba(245, 158, 11, 0.15)', text: '#f59e0b', border: '#f59e0b' },
    'Làm việc': { bg: 'rgba(99, 102, 241, 0.15)', text: '#6366f1', border: '#6366f1' },
    'Quà tặng': { bg: 'rgba(217, 70, 239, 0.15)', text: '#d946ef', border: '#d946ef' },
    'Tiền học kitty': { bg: 'rgba(20, 184, 166, 0.15)', text: '#14b8a6', border: '#14b8a6' },
    'Lương tháng': { bg: 'rgba(34, 197, 94, 0.15)', text: '#22c55e', border: '#22c55e' },
    'Được tặng': { bg: 'rgba(16, 185, 129, 0.15)', text: '#10b981', border: '#10b981' },
    'Bảo hiểm': { bg: 'rgba(100, 116, 139, 0.15)', text: '#64748b', border: '#64748b' },
    'Sửa nhà': { bg: 'rgba(120, 113, 108, 0.15)', text: '#78716c', border: '#78716c' },
    'Du lịch': { bg: 'rgba(14, 165, 233, 0.15)', text: '#0ea5e9', border: '#0ea5e9' },
    'Đi lại: Sửa xe': { bg: 'rgba(161, 161, 170, 0.15)', text: '#a1a1aa', border: '#a1a1aa' },
    'Khoản thu khác': { bg: 'rgba(34, 197, 94, 0.15)', text: '#22c55e', border: '#22c55e' },
};

const DEFAULT_COLOR = { bg: 'rgba(148, 163, 184, 0.15)', text: '#94a3b8', border: '#94a3b8' };

export function getCategoryColor(category: string) {
    return CATEGORY_COLORS[category] || DEFAULT_COLOR;
}

interface CategoryLabelProps {
    category: string;
    size?: 'sm' | 'md';
    showIcon?: boolean;
}

export function CategoryLabel({ category, size = 'sm', showIcon = false }: CategoryLabelProps) {
    const colors = getCategoryColor(category);

    return (
        <span
            className={`inline-flex items-center rounded-full font-medium whitespace-nowrap gap-1 ${size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'
                }`}
            style={{
                backgroundColor: colors.bg,
                color: colors.text,
                border: `1px solid ${colors.border}`,
            }}
        >
            {showIcon && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
            {category}
        </span>
    );
}
