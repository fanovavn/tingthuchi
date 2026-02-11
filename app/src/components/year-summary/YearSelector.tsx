import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMemo } from "react";

interface YearSelectorProps {
    years: number[];
    selectedYear: number;
    onChange: (year: number) => void;
}

export function YearSelector({ years, selectedYear, onChange }: YearSelectorProps) {
    const sortedYears = useMemo(() => [...years].sort((a, b) => b - a), [years]);

    return (
        <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-500">Năm:</span>
            <Select value={selectedYear.toString()} onValueChange={(v) => onChange(Number(v))}>
                <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Chọn năm" />
                </SelectTrigger>
                <SelectContent>
                    {sortedYears.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                            {year}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
