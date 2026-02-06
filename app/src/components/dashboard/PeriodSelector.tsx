'use client';

import { useState } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';

type Period = 'day' | 'week' | 'month' | 'year';

interface PeriodSelectorProps {
    value: Period;
    onChange: (period: Period) => void;
}

const PERIODS: { value: Period; label: string }[] = [
    { value: 'day', label: 'Ngày' },
    { value: 'week', label: 'Tuần' },
    { value: 'month', label: 'Tháng' },
    { value: 'year', label: 'Năm' },
];

export function PeriodSelector({ value, onChange }: PeriodSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);

    const selectedPeriod = PERIODS.find((p) => p.value === value);

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="btn btn-secondary flex items-center gap-2 min-w-[140px]"
            >
                <Calendar className="w-4 h-4" />
                <span>{selectedPeriod?.label}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute top-full left-0 mt-2 z-20 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg shadow-lg overflow-hidden min-w-[140px]">
                        {PERIODS.map((period) => (
                            <button
                                key={period.value}
                                onClick={() => {
                                    onChange(period.value);
                                    setIsOpen(false);
                                }}
                                className={`w-full px-4 py-2 text-left text-sm transition-colors ${period.value === value
                                        ? 'bg-[var(--color-primary)] text-white'
                                        : 'hover:bg-[var(--color-surface-hover)]'
                                    }`}
                            >
                                {period.label}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
