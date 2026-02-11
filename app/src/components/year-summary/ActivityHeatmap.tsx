import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { formatCurrency, formatDate } from "@/lib/utils";
import { eachDayOfInterval, endOfYear, format, getDay, getISOWeek, startOfYear, isSameDay } from "date-fns";
import { vi } from "date-fns/locale";

interface ActivityHeatmapProps {
    data: Record<string, number>; // date "yyyy-MM-dd" -> amount
    year: number;
}

export function ActivityHeatmap({ data, year }: ActivityHeatmapProps) {
    const startDate = startOfYear(new Date(year, 0, 1));
    const endDate = endOfYear(new Date(year, 0, 1));
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    // Determine max value for color scaling
    const maxValue = Math.max(...Object.values(data), 0);

    // Group days by week for the grid
    // We need 53 columns (weeks) x 7 rows (days)
    // But standard grid flow is by row or column.
    // CSS Grid: grid-rows-7, grid-flow-col

    const getColorClass = (amount: number) => {
        if (!amount || amount === 0) return "bg-[var(--color-surface-hover)]"; // Empty/0
        const percentage = (amount / maxValue) * 100;

        if (percentage < 20) return "bg-emerald-900/40";
        if (percentage < 40) return "bg-emerald-700/60";
        if (percentage < 60) return "bg-emerald-600/80";
        if (percentage < 80) return "bg-emerald-500";
        return "bg-emerald-400"; // Max
    };

    return (
        <div className="glass-card p-6 overflow-x-auto">
            <h3 className="text-lg font-semibold mb-4 text-white">Bản Đồ Chi Tiêu (Calendar Heatmap)</h3>

            <div className="min-w-[800px]">
                <div className="flex text-xs text-[var(--color-text-muted)] mb-2 gap-[38px] ml-8">
                    {/* Month labels roughly placed */}
                    <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
                    <span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
                </div>

                <div className="flex gap-2">
                    <div className="flex flex-col justify-between text-[10px] text-[var(--color-text-muted)] font-medium h-[112px] py-1">
                        <span>Mon</span>
                        <span>Wed</span>
                        <span>Fri</span>
                    </div>

                    <div className="grid grid-rows-7 grid-flow-col gap-1">
                        {days.map((day) => {
                            const dateStr = format(day, 'yyyy-MM-dd');
                            const amount = data[dateStr] || 0;
                            // Shift first week days to align with correct day of week?
                            // This simple map just puts days in flow. 
                            // If user starts year on Wednesday, first 2 slots in Col 1 should be empty?
                            // Actually, with grid-flow-col, we just dump days? 
                            // No, to be correct "Calendar" style, we need to respect day of week.
                            // Simplified approach: Just dump days. It might look slightly off on row alignment if we don't pad.
                            // Better: Calculate 'day of week' (0-6) and use it.
                            return (
                                <TooltipProvider key={dateStr}>
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <div
                                                className={`w-3 h-3 rounded-[2px] ${getColorClass(amount)} hover:ring-1 hover:ring-white/50 transition-all`}
                                            />
                                        </TooltipTrigger>
                                        <TooltipContent side="top">
                                            <div className="text-xs">
                                                <p className="font-bold">{formatDate(day)}</p>
                                                <p>{formatCurrency(amount)}</p>
                                            </div>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            );
                        })}
                    </div>
                </div>

                <div className="flex items-center justify-end gap-2 mt-4 text-xs text-[var(--color-text-muted)]">
                    <span>Ít</span>
                    <div className="flex gap-1">
                        <div className="w-3 h-3 rounded-[2px] bg-[var(--color-surface-hover)]" />
                        <div className="w-3 h-3 rounded-[2px] bg-emerald-900/40" />
                        <div className="w-3 h-3 rounded-[2px] bg-emerald-600/80" />
                        <div className="w-3 h-3 rounded-[2px] bg-emerald-400" />
                    </div>
                    <span>Nhiều</span>
                </div>
            </div>
        </div>
    );
}
