'use client';

import { LoanItem } from '@/types/loan';
import { formatCurrency } from '@/lib/utils';
import {
    Landmark,
    CreditCard,
    ShoppingBag,
    TrendingDown,
    AlertTriangle,
    Target,
    Pencil,
    Trash2,
    CircleDot,
} from 'lucide-react';
import { useState, useRef } from 'react';

interface LoanDashboardProps {
    items: LoanItem[];
    onEdit: (item: LoanItem) => void;
    onDelete: (id: string) => Promise<void>;
    onToggleNeedClear: (id: string) => Promise<void>;
}

// ─── Summary Stats ───────────────────────────────────────────────────────────
function LoanStats({ items }: { items: LoanItem[] }) {
    const chartRef = useRef<HTMLDivElement>(null);
    const [tooltip, setTooltip] = useState<{ idx: number; x: number; y: number } | null>(null);

    const totalDebt = items.reduce((sum, i) => sum + i.amount, 0);
    const totalMonthlyInterest = items.reduce((sum, i) => sum + i.monthlyInterest, 0);
    const totalMonthlyPayment = items.reduce((sum, i) => sum + i.monthlyPayment, 0);
    const needClearItems = items.filter(i => i.needClear);
    const needClearTotal = needClearItems.reduce((sum, i) => sum + i.amount, 0);
    const needClearMonthly = needClearItems.reduce((sum, i) => sum + i.monthlyPayment, 0);

    // By type
    const byType = items.reduce((acc, i) => {
        acc[i.typeLoan] = (acc[i.typeLoan] || 0) + i.amount;
        return acc;
    }, {} as Record<string, number>);

    const stats = [
        {
            label: 'Tổng dư nợ',
            value: formatCurrency(totalDebt),
            icon: TrendingDown,
            gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            bgGlow: 'rgba(239, 68, 68, 0.1)',
            borderColor: '#ef4444',
        },
        {
            label: 'Lãi phải trả/tháng',
            value: formatCurrency(totalMonthlyInterest),
            icon: AlertTriangle,
            gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            bgGlow: 'rgba(245, 158, 11, 0.1)',
            borderColor: '#f59e0b',
        },
        {
            label: 'Tổng trả hàng tháng',
            value: formatCurrency(totalMonthlyPayment),
            icon: CreditCard,
            gradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            bgGlow: 'rgba(99, 102, 241, 0.1)',
            borderColor: '#6366f1',
        },
        {
            label: 'Mục tiêu clear',
            value: formatCurrency(needClearItems.reduce((sum, i) => sum + (i.clearAmount || 0), 0)),
            subtitle: `${needClearItems.length} khoản · ${formatCurrency(needClearMonthly)}/tháng`,
            icon: Target,
            gradient: 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)',
            bgGlow: 'rgba(236, 72, 153, 0.1)',
            borderColor: '#ec4899',
        },
    ];

    // ─── Bubble chart data ─────────────────────────────────────────────────
    const BUBBLE_COLORS = [
        { fill: '#8b5cf6', gradient: ['#a78bfa', '#7c3aed'] },  // violet
        { fill: '#f59e0b', gradient: ['#fbbf24', '#d97706'] },  // amber
        { fill: '#22c55e', gradient: ['#4ade80', '#16a34a'] },  // green
        { fill: '#ec4899', gradient: ['#f472b6', '#db2777'] },  // pink
        { fill: '#3b82f6', gradient: ['#60a5fa', '#2563eb'] },  // blue
        { fill: '#ef4444', gradient: ['#f87171', '#dc2626'] },  // red
        { fill: '#14b8a6', gradient: ['#2dd4bf', '#0d9488'] },  // teal
        { fill: '#f97316', gradient: ['#fb923c', '#ea580c'] },  // orange
    ];

    const formatShort = (n: number): string => {
        if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}tỷ`;
        if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(0)}tr`;
        if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k`;
        return n.toString();
    };

    // Circle packing algorithm
    const packBubbles = (data: LoanItem[], width: number, height: number) => {
        if (data.length === 0) return [];

        const maxAmount = Math.max(...data.map(d => d.amount));
        const minAmount = Math.min(...data.map(d => d.amount));
        const maxR = Math.min(width, height) * 0.32;
        const minR = 24;

        // Calculate radii proportional to sqrt of amount (area = amount)
        const bubbles = data.map((item, idx) => {
            const ratio = maxAmount > minAmount
                ? (item.amount - minAmount) / (maxAmount - minAmount)
                : 1;
            const r = minR + Math.sqrt(ratio) * (maxR - minR);
            return { item, r, x: width / 2, y: height / 2, colorIdx: idx % BUBBLE_COLORS.length };
        });

        // Sort largest first for better packing
        bubbles.sort((a, b) => b.r - a.r);

        // Simple force-directed placement
        const cx = width / 2;
        const cy = height / 2;

        // Initial placement in a spiral pattern
        bubbles.forEach((b, i) => {
            if (i === 0) {
                b.x = cx;
                b.y = cy;
            } else {
                const angle = i * 2.4; // golden angle
                const dist = b.r + bubbles[0].r * 0.3 + i * 8;
                b.x = cx + Math.cos(angle) * dist;
                b.y = cy + Math.sin(angle) * dist;
            }
        });

        // Run simulation to resolve overlaps
        for (let iter = 0; iter < 120; iter++) {
            // Resolve collisions
            for (let i = 0; i < bubbles.length; i++) {
                for (let j = i + 1; j < bubbles.length; j++) {
                    const dx = bubbles[j].x - bubbles[i].x;
                    const dy = bubbles[j].y - bubbles[i].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    const minDist = bubbles[i].r + bubbles[j].r + 3; // 3px gap

                    if (dist < minDist && dist > 0) {
                        const overlap = (minDist - dist) / 2;
                        const nx = dx / dist;
                        const ny = dy / dist;
                        bubbles[i].x -= nx * overlap;
                        bubbles[i].y -= ny * overlap;
                        bubbles[j].x += nx * overlap;
                        bubbles[j].y += ny * overlap;
                    }
                }
            }

            // Pull toward center (gravity)
            for (const b of bubbles) {
                b.x += (cx - b.x) * 0.02;
                b.y += (cy - b.y) * 0.02;
            }
        }

        // Normalize positions to fit within bounds with padding
        const pad = 10;
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        for (const b of bubbles) {
            minX = Math.min(minX, b.x - b.r);
            maxX = Math.max(maxX, b.x + b.r);
            minY = Math.min(minY, b.y - b.r);
            maxY = Math.max(maxY, b.y + b.r);
        }
        const bboxW = maxX - minX;
        const bboxH = maxY - minY;
        const scale = Math.min((width - pad * 2) / bboxW, (height - pad * 2) / bboxH, 1);
        const offsetX = (width - bboxW * scale) / 2 - minX * scale;
        const offsetY = (height - bboxH * scale) / 2 - minY * scale;

        return bubbles.map(b => ({
            ...b,
            x: b.x * scale + offsetX,
            y: b.y * scale + offsetY,
            r: b.r * scale,
        }));
    };

    const svgWidth = 700;
    const svgHeight = 420;
    const packedBubbles = packBubbles(items, svgWidth, svgHeight);

    return (
        <div className="space-y-4">
            {/* Main stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {stats.map((stat, idx) => (
                    <div
                        key={idx}
                        className="glass-card p-4 sm:p-5 hover-lift relative overflow-hidden"
                        style={{ borderLeft: `4px solid ${stat.borderColor}` }}
                    >
                        {/* Glow */}
                        <div
                            className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-20 blur-2xl"
                            style={{ background: stat.gradient }}
                        />
                        <div className="relative">
                            <div className="flex items-center gap-2 mb-2">
                                <div
                                    className="p-1.5 rounded-lg"
                                    style={{ background: stat.bgGlow }}
                                >
                                    <stat.icon className="w-4 h-4" style={{ color: stat.borderColor }} />
                                </div>
                                <span className="text-xs text-[var(--color-text-muted)] font-medium uppercase tracking-wide">
                                    {stat.label}
                                </span>
                            </div>
                            <p className="text-lg sm:text-xl font-bold" style={{ color: stat.borderColor }}>
                                {stat.value}
                            </p>
                            {stat.subtitle && (
                                <p className="text-xs text-[var(--color-text-muted)] mt-1">
                                    {stat.subtitle}
                                </p>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Bubble Chart + Type breakdown side by side */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                {/* Bubble Chart */}
                <div className="glass-card p-4 sm:p-5 lg:col-span-3">
                    <h3 className="text-sm font-semibold text-[var(--color-text-secondary)] mb-3 uppercase tracking-wide">
                        Bản đồ khoản nợ
                    </h3>
                    <div
                        className="relative"
                        style={{ minHeight: '320px' }}
                        ref={chartRef}
                        onMouseLeave={() => setTooltip(null)}
                    >
                        <svg
                            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                            className="w-full h-auto"
                            style={{ maxHeight: '420px' }}
                        >
                            <defs>
                                {packedBubbles.map((b, idx) => {
                                    const colors = BUBBLE_COLORS[b.colorIdx];
                                    return (
                                        <radialGradient key={`grad-${idx}`} id={`bubble-grad-${idx}`} cx="35%" cy="35%" r="65%">
                                            <stop offset="0%" stopColor={colors.gradient[0]} stopOpacity="0.95" />
                                            <stop offset="100%" stopColor={colors.gradient[1]} stopOpacity="0.85" />
                                        </radialGradient>
                                    );
                                })}
                            </defs>

                            {packedBubbles.map((b, idx) => {
                                const colors = BUBBLE_COLORS[b.colorIdx];
                                const titleFontSize = Math.max(9, Math.min(b.r * 0.28, 16));
                                const amountFontSize = Math.max(8, Math.min(b.r * 0.22, 13));
                                const showLabel = b.r >= 22;
                                const showAmount = b.r >= 32;
                                const pct = totalDebt > 0 ? ((b.item.amount / totalDebt) * 100).toFixed(1) : '0';
                                const showPct = b.r >= 45;

                                return (
                                    <g
                                        key={b.item.id}
                                        className="loan-bubble"
                                        style={{ cursor: 'pointer' }}
                                        onMouseEnter={(e) => {
                                            const rect = chartRef.current?.getBoundingClientRect();
                                            if (rect) {
                                                setTooltip({
                                                    idx,
                                                    x: e.clientX - rect.left,
                                                    y: e.clientY - rect.top,
                                                });
                                            }
                                        }}
                                        onMouseMove={(e) => {
                                            const rect = chartRef.current?.getBoundingClientRect();
                                            if (rect) {
                                                setTooltip({
                                                    idx,
                                                    x: e.clientX - rect.left,
                                                    y: e.clientY - rect.top,
                                                });
                                            }
                                        }}
                                        onMouseLeave={() => setTooltip(null)}
                                    >
                                        {/* Glow shadow */}
                                        <circle
                                            cx={b.x}
                                            cy={b.y}
                                            r={b.r + 2}
                                            fill={colors.fill}
                                            opacity="0.15"
                                            filter="url(#blur)"
                                        />
                                        {/* Main bubble */}
                                        <circle
                                            cx={b.x}
                                            cy={b.y}
                                            r={b.r}
                                            fill={`url(#bubble-grad-${idx})`}
                                            stroke={colors.fill}
                                            strokeWidth="1.5"
                                            strokeOpacity="0.3"
                                            style={{
                                                animation: `bubble-pop 0.5s ease-out ${idx * 0.08}s both`,
                                            }}
                                        />
                                        {/* NeedClear ring */}
                                        {b.item.needClear && (
                                            <circle
                                                cx={b.x}
                                                cy={b.y}
                                                r={b.r + 3}
                                                fill="none"
                                                stroke="#ec4899"
                                                strokeWidth="2.5"
                                                strokeDasharray="6 3"
                                                opacity="0.8"
                                            />
                                        )}
                                        {/* Labels */}
                                        {showLabel && (
                                            <text
                                                x={b.x}
                                                y={b.y - (showAmount ? amountFontSize * 0.5 : 0) - (showPct ? 4 : 0)}
                                                textAnchor="middle"
                                                dominantBaseline="central"
                                                fill="white"
                                                fontWeight="700"
                                                fontSize={titleFontSize}
                                                style={{ textShadow: '0 1px 3px rgba(0,0,0,0.4)', pointerEvents: 'none' }}
                                            >
                                                {b.item.title.length > 14 && b.r < 60
                                                    ? b.item.title.slice(0, 12) + '…'
                                                    : b.item.title}
                                            </text>
                                        )}
                                        {showAmount && (
                                            <text
                                                x={b.x}
                                                y={b.y + titleFontSize * 0.6 - (showPct ? 2 : 0)}
                                                textAnchor="middle"
                                                dominantBaseline="central"
                                                fill="rgba(255,255,255,0.9)"
                                                fontWeight="600"
                                                fontSize={amountFontSize}
                                                style={{ pointerEvents: 'none' }}
                                            >
                                                {formatShort(b.item.amount)}
                                            </text>
                                        )}
                                        {showPct && (
                                            <text
                                                x={b.x}
                                                y={b.y + titleFontSize * 0.6 + amountFontSize + 2}
                                                textAnchor="middle"
                                                dominantBaseline="central"
                                                fill="rgba(255,255,255,0.6)"
                                                fontWeight="500"
                                                fontSize={Math.max(8, amountFontSize * 0.85)}
                                                style={{ pointerEvents: 'none' }}
                                            >
                                                {pct}%
                                            </text>
                                        )}
                                    </g>
                                );
                            })}
                        </svg>

                        {/* Custom Tooltip */}
                        {tooltip && packedBubbles[tooltip.idx] && (() => {
                            const b = packedBubbles[tooltip.idx];
                            const colors = BUBBLE_COLORS[b.colorIdx];
                            const pct = totalDebt > 0 ? ((b.item.amount / totalDebt) * 100).toFixed(1) : '0';
                            // Position tooltip — flip if near right/bottom edge
                            const containerW = chartRef.current?.offsetWidth || 600;
                            const flipX = tooltip.x > containerW * 0.65;
                            const flipY = tooltip.y > 280;
                            return (
                                <div
                                    className="absolute z-50 pointer-events-none"
                                    style={{
                                        left: flipX ? undefined : tooltip.x + 16,
                                        right: flipX ? (containerW - tooltip.x + 16) : undefined,
                                        top: flipY ? undefined : tooltip.y + 8,
                                        bottom: flipY ? 'auto' : undefined,
                                        ...(flipY ? { top: tooltip.y - 8, transform: 'translateY(-100%)' } : {}),
                                    }}
                                >
                                    <div
                                        className="rounded-xl shadow-2xl px-4 py-3 min-w-[220px] max-w-[280px]"
                                        style={{
                                            background: 'var(--color-surface)',
                                            border: `1.5px solid ${colors.fill}40`,
                                            backdropFilter: 'blur(16px)',
                                            boxShadow: `0 8px 32px rgba(0,0,0,0.25), 0 0 0 1px ${colors.fill}20`,
                                        }}
                                    >
                                        {/* Header */}
                                        <div className="flex items-center gap-2 mb-2 pb-2 border-b" style={{ borderColor: 'var(--color-border)' }}>
                                            <div className="w-3 h-3 rounded-full shrink-0" style={{ background: colors.fill }} />
                                            <span className="text-sm font-bold truncate">{b.item.title}</span>
                                        </div>

                                        {/* Amount */}
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs text-[var(--color-text-muted)]">Dư nợ</span>
                                            <span className="text-sm font-bold" style={{ color: '#ef4444' }}>
                                                {formatCurrency(b.item.amount)}
                                            </span>
                                        </div>

                                        {/* Details grid */}
                                        <div className="space-y-1.5">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[11px] text-[var(--color-text-muted)]">Lãi/tháng</span>
                                                <span className="text-xs font-semibold" style={{ color: '#f59e0b' }}>
                                                    {formatCurrency(b.item.monthlyInterest)}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-[11px] text-[var(--color-text-muted)]">Trả/tháng</span>
                                                <span className="text-xs font-semibold" style={{ color: '#6366f1' }}>
                                                    {formatCurrency(b.item.monthlyPayment)}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-[11px] text-[var(--color-text-muted)]">Tỷ trọng</span>
                                                <span className="text-xs font-semibold">{pct}%</span>
                                            </div>
                                        </div>

                                        {/* Footer badges */}
                                        <div className="flex items-center gap-1.5 flex-wrap mt-2 pt-2 border-t" style={{ borderColor: 'var(--color-border)' }}>
                                            <span
                                                className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                                                style={{ background: `${colors.fill}20`, color: colors.fill }}
                                            >
                                                {b.item.typeLoan}
                                            </span>
                                            <span
                                                className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                                                style={{
                                                    background: b.item.priority === 'ASAP' ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)',
                                                    color: b.item.priority === 'ASAP' ? '#ef4444' : '#f59e0b',
                                                }}
                                            >
                                                {b.item.priority}
                                            </span>
                                            {b.item.needClear && (
                                                <span
                                                    className="text-[10px] font-medium px-2 py-0.5 rounded-full flex items-center gap-0.5"
                                                    style={{ background: 'rgba(236,72,153,0.15)', color: '#ec4899' }}
                                                >
                                                    ⚡ Ưu tiên clear
                                                </span>
                                            )}
                                        </div>

                                        {/* Description */}
                                        {b.item.description && (
                                            <p className="text-[10px] text-[var(--color-text-muted)] mt-2 line-clamp-2 italic">
                                                {b.item.description}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            );
                        })()}

                        {/* Legend */}
                        <div className="flex flex-wrap gap-3 mt-3 justify-center">
                            {packedBubbles.map((b, idx) => {
                                const colors = BUBBLE_COLORS[b.colorIdx];
                                return (
                                    <div key={b.item.id} className="flex items-center gap-1.5">
                                        <div
                                            className="w-3 h-3 rounded-full"
                                            style={{ background: colors.fill }}
                                        />
                                        <span className="text-xs text-[var(--color-text-muted)]">
                                            {b.item.title.length > 16 ? b.item.title.slice(0, 14) + '…' : b.item.title}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>

                        <style>{`
                            @keyframes bubble-pop {
                                0% { transform-origin: center; r: 0; opacity: 0; }
                                60% { opacity: 1; }
                                100% { opacity: 1; }
                            }
                            .loan-bubble circle:first-of-type {
                                transition: opacity 0.2s ease;
                            }
                            .loan-bubble:hover circle:first-of-type {
                                opacity: 0.3 !important;
                            }
                            .loan-bubble:hover circle:nth-of-type(2) {
                                filter: brightness(1.15);
                            }
                        `}</style>
                    </div>
                </div>

                {/* Type breakdown */}
                <div className="glass-card p-4 sm:p-5 lg:col-span-2">
                    <h3 className="text-sm font-semibold text-[var(--color-text-secondary)] mb-3 uppercase tracking-wide">
                        Phân bổ theo loại nợ
                    </h3>
                    <div className="space-y-3">
                        {Object.entries(byType).map(([type, total]) => {
                            const percentage = totalDebt > 0 ? (total / totalDebt) * 100 : 0;
                            const colorMap: Record<string, string> = { 'Thế chấp': '#8b5cf6', 'Tín dụng': '#f59e0b', 'Trả góp': '#22c55e', 'Khác': '#6366f1' };
                            const color = colorMap[type] || '#6366f1';
                            const iconMap: Record<string, typeof Landmark> = { 'Thế chấp': Landmark, 'Tín dụng': CreditCard, 'Trả góp': ShoppingBag, 'Khác': CircleDot };
                            const Icon = iconMap[type] || CircleDot;
                            return (
                                <div key={type} className="flex items-center gap-3">
                                    <div className="p-1.5 rounded-lg" style={{ background: `${color}20` }}>
                                        <Icon className="w-4 h-4" style={{ color }} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-sm font-medium">{type}</span>
                                            <span className="text-sm font-semibold" style={{ color }}>
                                                {formatCurrency(total)}
                                            </span>
                                        </div>
                                        <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--color-surface-hover)' }}>
                                            <div
                                                className="h-full rounded-full transition-all duration-700"
                                                style={{
                                                    width: `${percentage}%`,
                                                    background: `linear-gradient(90deg, ${color} 0%, ${color}80 100%)`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <span className="text-xs text-[var(--color-text-muted)] min-w-[3rem] text-right">
                                        {percentage.toFixed(1)}%
                                    </span>
                                </div>
                            );
                        })}
                    </div>

                    {/* Quick insight */}
                    <div className="mt-5 pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-[var(--color-text-muted)]">Số khoản nợ</span>
                                <span className="font-semibold">{items.length}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-[var(--color-text-muted)]">Nợ trung bình</span>
                                <span className="font-semibold">{items.length > 0 ? formatCurrency(totalDebt / items.length) : '0 đ'}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-[var(--color-text-muted)]">Nợ lớn nhất</span>
                                <span className="font-semibold text-[var(--color-danger)]">
                                    {items.length > 0 ? formatCurrency(Math.max(...items.map(i => i.amount))) : '0 đ'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-[var(--color-text-muted)]">Nợ nhỏ nhất</span>
                                <span className="font-semibold text-[var(--color-success)]">
                                    {items.length > 0 ? formatCurrency(Math.min(...items.map(i => i.amount))) : '0 đ'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Loan Card (compact vertical layout for grid) ───────────────────────────
function LoanCard({
    item,
    onEdit,
    onDelete,
    onToggleNeedClear,
}: {
    item: LoanItem;
    onEdit: (item: LoanItem) => void;
    onDelete: (id: string) => Promise<void>;
    onToggleNeedClear: (id: string) => Promise<void>;
}) {
    const [deleting, setDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const getTypeStyle = (t: string) => {
        switch (t) {
            case 'Thế chấp': return { bg: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6', icon: Landmark };
            case 'Tín dụng': return { bg: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', icon: CreditCard };
            case 'Trả góp': return { bg: 'rgba(34, 197, 94, 0.15)', color: '#22c55e', icon: ShoppingBag };
            case 'Khác': return { bg: 'rgba(99, 102, 241, 0.15)', color: '#6366f1', icon: CircleDot };
            default: return { bg: 'rgba(99, 102, 241, 0.15)', color: '#6366f1', icon: CircleDot };
        }
    };

    const priorityColor = item.priority === 'ASAP' ? '#ef4444' : '#f59e0b';
    const typeStyle = getTypeStyle(item.typeLoan);
    const TypeIcon = typeStyle.icon;
    const borderColor = item.needClear ? '#ec4899' : typeStyle.color;

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await onDelete(item.id);
        } finally {
            setDeleting(false);
            setShowDeleteConfirm(false);
        }
    };

    return (
        <div
            className="glass-card overflow-hidden transition-all duration-300 hover-lift flex flex-col"
            style={{
                borderTop: `3px solid ${borderColor}`,
                opacity: deleting ? 0.5 : 1,
            }}
        >
            <div className="p-4 flex flex-col flex-1">
                {/* Amount - prominent */}
                <p className="text-xl font-bold text-[var(--color-danger)] mb-2">
                    {formatCurrency(item.amount)}
                </p>

                {/* Title */}
                <h3 className="text-sm font-bold mb-2 leading-tight line-clamp-2" title={item.title}>
                    {item.title}
                </h3>

                {/* Badges row */}
                <div className="flex items-center gap-1.5 flex-wrap mb-3">
                    <span
                        className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full"
                        style={{ background: typeStyle.bg, color: typeStyle.color }}
                    >
                        <TypeIcon className="w-3 h-3" />
                        {item.typeLoan}
                    </span>
                    <span
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                        style={{ background: `${priorityColor}20`, color: priorityColor }}
                    >
                        {item.priority}
                    </span>
                    {item.needClear && (
                        <span
                            className="inline-flex items-center gap-0.5 text-[10px] font-medium px-2 py-0.5 rounded-full"
                            style={{ background: 'rgba(236, 72, 153, 0.15)', color: '#ec4899' }}
                        >
                            <Target className="w-2.5 h-2.5" />
                            Ưu tiên
                        </span>
                    )}
                </div>

                {/* Monthly info */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="p-2 rounded-lg" style={{ background: 'var(--color-surface-hover)' }}>
                        <span className="text-[10px] text-[var(--color-text-muted)] block">Lãi/tháng</span>
                        <span className="text-xs font-semibold text-[var(--color-warning)]">
                            {formatCurrency(item.monthlyInterest)}
                        </span>
                    </div>
                    <div className="p-2 rounded-lg" style={{ background: 'var(--color-surface-hover)' }}>
                        <span className="text-[10px] text-[var(--color-text-muted)] block">Trả/tháng</span>
                        <span className="text-xs font-semibold text-[var(--color-primary)]">
                            {formatCurrency(item.monthlyPayment)}
                        </span>
                    </div>
                </div>

                {/* Clear target — show when needClear is on */}
                {item.needClear && item.clearAmount > 0 && (
                    <div
                        className="p-2 rounded-lg mb-3"
                        style={{ background: 'rgba(236, 72, 153, 0.08)', border: '1px solid rgba(236, 72, 153, 0.2)' }}
                    >
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] text-[#ec4899] font-medium flex items-center gap-1">
                                <Target className="w-2.5 h-2.5" />
                                Mục tiêu clear
                            </span>
                            <span className="text-[10px] font-semibold text-[#ec4899]">
                                {item.amount > 0 ? ((item.clearAmount / item.amount) * 100).toFixed(0) : 0}%
                            </span>
                        </div>
                        <span className="text-xs font-bold text-[#ec4899] block">
                            {formatCurrency(item.clearAmount)}
                        </span>
                        {/* Mini progress bar */}
                        <div className="h-1 rounded-full mt-1.5 overflow-hidden" style={{ background: 'rgba(236, 72, 153, 0.15)' }}>
                            <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{
                                    width: `${item.amount > 0 ? Math.min((item.clearAmount / item.amount) * 100, 100) : 0}%`,
                                    background: 'linear-gradient(90deg, #ec4899, #f43f5e)',
                                }}
                            />
                        </div>
                    </div>
                )}

                {/* Description preview */}
                {item.description && (
                    <p className="text-[11px] text-[var(--color-text-muted)] mb-3 line-clamp-2" title={item.description}>
                        {item.description}
                    </p>
                )}

                {/* Spacer to push actions to bottom */}
                <div className="flex-1" />

                {/* Actions row */}
                <div className="flex items-center gap-1 pt-2 border-t" style={{ borderColor: 'var(--color-border)' }}>
                    {/* NeedClear toggle */}
                    <button
                        onClick={() => onToggleNeedClear(item.id)}
                        className="flex items-center gap-1.5 p-1.5 rounded-lg text-[10px] font-medium transition-all"
                        style={{
                            background: item.needClear ? 'rgba(236, 72, 153, 0.1)' : 'transparent',
                            color: item.needClear ? '#ec4899' : 'var(--color-text-muted)',
                        }}
                        title={item.needClear ? 'Bỏ ưu tiên' : 'Đánh dấu ưu tiên clear'}
                    >
                        <div
                            className="w-3.5 h-3.5 rounded flex items-center justify-center transition-all"
                            style={{
                                background: item.needClear ? '#ec4899' : 'transparent',
                                border: `1.5px solid ${item.needClear ? '#ec4899' : 'var(--color-border)'}`,
                            }}
                        >
                            {item.needClear && (
                                <svg width="8" height="8" viewBox="0 0 12 12" fill="none">
                                    <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            )}
                        </div>
                        <span>Clear</span>
                    </button>

                    <div className="flex-1" />

                    {/* Edit */}
                    <button
                        onClick={() => onEdit(item)}
                        className="p-1.5 rounded-lg hover:bg-[var(--color-surface-hover)] text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors"
                        title="Chỉnh sửa"
                    >
                        <Pencil className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete */}
                    {showDeleteConfirm ? (
                        <div className="flex items-center gap-1">
                            <button
                                onClick={handleDelete}
                                disabled={deleting}
                                className="text-[10px] px-1.5 py-0.5 rounded font-medium text-white transition-colors"
                                style={{ background: 'var(--color-danger)' }}
                            >
                                Xoá
                            </button>
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="text-[10px] px-1.5 py-0.5 rounded font-medium text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)]"
                            >
                                Huỷ
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setShowDeleteConfirm(true)}
                            className="p-1.5 rounded-lg hover:bg-[var(--color-danger-bg)] text-[var(--color-text-muted)] hover:text-[var(--color-danger)] transition-colors"
                            title="Xoá"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── Main Dashboard ──────────────────────────────────────────────────────────
export function LoanDashboard({ items, onEdit, onDelete, onToggleNeedClear }: LoanDashboardProps) {
    const [filter, setFilter] = useState<'all' | 'needClear'>('all');
    const [typeFilter, setTypeFilter] = useState<string>('all');

    const filteredItems = items.filter(item => {
        if (filter === 'needClear' && !item.needClear) return false;
        if (typeFilter !== 'all' && item.typeLoan !== typeFilter) return false;
        return true;
    });

    const uniqueTypes = [...new Set(items.map(i => i.typeLoan))];

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Stats */}
            <LoanStats items={items} />

            {/* Filters */}
            <div className="flex items-center gap-2 flex-wrap">
                <button
                    onClick={() => setFilter('all')}
                    className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                    style={{
                        background: filter === 'all' ? 'var(--gradient-primary)' : 'var(--color-surface-hover)',
                        color: filter === 'all' ? '#fff' : 'var(--color-text-secondary)',
                        border: `1px solid ${filter === 'all' ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    }}
                >
                    Tất cả ({items.length})
                </button>
                <button
                    onClick={() => setFilter('needClear')}
                    className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5"
                    style={{
                        background: filter === 'needClear' ? 'linear-gradient(135deg, #ec4899, #f43f5e)' : 'var(--color-surface-hover)',
                        color: filter === 'needClear' ? '#fff' : 'var(--color-text-secondary)',
                        border: `1px solid ${filter === 'needClear' ? '#ec4899' : 'var(--color-border)'}`,
                    }}
                >
                    <Target className="w-3.5 h-3.5" />
                    Ưu tiên ({items.filter(i => i.needClear).length})
                </button>

                <div className="h-5 w-px bg-[var(--color-border)] mx-1 hidden sm:block" />

                {uniqueTypes.map(type => {
                    const colorMap: Record<string, string> = { 'Thế chấp': '#8b5cf6', 'Tín dụng': '#f59e0b', 'Trả góp': '#22c55e', 'Khác': '#6366f1' };
                    const color = colorMap[type] || '#6366f1';
                    return (
                        <button
                            key={type}
                            onClick={() => setTypeFilter(typeFilter === type ? 'all' : type)}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                            style={{
                                background: typeFilter === type ? color : 'var(--color-surface-hover)',
                                color: typeFilter === type ? '#fff' : 'var(--color-text-secondary)',
                                border: `1px solid ${typeFilter === type ? color : 'var(--color-border)'}`,
                            }}
                        >
                            {type}
                        </button>
                    );
                })}
            </div>

            {/* Loan grid */}
            {filteredItems.length === 0 ? (
                <div className="glass-card p-8 text-center">
                    <p className="text-[var(--color-text-muted)]">
                        {filter === 'needClear'
                            ? 'Chưa có khoản nợ nào được đánh dấu ưu tiên clear'
                            : 'Chưa có khoản nợ nào'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                    {filteredItems.map(item => (
                        <LoanCard
                            key={item.id}
                            item={item}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            onToggleNeedClear={onToggleNeedClear}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

