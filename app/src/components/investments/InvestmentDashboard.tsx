'use client';

import { InvestmentItem, InvestmentType, InvestmentStatus } from '@/types/investment';
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    BarChart3,
    Gem,
    Bitcoin,
    Building2,
    PiggyBank,
    Landmark,
    CircleDot,
    Pencil,
    Trash2,
    Plus,
    BarChart2,
} from 'lucide-react';
import { useState } from 'react';

interface InvestmentDashboardProps {
    items: InvestmentItem[];
    onEdit: (item: InvestmentItem) => void;
    onDelete: (id: string) => Promise<void>;
}

const formatCurrency = (n: number): string => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n).replace('₫', 'đ');
};

const formatShort = (n: number): string => {
    const abs = Math.abs(n);
    if (abs >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}tỷ`;
    if (abs >= 1_000_000) return `${(n / 1_000_000).toFixed(0)}tr`;
    if (abs >= 1_000) return `${(n / 1_000).toFixed(0)}k`;
    return n.toString();
};

const TYPE_COLORS: Record<string, string> = {
    'Vàng': '#f59e0b',
    'Crypto': '#f97316',
    'Cổ phiếu': '#3b82f6',
    'Bất động sản': '#8b5cf6',
    'Tiết kiệm': '#22c55e',
    'Quỹ': '#14b8a6',
    'Khác': '#6366f1',
};

const TYPE_ICONS: Record<string, typeof Gem> = {
    'Vàng': Gem,
    'Crypto': Bitcoin,
    'Cổ phiếu': BarChart2,
    'Bất động sản': Building2,
    'Tiết kiệm': PiggyBank,
    'Quỹ': Landmark,
    'Khác': CircleDot,
};

const STATUS_COLORS: Record<string, string> = {
    'Đang giữ': '#3b82f6',
    'Đã bán': '#6b7280',
    'Chốt lời': '#22c55e',
    'Cắt lỗ': '#ef4444',
};

// ─── Stats Cards ──────────────────────────────────────────────────────────────
function InvestmentStats({ items }: { items: InvestmentItem[] }) {
    const totalInvested = items.reduce((s, i) => s + i.totalInvested, 0);
    const totalCurrentValue = items.reduce((s, i) => s + i.currentValue, 0);
    const totalPL = totalCurrentValue - totalInvested;
    const totalROI = totalInvested > 0 ? ((totalPL / totalInvested) * 100) : 0;
    const holdingItems = items.filter(i => i.status === 'Đang giữ');
    const holdingValue = holdingItems.reduce((s, i) => s + i.currentValue, 0);

    const stats = [
        {
            label: 'Tổng vốn đầu tư',
            value: formatCurrency(totalInvested),
            icon: DollarSign,
            gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            bgGlow: 'rgba(59, 130, 246, 0.1)',
            borderColor: '#3b82f6',
        },
        {
            label: 'Giá trị hiện tại',
            value: formatCurrency(totalCurrentValue),
            icon: BarChart3,
            gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
            bgGlow: 'rgba(139, 92, 246, 0.1)',
            borderColor: '#8b5cf6',
        },
        {
            label: 'Tổng lãi / lỗ',
            value: `${totalPL >= 0 ? '+' : ''}${formatCurrency(totalPL)}`,
            subtitle: `ROI: ${totalPL >= 0 ? '+' : ''}${totalROI.toFixed(1)}%`,
            icon: totalPL >= 0 ? TrendingUp : TrendingDown,
            gradient: totalPL >= 0
                ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
                : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            bgGlow: totalPL >= 0 ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            borderColor: totalPL >= 0 ? '#22c55e' : '#ef4444',
        },
        {
            label: 'Đang nắm giữ',
            value: formatCurrency(holdingValue),
            subtitle: `${holdingItems.length} khoản`,
            icon: Gem,
            gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            bgGlow: 'rgba(245, 158, 11, 0.1)',
            borderColor: '#f59e0b',
        },
    ];

    // ─── By type (for allocation chart) ─────────────────────────────
    const byType = items
        .filter(i => i.status === 'Đang giữ')
        .reduce((acc, i) => {
            acc[i.type] = (acc[i.type] || 0) + i.currentValue;
            return acc;
        }, {} as Record<string, number>);

    const totalHolding = Object.values(byType).reduce((a, b) => a + b, 0);

    // ─── By type P/L ─────────────────────────────
    const plByType = items
        .filter(i => i.status === 'Đang giữ')
        .reduce((acc, i) => {
            if (!acc[i.type]) acc[i.type] = { invested: 0, currentValue: 0 };
            acc[i.type].invested += i.totalInvested;
            acc[i.type].currentValue += i.currentValue;
            return acc;
        }, {} as Record<string, { invested: number; currentValue: number }>);

    return (
        <div className="space-y-4">
            {/* Stats cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div
                            key={stat.label}
                            className="glass-card p-4 relative overflow-hidden"
                            style={{ borderLeft: `3px solid ${stat.borderColor}` }}
                        >
                            <div
                                className="absolute top-0 right-0 w-20 h-20 rounded-full -translate-y-1/2 translate-x-1/2"
                                style={{ background: stat.bgGlow }}
                            />
                            <div className="relative">
                                <div
                                    className="w-8 h-8 rounded-lg flex items-center justify-center mb-2"
                                    style={{ background: stat.gradient }}
                                >
                                    <Icon className="w-4 h-4 text-white" />
                                </div>
                                <p className="text-[11px] text-[var(--color-text-muted)] uppercase tracking-wider font-medium">
                                    {stat.label}
                                </p>
                                <p className="text-lg font-bold mt-0.5 leading-tight">{stat.value}</p>
                                {stat.subtitle && (
                                    <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">{stat.subtitle}</p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Allocation + P/L charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Donut / allocation */}
                <div className="glass-card p-4 sm:p-5">
                    <h3 className="text-sm font-semibold text-[var(--color-text-secondary)] mb-4 uppercase tracking-wide">
                        Phân bổ danh mục
                    </h3>
                    {totalHolding > 0 ? (
                        <div className="flex items-center gap-6">
                            {/* SVG Donut */}
                            <div className="relative shrink-0" style={{ width: 160, height: 160 }}>
                                <svg viewBox="0 0 42 42" className="w-full h-full">
                                    {(() => {
                                        const entries = Object.entries(byType).sort((a, b) => b[1] - a[1]);
                                        let offset = 0;
                                        return entries.map(([typeName, val]) => {
                                            const pct = (val / totalHolding) * 100;
                                            const dash = pct * 0.01 * (2 * Math.PI * 15.91549);
                                            const gap = (2 * Math.PI * 15.91549) - dash;
                                            const color = TYPE_COLORS[typeName] || '#6366f1';
                                            const el = (
                                                <circle
                                                    key={typeName}
                                                    cx="21"
                                                    cy="21"
                                                    r="15.91549"
                                                    fill="transparent"
                                                    stroke={color}
                                                    strokeWidth="5"
                                                    strokeDasharray={`${dash} ${gap}`}
                                                    strokeDashoffset={-offset * 0.01 * (2 * Math.PI * 15.91549) + 25}
                                                    strokeLinecap="round"
                                                    style={{ transition: 'all 0.8s ease' }}
                                                />
                                            );
                                            offset += pct;
                                            return el;
                                        });
                                    })()}
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-xs text-[var(--color-text-muted)]">Tổng</span>
                                    <span className="text-sm font-bold">{formatShort(totalHolding)}</span>
                                </div>
                            </div>
                            {/* Legend */}
                            <div className="flex-1 space-y-2">
                                {Object.entries(byType)
                                    .sort((a, b) => b[1] - a[1])
                                    .map(([typeName, val]) => {
                                        const pct = ((val / totalHolding) * 100).toFixed(1);
                                        const color = TYPE_COLORS[typeName] || '#6366f1';
                                        return (
                                            <div key={typeName} className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded-full shrink-0" style={{ background: color }} />
                                                <span className="text-xs flex-1">{typeName}</span>
                                                <span className="text-xs font-semibold" style={{ color }}>{pct}%</span>
                                            </div>
                                        );
                                    })}
                            </div>
                        </div>
                    ) : (
                        <p className="text-sm text-[var(--color-text-muted)]">Chưa có khoản đầu tư nào đang giữ</p>
                    )}
                </div>

                {/* P/L by type */}
                <div className="glass-card p-4 sm:p-5">
                    <h3 className="text-sm font-semibold text-[var(--color-text-secondary)] mb-4 uppercase tracking-wide">
                        Lãi / Lỗ theo loại
                    </h3>
                    <div className="space-y-3">
                        {Object.entries(plByType)
                            .sort((a, b) => (b[1].currentValue - b[1].invested) - (a[1].currentValue - a[1].invested))
                            .map(([typeName, data]) => {
                                const pl = data.currentValue - data.invested;
                                const pct = data.invested > 0 ? ((pl / data.invested) * 100) : 0;
                                const color = TYPE_COLORS[typeName] || '#6366f1';
                                const barColor = pl >= 0 ? '#22c55e' : '#ef4444';
                                const maxPL = Math.max(...Object.values(plByType).map(d => Math.abs(d.currentValue - d.invested)));
                                const barWidth = maxPL > 0 ? (Math.abs(pl) / maxPL) * 100 : 0;

                                return (
                                    <div key={typeName}>
                                        <div className="flex items-center justify-between mb-1">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
                                                <span className="text-xs font-medium">{typeName}</span>
                                            </div>
                                            <span className="text-xs font-bold" style={{ color: barColor }}>
                                                {pl >= 0 ? '+' : ''}{formatShort(pl)} ({pct >= 0 ? '+' : ''}{pct.toFixed(1)}%)
                                            </span>
                                        </div>
                                        <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--color-surface-hover)' }}>
                                            <div
                                                className="h-full rounded-full transition-all duration-700"
                                                style={{
                                                    width: `${barWidth}%`,
                                                    background: `linear-gradient(90deg, ${barColor}, ${barColor}80)`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Investment Card ──────────────────────────────────────────────────────────
function InvestmentCard({
    item,
    onEdit,
    onDelete,
}: {
    item: InvestmentItem;
    onEdit: (item: InvestmentItem) => void;
    onDelete: (id: string) => Promise<void>;
}) {
    const [deleting, setDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const color = TYPE_COLORS[item.type] || '#6366f1';
    const TypeIcon = TYPE_ICONS[item.type] || CircleDot;
    const statusColor = STATUS_COLORS[item.status] || '#6b7280';
    const isProfit = item.profitLoss >= 0;
    const plColor = isProfit ? '#22c55e' : '#ef4444';

    const handleDelete = async () => {
        setDeleting(true);
        try { await onDelete(item.id); } finally { setDeleting(false); setShowDeleteConfirm(false); }
    };

    return (
        <div
            className="glass-card overflow-hidden transition-all duration-300 hover-lift flex flex-col"
            style={{ borderTop: `3px solid ${color}`, opacity: deleting ? 0.5 : 1 }}
        >
            <div className="p-4 flex flex-col flex-1">
                {/* P/L highlight */}
                <div
                    className="flex items-center justify-between mb-2 p-2 rounded-lg"
                    style={{ background: `${plColor}08` }}
                >
                    <span className="text-[10px] text-[var(--color-text-muted)] font-medium">
                        {isProfit ? 'Lãi' : 'Lỗ'}
                    </span>
                    <span className="text-sm font-bold" style={{ color: plColor }}>
                        {isProfit ? '+' : ''}{formatCurrency(item.profitLoss)}
                    </span>
                </div>

                {/* ROI badge */}
                <div className="flex items-center gap-1.5 mb-2">
                    <span
                        className="text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{
                            background: `${plColor}15`,
                            color: plColor,
                        }}
                    >
                        {isProfit ? '↑' : '↓'} {Math.abs(item.profitPercent).toFixed(1)}%
                    </span>
                    <span
                        className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                        style={{ background: `${statusColor}15`, color: statusColor }}
                    >
                        {item.status}
                    </span>
                </div>

                {/* Title */}
                <h3 className="text-sm font-bold mb-2 leading-tight line-clamp-2" title={item.title}>
                    {item.title}
                </h3>

                {/* Badges */}
                <div className="flex items-center gap-1.5 flex-wrap mb-3">
                    <span
                        className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full"
                        style={{ background: `${color}20`, color }}
                    >
                        <TypeIcon className="w-3 h-3" />
                        {item.type}
                    </span>
                    {item.platform && (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ background: 'var(--color-surface-hover)' }}>
                            {item.platform}
                        </span>
                    )}
                </div>

                {/* Value grid */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="p-2 rounded-lg" style={{ background: 'var(--color-surface-hover)' }}>
                        <span className="text-[10px] text-[var(--color-text-muted)] block">Giá mua</span>
                        <span className="text-xs font-semibold">{formatCurrency(item.buyPrice)}</span>
                    </div>
                    <div className="p-2 rounded-lg" style={{ background: 'var(--color-surface-hover)' }}>
                        <span className="text-[10px] text-[var(--color-text-muted)] block">Giá hiện tại</span>
                        <span className="text-xs font-semibold" style={{ color: plColor }}>{formatCurrency(item.currentPrice)}</span>
                    </div>
                    <div className="p-2 rounded-lg" style={{ background: 'var(--color-surface-hover)' }}>
                        <span className="text-[10px] text-[var(--color-text-muted)] block">Tổng vốn</span>
                        <span className="text-xs font-semibold">{formatCurrency(item.totalInvested)}</span>
                    </div>
                    <div className="p-2 rounded-lg" style={{ background: 'var(--color-surface-hover)' }}>
                        <span className="text-[10px] text-[var(--color-text-muted)] block">Giá trị HT</span>
                        <span className="text-xs font-semibold" style={{ color: plColor }}>{formatCurrency(item.currentValue)}</span>
                    </div>
                </div>

                {/* Quantity & Date */}
                <div className="flex items-center gap-3 text-[10px] text-[var(--color-text-muted)] mb-2">
                    <span>SL: <strong className="text-[var(--color-text-primary)]">{item.quantity}</strong></span>
                    {item.buyDate && <span>Mua: <strong className="text-[var(--color-text-primary)]">{item.buyDate}</strong></span>}
                </div>

                {/* Note */}
                {item.note && (
                    <p className="text-[11px] text-[var(--color-text-muted)] mb-3 line-clamp-2" title={item.note}>
                        {item.note}
                    </p>
                )}

                <div className="flex-1" />

                {/* Actions */}
                <div className="flex items-center gap-1 pt-2 border-t" style={{ borderColor: 'var(--color-border)' }}>
                    <button
                        onClick={() => onEdit(item)}
                        className="flex items-center gap-1 p-1.5 rounded-lg text-[10px] font-medium transition-all hover:bg-[var(--color-surface-hover)]"
                        style={{ color: 'var(--color-text-muted)' }}
                    >
                        <Pencil className="w-3 h-3" />
                        Sửa
                    </button>
                    <div className="flex-1" />
                    {!showDeleteConfirm ? (
                        <button
                            onClick={() => setShowDeleteConfirm(true)}
                            className="flex items-center gap-1 p-1.5 rounded-lg text-[10px] font-medium transition-all hover:bg-[rgba(239,68,68,0.1)]"
                            style={{ color: 'var(--color-text-muted)' }}
                        >
                            <Trash2 className="w-3 h-3" />
                        </button>
                    ) : (
                        <div className="flex items-center gap-1">
                            <button
                                onClick={handleDelete}
                                disabled={deleting}
                                className="text-[10px] px-2 py-1 rounded-lg text-white font-medium"
                                style={{ background: 'var(--color-danger)' }}
                            >
                                {deleting ? '...' : 'Xóa'}
                            </button>
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="text-[10px] px-2 py-1 rounded-lg font-medium hover:bg-[var(--color-surface-hover)]"
                            >
                                Hủy
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export function InvestmentDashboard({ items, onEdit, onDelete }: InvestmentDashboardProps) {
    const [filterType, setFilterType] = useState<InvestmentType | 'all'>('all');
    const [filterStatus, setFilterStatus] = useState<InvestmentStatus | 'all'>('all');

    const filteredItems = items.filter(i => {
        if (filterType !== 'all' && i.type !== filterType) return false;
        if (filterStatus !== 'all' && i.status !== filterStatus) return false;
        return true;
    });

    const uniqueTypes = [...new Set(items.map(i => i.type))];
    const uniqueStatuses = [...new Set(items.map(i => i.status))];

    return (
        <div className="space-y-5">
            <InvestmentStats items={items} />

            {/* Filters */}
            <div className="glass-card p-3">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-medium text-[var(--color-text-muted)] mr-1">Lọc:</span>

                    <button
                        onClick={() => { setFilterType('all'); setFilterStatus('all'); }}
                        className="px-3 py-1 rounded-lg text-[11px] font-medium transition-all"
                        style={{
                            background: filterType === 'all' && filterStatus === 'all' ? 'var(--color-primary)' : 'var(--color-surface-hover)',
                            color: filterType === 'all' && filterStatus === 'all' ? 'white' : 'var(--color-text-muted)',
                        }}
                    >
                        Tất cả ({items.length})
                    </button>

                    <div className="h-5 w-px bg-[var(--color-border)] mx-1 hidden sm:block" />

                    {uniqueTypes.map(t => {
                        const color = TYPE_COLORS[t] || '#6366f1';
                        return (
                            <button
                                key={t}
                                onClick={() => { setFilterType(filterType === t ? 'all' : t); setFilterStatus('all'); }}
                                className="px-3 py-1 rounded-lg text-[11px] font-medium transition-all"
                                style={{
                                    background: filterType === t ? `${color}20` : 'var(--color-surface-hover)',
                                    color: filterType === t ? color : 'var(--color-text-muted)',
                                    border: filterType === t ? `1px solid ${color}40` : '1px solid transparent',
                                }}
                            >
                                {t} ({items.filter(i => i.type === t).length})
                            </button>
                        );
                    })}

                    <div className="h-5 w-px bg-[var(--color-border)] mx-1 hidden sm:block" />

                    {uniqueStatuses.map(s => {
                        const color = STATUS_COLORS[s] || '#6b7280';
                        return (
                            <button
                                key={s}
                                onClick={() => { setFilterStatus(filterStatus === s ? 'all' : s); setFilterType('all'); }}
                                className="px-3 py-1 rounded-lg text-[11px] font-medium transition-all"
                                style={{
                                    background: filterStatus === s ? `${color}20` : 'var(--color-surface-hover)',
                                    color: filterStatus === s ? color : 'var(--color-text-muted)',
                                    border: filterStatus === s ? `1px solid ${color}40` : '1px solid transparent',
                                }}
                            >
                                {s} ({items.filter(i => i.status === s).length})
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Card grid */}
            {filteredItems.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredItems.map(item => (
                        <InvestmentCard key={item.id} item={item} onEdit={onEdit} onDelete={onDelete} />
                    ))}
                </div>
            ) : (
                <div className="glass-card p-8 text-center">
                    <Plus className="w-10 h-10 mx-auto mb-3 text-[var(--color-text-muted)]" />
                    <p className="text-sm text-[var(--color-text-muted)]">
                        {items.length === 0 ? 'Chưa có khoản đầu tư nào. Bấm nút + để thêm mới!' : 'Không có khoản đầu tư nào phù hợp bộ lọc.'}
                    </p>
                </div>
            )}
        </div>
    );
}
