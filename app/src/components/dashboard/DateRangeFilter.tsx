'use client';

import { useState, useEffect } from 'react';
import { Calendar, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfMonth, endOfMonth, subMonths, addMonths } from 'date-fns';
import { vi } from 'date-fns/locale';

interface DateRangeFilterProps {
    startDate: Date;
    endDate: Date;
    onChange: (start: Date, end: Date) => void;
    dataDateRange?: { min: Date; max: Date };
}

export function DateRangeFilter({ startDate, endDate, onChange, dataDateRange }: DateRangeFilterProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [viewMonth, setViewMonth] = useState(startDate);

    // Update viewMonth when startDate changes externally
    useEffect(() => {
        setViewMonth(startDate);
    }, [startDate]);

    const handleQuickSelect = (type: 'this' | 'last' | 'prev' | 'next') => {
        let newDate: Date;

        switch (type) {
            case 'this':
                newDate = new Date();
                break;
            case 'last':
                newDate = subMonths(new Date(), 1);
                break;
            case 'prev':
                newDate = subMonths(viewMonth, 1);
                break;
            case 'next':
                newDate = addMonths(viewMonth, 1);
                break;
            default:
                newDate = new Date();
        }

        setViewMonth(newDate);
        onChange(startOfMonth(newDate), endOfMonth(newDate));

        if (type === 'this' || type === 'last') {
            setIsOpen(false);
        }
    };

    const formatDisplay = () => {
        return format(startDate, 'MM/yyyy', { locale: vi });
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="btn btn-secondary flex items-center gap-2"
            >
                <Calendar className="w-4 h-4" />
                <span>{formatDisplay()}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                    <div className="fixed left-4 right-4 top-[120px] z-50 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg shadow-lg overflow-hidden sm:absolute sm:left-0 sm:right-auto sm:top-full sm:mt-2 sm:w-[280px]">
                        {/* Quick select buttons */}
                        <div className="p-2 border-b border-[var(--color-border)] flex gap-2">
                            <button
                                onClick={() => handleQuickSelect('this')}
                                className="flex-1 px-3 py-2 text-sm rounded-md bg-[var(--color-surface-hover)] hover:bg-[var(--color-primary)] hover:text-white transition-colors"
                            >
                                Tháng này
                            </button>
                            <button
                                onClick={() => handleQuickSelect('last')}
                                className="flex-1 px-3 py-2 text-sm rounded-md bg-[var(--color-surface-hover)] hover:bg-[var(--color-primary)] hover:text-white transition-colors"
                            >
                                Tháng trước
                            </button>
                        </div>

                        {/* Month navigation */}
                        <div className="p-3">
                            <div className="flex items-center justify-between mb-2">
                                <button
                                    onClick={() => handleQuickSelect('prev')}
                                    className="p-2 hover:bg-[var(--color-surface-hover)] rounded-lg"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <span className="font-medium">
                                    {format(viewMonth, 'MMMM yyyy', { locale: vi })}
                                </span>
                                <button
                                    onClick={() => handleQuickSelect('next')}
                                    className="p-2 hover:bg-[var(--color-surface-hover)] rounded-lg"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Current selection display */}
                            <div className="text-center text-sm text-[var(--color-text-muted)] py-2 bg-[var(--color-surface-hover)] rounded-lg">
                                {format(startDate, 'dd/MM')} - {format(endDate, 'dd/MM/yyyy')}
                            </div>
                        </div>

                        {/* Data range hint */}
                        {dataDateRange && (
                            <div className="px-3 py-2 bg-[var(--color-surface-hover)] text-xs text-[var(--color-text-muted)] border-t border-[var(--color-border)]">
                                Dữ liệu: {format(dataDateRange.min, 'MM/yyyy')} - {format(dataDateRange.max, 'MM/yyyy')}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
