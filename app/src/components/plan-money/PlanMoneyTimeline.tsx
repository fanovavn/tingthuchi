'use client';

import { useRef, useEffect, useCallback } from 'react';
import {
    TrendingUp,
    TrendingDown,
    ArrowUpCircle,
    ArrowDownCircle,
    Calendar,
    Trash2,
    User,
    Plus,
    Check,
    RotateCcw,
} from 'lucide-react';
import { PlanMoneyItem, Assignee } from '@/types/plan-money';

interface PlanMoneyTimelineProps {
    items: PlanMoneyItem[];
    onDelete: (id: string) => void;
    onEdit: (item: PlanMoneyItem) => void;
    onAddToDay: (day: number) => void;
    onToggleCheck: (id: string) => void;
    onClearAllChecks: () => void;
}

function formatCurrency(amount: number): string {
    return amount.toLocaleString('vi-VN') + ' đ';
}

function shortAmount(amount: number): string {
    if (amount >= 1000000) return (amount / 1000000).toFixed(1) + 'M';
    if (amount >= 1000) return (amount / 1000).toFixed(0) + 'K';
    return amount.toString();
}

const personColors: Record<Assignee, { bg: string; text: string; border: string }> = {
    'Tý': { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-400/30' },
    'Mèo': { bg: 'bg-pink-500/10', text: 'text-pink-400', border: 'border-pink-400/30' },
};

export function PlanMoneyTimeline({ items, onDelete, onEdit, onAddToDay, onToggleCheck, onClearAllChecks }: PlanMoneyTimelineProps) {
    const currentDay = new Date().getDate();
    const dotsBarRef = useRef<HTMLDivElement>(null);
    const cardRefs = useRef<Map<number, HTMLDivElement>>(new Map());
    const dotRefs = useRef<Map<number, HTMLDivElement>>(new Map());

    const setCardRef = useCallback((day: number, el: HTMLDivElement | null) => {
        if (el) cardRefs.current.set(day, el);
        else cardRefs.current.delete(day);
    }, []);

    const setDotRef = useCallback((day: number, el: HTMLDivElement | null) => {
        if (el) dotRefs.current.set(day, el);
        else dotRefs.current.delete(day);
    }, []);

    const scrollToDay = useCallback((day: number) => {
        const card = cardRefs.current.get(day);
        if (card) {
            card.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
            card.style.boxShadow = '0 0 0 3px var(--color-primary)';
            setTimeout(() => { card.style.boxShadow = ''; }, 1200);
        }
        const dotsContainer = dotsBarRef.current;
        const dot = dotRefs.current.get(day);
        if (dotsContainer && dot) {
            const scrollLeft = dot.offsetLeft - dotsContainer.offsetWidth / 2 + dot.offsetWidth / 2;
            dotsContainer.scrollTo({ left: Math.max(0, scrollLeft), behavior: 'smooth' });
        }
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => scrollToDay(currentDay), 200);
        return () => clearTimeout(timer);
    }, [currentDay, scrollToDay]);

    // Calculations
    const totalIncome = items.filter(i => i.type === 'income').reduce((s, i) => s + i.amount, 0);
    const totalExpense = items.filter(i => i.type === 'expense').reduce((s, i) => s + i.amount, 0);

    // Group items by day
    const dayMap = new Map<number, PlanMoneyItem[]>();
    items.forEach(item => {
        const existing = dayMap.get(item.dayNumber) || [];
        existing.push(item);
        dayMap.set(item.dayNumber, existing);
    });

    const getDayTotals = (day: number) => {
        const dayItems = dayMap.get(day);
        if (!dayItems) return null;
        const inc = dayItems.filter(i => i.type === 'income').reduce((s, i) => s + i.amount, 0);
        const exp = dayItems.filter(i => i.type === 'expense').reduce((s, i) => s + i.amount, 0);
        return { income: inc, expense: exp };
    };

    const days = Array.from({ length: 31 }, (_, i) => i + 1);

    const checkedCount = items.filter(i => i.checked).length;

    const handleToggleCheck = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        onToggleCheck(id);
    };

    const handleDelete = (id: string) => {
        if (confirm('Bạn có chắc muốn xóa hạng mục này?')) {
            onDelete(id);
        }
    };

    const renderDayCard = (day: number) => {
        const isToday = day === currentDay;
        const isPast = day < currentDay;
        const hasItems = dayMap.has(day);
        const dayItems = dayMap.get(day) || [];

        return (
            <div
                key={day}
                ref={(el) => setCardRef(day, el)}
                className="rounded-xl border flex flex-col transition-all"
                style={{
                    minHeight: '200px',
                    background: isToday
                        ? 'rgba(99, 102, 241, 0.08)'
                        : isPast
                            ? 'var(--color-surface-hover)'
                            : hasItems
                                ? 'rgba(249, 115, 22, 0.05)'
                                : 'var(--color-surface)',
                    borderColor: isToday
                        ? 'var(--color-primary)'
                        : isPast
                            ? 'var(--color-border)'
                            : hasItems
                                ? 'rgba(249, 115, 22, 0.3)'
                                : 'var(--color-border)',
                }}
            >
                {/* Card header */}
                <div
                    className="flex flex-col items-center py-3 border-b"
                    style={{
                        borderColor: isToday ? 'rgba(99,102,241,0.2)' : 'var(--color-border)',
                    }}
                >
                    <div
                        className="w-9 h-9 rounded-full flex items-center justify-center transition-all"
                        style={{
                            fontSize: '13px',
                            fontWeight: 600,
                            background: isToday
                                ? 'var(--color-primary)'
                                : isPast
                                    ? 'var(--color-text-muted)'
                                    : hasItems
                                        ? '#f97316'
                                        : 'var(--color-surface-hover)',
                            color: isToday || isPast || hasItems ? 'white' : 'var(--color-text-muted)',
                            boxShadow: isToday ? '0 0 0 3px rgba(99,102,241,0.2)' : 'none',
                        }}
                    >
                        {day}
                    </div>
                    <span
                        className="mt-1"
                        style={{
                            fontSize: '10px',
                            fontWeight: isToday ? 600 : 400,
                            color: isToday
                                ? 'var(--color-primary)'
                                : isPast
                                    ? 'var(--color-text-muted)'
                                    : 'var(--color-text-secondary)',
                        }}
                    >
                        {isToday ? 'Hôm nay' : `Ngày ${day}`}
                    </span>
                    <button
                        onClick={() => onAddToDay(day)}
                        className="w-6 h-6 rounded-full flex items-center justify-center mt-1 transition-all hover:scale-110"
                        style={{
                            background: 'var(--color-primary)',
                            color: 'white',
                            opacity: 0.7,
                        }}
                        onMouseEnter={(e) => { (e.target as HTMLElement).style.opacity = '1'; }}
                        onMouseLeave={(e) => { (e.target as HTMLElement).style.opacity = '0.7'; }}
                        title={`Thêm vào ngày ${day}`}
                    >
                        <Plus className="w-3.5 h-3.5" />
                    </button>
                </div>

                {/* Items */}
                {hasItems && (
                    <div className="flex-1 p-2 flex flex-col gap-2">
                        {dayItems.map((item) => {
                            const pc = personColors[item.assignee];
                            const isChecked = !!item.checked;
                            return (
                                <div
                                    key={item.id}
                                    className="group rounded-lg p-2.5 border transition-all hover:shadow-sm cursor-pointer"
                                    style={{
                                        borderColor: isChecked ? 'var(--color-success)' : 'var(--color-border)',
                                        background: isChecked ? 'rgba(34,197,94,0.05)' : 'var(--color-surface)',
                                        opacity: isChecked ? 0.7 : 1,
                                    }}
                                    onClick={() => onEdit(item)}
                                >
                                    <div className="flex items-start gap-1.5 mb-1">
                                        {/* Check / Type icon */}
                                        <button
                                            onClick={(e) => handleToggleCheck(item.id, e)}
                                            className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 transition-all"
                                            style={{
                                                background: isChecked
                                                    ? 'var(--color-success)'
                                                    : item.type === 'income'
                                                        ? 'var(--color-success-bg)'
                                                        : 'var(--color-danger-bg)',
                                            }}
                                            title={isChecked ? 'Bỏ đánh dấu' : 'Đánh dấu đã xử lý'}
                                        >
                                            {isChecked ? (
                                                <Check className="w-3 h-3" style={{ color: 'white' }} />
                                            ) : (
                                                <>
                                                    {/* Default: type icon, hover: check icon */}
                                                    <span className="group-hover:hidden">
                                                        {item.type === 'income' ? (
                                                            <ArrowDownCircle className="w-3 h-3" style={{ color: 'var(--color-success)' }} />
                                                        ) : (
                                                            <ArrowUpCircle className="w-3 h-3" style={{ color: 'var(--color-danger)' }} />
                                                        )}
                                                    </span>
                                                    <span className="hidden group-hover:block">
                                                        <Check className="w-3 h-3" style={{ color: 'var(--color-success)' }} />
                                                    </span>
                                                </>
                                            )}
                                        </button>
                                        <div className="min-w-0 flex-1">
                                            <div
                                                style={{
                                                    fontSize: '12px',
                                                    fontWeight: 500,
                                                    lineHeight: 1.3,
                                                    color: isPast || isChecked
                                                        ? 'var(--color-text-muted)'
                                                        : 'var(--color-text-primary)',
                                                    textDecoration: isChecked ? 'line-through' : 'none',
                                                }}
                                            >
                                                {item.note}
                                            </div>
                                            <div style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>
                                                {item.type === 'income' ? 'Thu nhập' : 'Chi tiêu'}
                                            </div>
                                        </div>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                                            className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 hover:text-[var(--color-danger)]"
                                            style={{ color: 'var(--color-text-muted)' }}
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    </div>
                                    {/* Person badge + amount */}
                                    <div className="flex items-center justify-between mt-1">
                                        <span
                                            className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full border ${pc.bg} ${pc.text} ${pc.border}`}
                                            style={{ fontSize: '9px', fontWeight: 500 }}
                                        >
                                            <User className="w-2.5 h-2.5" />
                                            {item.assignee}
                                        </span>
                                        <span
                                            style={{
                                                fontSize: '11px',
                                                fontWeight: 600,
                                                color: item.type === 'income'
                                                    ? (isPast ? 'var(--color-text-muted)' : 'var(--color-success)')
                                                    : (isPast ? 'var(--color-text-muted)' : 'var(--color-danger)'),
                                            }}
                                        >
                                            {item.type === 'income' ? '+' : '-'}
                                            {formatCurrency(item.amount)}
                                        </span>
                                    </div>
                                    {/* Description */}
                                    {item.description && (
                                        <div
                                            style={{
                                                fontSize: '10px',
                                                fontStyle: 'italic',
                                                color: 'var(--color-text-muted)',
                                                marginTop: '4px',
                                                lineHeight: 1.3,
                                            }}
                                        >
                                            {item.description}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div className="stat-card income">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-[var(--color-text-secondary)]">Tổng Thu Dự Kiến</span>
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--color-success-bg)' }}>
                            <TrendingUp className="w-4 h-4" style={{ color: 'var(--color-success)' }} />
                        </div>
                    </div>
                    <div className="text-xl sm:text-2xl font-semibold" style={{ color: 'var(--color-success)' }}>
                        {formatCurrency(totalIncome)}
                    </div>
                    <span className="text-xs text-[var(--color-text-muted)]">
                        {items.filter(i => i.type === 'income').length} khoản thu
                    </span>
                </div>

                <div className="stat-card expense">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-[var(--color-text-secondary)]">Tổng Chi Dự Kiến</span>
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--color-danger-bg)' }}>
                            <TrendingDown className="w-4 h-4" style={{ color: 'var(--color-danger)' }} />
                        </div>
                    </div>
                    <div className="text-xl sm:text-2xl font-semibold" style={{ color: 'var(--color-danger)' }}>
                        {formatCurrency(totalExpense)}
                    </div>
                    <span className="text-xs text-[var(--color-text-muted)]">
                        {items.filter(i => i.type === 'expense').length} khoản chi
                    </span>
                    <div className="flex gap-3 text-xs mt-1">
                        <span style={{ color: 'var(--color-success)' }}>
                            ✓ {formatCurrency(items.filter(i => i.type === 'expense' && i.checked).reduce((s, i) => s + i.amount, 0))}
                        </span>
                        <span style={{ color: 'var(--color-danger)' }}>
                            còn {formatCurrency(items.filter(i => i.type === 'expense' && !i.checked).reduce((s, i) => s + i.amount, 0))}
                        </span>
                    </div>
                </div>

                <div className="stat-card balance">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-[var(--color-text-secondary)]">Chênh Lệch</span>
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.1)' }}>
                            <Calendar className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
                        </div>
                    </div>
                    <div
                        className="text-xl sm:text-2xl font-semibold"
                        style={{ color: totalIncome - totalExpense >= 0 ? 'var(--color-primary)' : 'var(--color-danger)' }}
                    >
                        {totalIncome - totalExpense >= 0 ? '+' : ''}
                        {formatCurrency(totalIncome - totalExpense)}
                    </div>
                    <span className="text-xs text-[var(--color-text-muted)]">Dư/thiếu cuối tháng</span>
                </div>
            </div>

            {/* Person Summary */}
            <div className="glass-card flex flex-wrap items-center gap-4 px-4 sm:px-5 py-3">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-blue-500/10 rounded-full flex items-center justify-center">
                        <User className="w-3.5 h-3.5 text-blue-400" />
                    </div>
                    <span className="text-sm text-[var(--color-text-secondary)]">Tý cần xử lý</span>
                    <span className="text-sm sm:text-base font-semibold text-blue-400">
                        {formatCurrency(items.filter(i => i.assignee === 'Tý' && i.type === 'expense').reduce((s, i) => s + i.amount, 0))}
                    </span>
                </div>
                <div className="w-px h-6 bg-[var(--color-border)] hidden sm:block" />
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-pink-500/10 rounded-full flex items-center justify-center">
                        <User className="w-3.5 h-3.5 text-pink-400" />
                    </div>
                    <span className="text-sm text-[var(--color-text-secondary)]">Mèo cần xử lý</span>
                    <span className="text-sm sm:text-base font-semibold text-pink-400">
                        {formatCurrency(items.filter(i => i.assignee === 'Mèo' && i.type === 'expense').reduce((s, i) => s + i.amount, 0))}
                    </span>
                </div>
            </div>

            {/* Timeline Section */}
            <div className="glass-card p-4 sm:p-5">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base sm:text-lg font-semibold">Timeline 31 ngày</h3>
                    {checkedCount > 0 && (
                        <button
                            onClick={onClearAllChecks}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:bg-[var(--color-surface-hover)]"
                            style={{ color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)' }}
                        >
                            <RotateCcw className="w-3.5 h-3.5" />
                            Clear tất cả
                            <span
                                className="ml-1 px-1.5 py-0.5 rounded-full text-white"
                                style={{ fontSize: '10px', background: 'var(--color-success)' }}
                            >
                                {checkedCount}
                            </span>
                        </button>
                    )}
                </div>

                {/* Dots bar */}
                <div
                    ref={dotsBarRef}
                    className="flex gap-1 mb-5 overflow-x-auto pb-2"
                    style={{ scrollbarWidth: 'none' }}
                >
                    {days.map((day) => {
                        const isToday = day === currentDay;
                        const isPast = day < currentDay;
                        const hasItems = dayMap.has(day);
                        const totals = getDayTotals(day);
                        return (
                            <div
                                key={day}
                                ref={(el) => setDotRef(day, el)}
                                className="flex flex-col items-center shrink-0 cursor-pointer"
                                style={{ minWidth: '36px' }}
                                onClick={() => scrollToDay(day)}
                            >
                                <div
                                    className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
                                    style={{
                                        fontSize: '11px',
                                        fontWeight: isToday ? 700 : 500,
                                        background: isToday
                                            ? 'var(--color-primary)'
                                            : hasItems && isPast
                                                ? 'var(--color-text-muted)'
                                                : hasItems
                                                    ? '#f97316'
                                                    : isPast
                                                        ? 'var(--color-surface-hover)'
                                                        : 'var(--color-surface-hover)',
                                        color: isToday || (hasItems && isPast) || hasItems
                                            ? 'white'
                                            : 'var(--color-text-muted)',
                                        boxShadow: isToday ? '0 0 0 3px rgba(99,102,241,0.2)' : 'none',
                                    }}
                                >
                                    {day}
                                </div>
                                {totals && (
                                    <div className="flex flex-col items-center mt-0.5">
                                        {totals.income > 0 && (
                                            <span style={{ fontSize: '8px', fontWeight: 600, lineHeight: 1.2, color: 'var(--color-success)' }}>
                                                +{shortAmount(totals.income)}
                                            </span>
                                        )}
                                        {totals.expense > 0 && (
                                            <span style={{ fontSize: '8px', fontWeight: 600, lineHeight: 1.2, color: 'var(--color-danger)' }}>
                                                -{shortAmount(totals.expense)}
                                            </span>
                                        )}
                                    </div>
                                )}
                                {!totals && <div style={{ height: '12px' }} />}
                            </div>
                        );
                    })}
                </div>

                {/* Grid layout */}
                <div
                    className="grid gap-3"
                    style={{
                        gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                    }}
                >
                    {days.map((day) => renderDayCard(day))}
                </div>
            </div>

            {/* Expense Mini Bar Chart */}
            {(() => {
                const expenseByDay = new Map<number, number>();
                items.filter(i => i.type === 'expense').forEach(i => {
                    expenseByDay.set(i.dayNumber, (expenseByDay.get(i.dayNumber) || 0) + i.amount);
                });
                const maxExpense = Math.max(...Array.from(expenseByDay.values()), 1);
                const today = new Date().getDate();

                return (
                    <div className="glass-card p-4 sm:p-5">
                        <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-text-secondary)' }}>
                            Mức chi tiêu theo ngày
                        </h3>
                        <div className="flex items-end gap-[3px]" style={{ height: '120px' }}>
                            {days.map(day => {
                                const amount = expenseByDay.get(day) || 0;
                                const pct = amount > 0 ? Math.max((amount / maxExpense) * 100, 8) : 0;
                                const isToday = day === today;
                                const isPast = day < today;

                                return (
                                    <div
                                        key={day}
                                        className="flex-1 flex flex-col items-center justify-end h-full"
                                    >
                                        {/* Amount label */}
                                        {amount > 0 && (
                                            <span
                                                className="mb-1"
                                                style={{
                                                    fontSize: '8px',
                                                    fontWeight: 600,
                                                    color: isToday
                                                        ? 'var(--color-primary)'
                                                        : isPast
                                                            ? 'var(--color-text-muted)'
                                                            : 'var(--color-danger)',
                                                    writingMode: amount >= 1000000 ? 'vertical-rl' : undefined,
                                                    textOrientation: amount >= 1000000 ? 'mixed' : undefined,
                                                }}
                                            >
                                                {shortAmount(amount)}
                                            </span>
                                        )}
                                        {/* Bar */}
                                        <div
                                            className="w-full rounded-t transition-all"
                                            style={{
                                                height: amount > 0 ? `${pct}%` : '0%',
                                                minHeight: amount > 0 ? '4px' : '0',
                                                background: isToday
                                                    ? 'var(--color-primary)'
                                                    : isPast
                                                        ? 'var(--color-text-muted)'
                                                        : amount > 0
                                                            ? 'linear-gradient(to top, #f97316, #ef4444)'
                                                            : 'transparent',
                                                opacity: isPast ? 0.4 : 0.85,
                                            }}
                                        />
                                        {/* Day label */}
                                        <span
                                            className="mt-1"
                                            style={{
                                                fontSize: '8px',
                                                color: isToday ? 'var(--color-primary)' : 'var(--color-text-muted)',
                                                fontWeight: isToday ? 700 : 400,
                                            }}
                                        >
                                            {day}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            })()}
        </div>
    );
}
