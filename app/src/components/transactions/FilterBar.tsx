'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { TransactionFilter } from '@/types/transaction';

interface FilterBarProps {
    onFilterChange: (filters: TransactionFilter) => void;
}

export function FilterBar({ onFilterChange }: FilterBarProps) {
    const [filters, setFilters] = useState<TransactionFilter>({
        type: 'all',
        searchQuery: '',
    });
    const [isExpanded, setIsExpanded] = useState(false);
    const [categories, setCategories] = useState<string[]>([]);

    useEffect(() => {
        fetch('/api/categories')
            .then(res => res.json())
            .then((data) => {
                if (Array.isArray(data)) {
                    setCategories(data.map((c: { name: string }) => c.name).sort((a: string, b: string) => a.localeCompare(b, 'vi')));
                }
            })
            .catch(err => console.error('Failed to fetch categories:', err));
    }, []);

    const handleChange = (key: keyof TransactionFilter, value: string | Date | undefined) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    const hasActiveFilters =
        filters.type !== 'all' ||
        filters.category ||
        filters.searchQuery;

    const activeFilterCount = [
        filters.type !== 'all',
        !!filters.category,
        !!filters.searchQuery
    ].filter(Boolean).length;

    return (
        <div className="glass-card overflow-hidden">
            {/* Compact header - always visible */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full p-3 flex items-center justify-between hover:bg-[var(--color-surface-hover)] transition-colors"
            >
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-[var(--color-text-muted)]" />
                    <span className="text-sm font-medium">Bộ lọc</span>
                    {activeFilterCount > 0 && (
                        <span className="px-2 py-0.5 text-xs bg-[var(--color-primary)] text-white rounded-full">
                            {activeFilterCount}
                        </span>
                    )}
                </div>
                {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-[var(--color-text-muted)]" />
                ) : (
                    <ChevronDown className="w-4 h-4 text-[var(--color-text-muted)]" />
                )}
            </button>

            {/* Expandable filter content */}
            {isExpanded && (
                <div className="p-3 pt-0 space-y-3 border-t border-[var(--color-border)]">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm giao dịch..."
                            value={filters.searchQuery || ''}
                            onChange={(e) => handleChange('searchQuery', e.target.value)}
                            className="input pl-10 w-full"
                        />
                    </div>

                    {/* Type & Category in row */}
                    <div className="flex gap-2">
                        <select
                            value={filters.type || 'all'}
                            onChange={(e) => handleChange('type', e.target.value as 'all' | 'income' | 'expense')}
                            className="input flex-1"
                        >
                            <option value="all">Tất cả</option>
                            <option value="income">Thu nhập</option>
                            <option value="expense">Chi tiêu</option>
                        </select>

                        <select
                            value={filters.category || ''}
                            onChange={(e) => handleChange('category', e.target.value || undefined)}
                            className="input flex-1"
                        >
                            <option value="">Tất cả danh mục</option>
                            {categories.map((cat) => (
                                <option key={cat} value={cat}>
                                    {cat}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Clear button */}
                    {hasActiveFilters && (
                        <button
                            onClick={() => {
                                const cleared: TransactionFilter = { type: 'all', searchQuery: '' };
                                setFilters(cleared);
                                onFilterChange(cleared);
                            }}
                            className="text-xs text-[var(--color-primary)] hover:underline"
                        >
                            Xóa bộ lọc
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
