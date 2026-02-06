'use client';

import { ReactNode } from 'react';
import { useAuth, LoginForm } from '@/components/auth';

export function AuthWrapper({ children }: { children: ReactNode }) {
    const { isAuthenticated, isLoading, login } = useAuth();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)]">
                <div className="text-center">
                    <div className="skeleton w-16 h-16 rounded-full mx-auto mb-4" />
                    <p className="text-[var(--color-text-muted)]">Đang tải...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <LoginForm onLogin={login} />;
    }

    return <>{children}</>;
}
