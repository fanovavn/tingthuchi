'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Receipt,
    Tag,
    Settings,
    Coins,
    Calendar,
    PiggyBank,
} from 'lucide-react';

const NAV_ITEMS = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/transactions', label: 'Giao dịch', icon: Receipt },
    { href: '/savings', label: 'Tiết kiệm', icon: PiggyBank },
    { href: '/categories', label: 'Danh mục', icon: Tag },
    { href: '/year-summary', label: 'Tổng Kết Năm', icon: Calendar },
];

const BOTTOM_NAV_ITEMS = [
    { href: '/settings', label: 'Cài đặt', icon: Settings },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="sidebar sidebar-desktop">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-8">
                <Coins className="w-8 h-8 text-[var(--color-primary)]" />
                <div>
                    <h1 className="font-bold text-xl gradient-text">Ting Thu Chi</h1>
                    <p className="text-xs text-[var(--color-text-muted)]">Quản lý tài chính</p>
                </div>
            </div>

            {/* Main Navigation */}
            <nav className="flex-1 space-y-1">
                {NAV_ITEMS.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`nav-link ${pathname === item.href ? 'active' : ''}`}
                    >
                        <item.icon className="w-5 h-5" />
                        <span>{item.label}</span>
                    </Link>
                ))}
            </nav>

            {/* Bottom Navigation */}
            <div className="border-t border-[var(--color-border)] pt-4 mt-4 space-y-1">
                {BOTTOM_NAV_ITEMS.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`nav-link ${pathname === item.href ? 'active' : ''}`}
                    >
                        <item.icon className="w-5 h-5" />
                        <span>{item.label}</span>
                    </Link>
                ))}
                <div className="px-3 py-2 text-xs text-[var(--color-text-muted)] opacity-50">
                    v8.2.0
                </div>
            </div>
        </aside>
    );
}
