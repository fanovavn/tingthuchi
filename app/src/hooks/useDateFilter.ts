'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { startOfMonth, endOfMonth } from 'date-fns';

const DATE_FILTER_KEY = 'crm-date-filter';

interface DateRange {
    start: Date;
    end: Date;
}

interface UseDateFilterOptions {
    dataDateRange?: { min: Date; max: Date };
}

function getDefaultDateRange(): DateRange {
    const now = new Date();
    return { start: startOfMonth(now), end: endOfMonth(now) };
}

function loadSavedDateRange(): DateRange | null {
    if (typeof window === 'undefined') return null;

    try {
        const saved = sessionStorage.getItem(DATE_FILTER_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            const start = new Date(parsed.start);
            const end = new Date(parsed.end);
            // Validate dates
            if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
                return { start, end };
            }
        }
    } catch {
        // Invalid data, ignore
    }
    return null;
}

function saveDateRange(range: DateRange): void {
    if (typeof window === 'undefined') return;

    sessionStorage.setItem(DATE_FILTER_KEY, JSON.stringify({
        start: range.start.toISOString(),
        end: range.end.toISOString(),
    }));
}

export function useDateFilter(options?: UseDateFilterOptions) {
    const [dateRange, setDateRangeState] = useState<DateRange>(getDefaultDateRange);
    const hasInitializedRef = useRef(false);
    const hasAutoSetRef = useRef(false);

    // Load from sessionStorage on mount (client-side only)
    useEffect(() => {
        if (hasInitializedRef.current) return;
        hasInitializedRef.current = true;

        const saved = loadSavedDateRange();
        if (saved) {
            setDateRangeState(saved);
            hasAutoSetRef.current = true; // Don't auto-set if we have saved data
        }
    }, []);

    // Auto-set to latest month with data only if no saved filter exists
    useEffect(() => {
        if (hasAutoSetRef.current) return;
        if (!options?.dataDateRange) return;

        // Only auto-set once
        hasAutoSetRef.current = true;

        const newRange = {
            start: startOfMonth(options.dataDateRange.max),
            end: endOfMonth(options.dataDateRange.max),
        };
        setDateRangeState(newRange);
        saveDateRange(newRange);
    }, [options?.dataDateRange]);

    // Custom setter that also saves to sessionStorage
    const setDateRange = useCallback((newRange: DateRange | ((prev: DateRange) => DateRange)) => {
        setDateRangeState((prev) => {
            const resolvedRange = typeof newRange === 'function' ? newRange(prev) : newRange;
            saveDateRange(resolvedRange);
            return resolvedRange;
        });
    }, []);

    return {
        dateRange,
        setDateRange,
    };
}
