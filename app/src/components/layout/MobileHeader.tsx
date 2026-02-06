'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Coins } from 'lucide-react';
import {
    LayoutDashboard,
    Receipt,
    Tag,
    Upload,
    Settings,
} from 'lucide-react';

const NAV_ITEMS = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/transactions', label: 'Giao dịch', icon: Receipt },
    { href: '/categories', label: 'Danh mục', icon: Tag },
];

const BOTTOM_NAV_ITEMS = [
    { href: '/upload', label: 'Import Excel', icon: Upload },
    { href: '/settings', label: 'Cài đặt', icon: Settings },
];

export function MobileHeader() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    const toggleMenu = () => setIsOpen(!isOpen);
    const closeMenu = () => setIsOpen(false);

    return (
        <>
            {/* Mobile Header Bar */}
            <header className="mobile-header">
                <button
                    onClick={toggleMenu}
                    className="p-2 hover:bg-[var(--color-surface-hover)] rounded-lg z-50"
                    aria-label="Toggle menu"
                >
                    {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>

                <Link href="/" className="flex items-center gap-2">
                    <Coins className="w-6 h-6 text-[var(--color-primary)]" />
                    <span className="font-bold text-lg gradient-text">Ting Thu Chi</span>
                </Link>

                <div className="w-10" /> {/* Spacer for centering */}
            </header>

            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40"
                    onClick={closeMenu}
                />
            )}

            {/* Mobile Sidebar */}
            <aside
                className={`fixed top-0 left-0 h-full w-64 bg-[var(--color-surface)] border-r border-[var(--color-border)] p-4 z-50 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                {/* Logo */}
                <div className="flex items-center gap-3 mb-6">
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
                            onClick={closeMenu}
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
                            onClick={closeMenu}
                            className={`nav-link ${pathname === item.href ? 'active' : ''}`}
                        >
                            <item.icon className="w-5 h-5" />
                            <span>{item.label}</span>
                        </Link>
                    ))}
                </div>
            </aside>
        </>
    );
}
