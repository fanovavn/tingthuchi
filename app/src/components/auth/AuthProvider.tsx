'use client';

import { useState, useEffect } from 'react';
import { Coins, Eye, EyeOff, Lock } from 'lucide-react';

const PASSWORD_KEY = 'crm-password';
const AUTH_KEY = 'crm-authenticated';
const DEFAULT_PASSWORD = 'Ting0409';

export function useAuth() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check if already authenticated in this session
        const auth = sessionStorage.getItem(AUTH_KEY);
        if (auth === 'true') {
            setIsAuthenticated(true);
        }
        setIsLoading(false);
    }, []);

    const login = (password: string): boolean => {
        const storedPassword = localStorage.getItem(PASSWORD_KEY) || DEFAULT_PASSWORD;
        if (password === storedPassword) {
            sessionStorage.setItem(AUTH_KEY, 'true');
            setIsAuthenticated(true);
            return true;
        }
        return false;
    };

    const logout = () => {
        sessionStorage.removeItem(AUTH_KEY);
        setIsAuthenticated(false);
    };

    const changePassword = (oldPassword: string, newPassword: string): boolean => {
        const storedPassword = localStorage.getItem(PASSWORD_KEY) || DEFAULT_PASSWORD;
        if (oldPassword === storedPassword) {
            localStorage.setItem(PASSWORD_KEY, newPassword);
            return true;
        }
        return false;
    };

    return { isAuthenticated, isLoading, login, logout, changePassword };
}

interface LoginFormProps {
    onLogin: (password: string) => boolean;
}

export function LoginForm({ onLogin }: LoginFormProps) {
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!onLogin(password)) {
            setError('Mật khẩu không đúng');
            setPassword('');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)] p-4">
            <div className="glass-card p-8 w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[rgba(99,102,241,0.1)] mb-4">
                        <Coins className="w-8 h-8 text-[var(--color-primary)]" />
                    </div>
                    <h1 className="text-2xl font-bold gradient-text">Ting Thu Chi</h1>
                    <p className="text-sm text-[var(--color-text-muted)] mt-2">
                        Nhập mật khẩu để truy cập
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Nhập mật khẩu..."
                            className="input pr-12"
                            autoFocus
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                        >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                    </div>

                    {error && (
                        <p className="text-sm text-[var(--color-danger)] text-center">{error}</p>
                    )}

                    <button type="submit" className="btn btn-primary w-full">
                        Đăng nhập
                    </button>
                </form>
            </div>
        </div>
    );
}

interface ChangePasswordFormProps {
    onChangePassword: (oldPassword: string, newPassword: string) => boolean;
    onClose: () => void;
}

export function ChangePasswordForm({ onChangePassword, onClose }: ChangePasswordFormProps) {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (newPassword !== confirmPassword) {
            setError('Mật khẩu mới không khớp');
            return;
        }

        if (newPassword.length < 4) {
            setError('Mật khẩu mới phải có ít nhất 4 ký tự');
            return;
        }

        if (onChangePassword(oldPassword, newPassword)) {
            setSuccess(true);
            setTimeout(() => {
                onClose();
            }, 1500);
        } else {
            setError('Mật khẩu cũ không đúng');
        }
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-xl font-bold mb-6">Đổi Mật Khẩu</h2>

                {success ? (
                    <div className="text-center py-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--color-success-bg)] mb-4">
                            <Lock className="w-8 h-8 text-[var(--color-success)]" />
                        </div>
                        <p className="text-[var(--color-success)]">Đổi mật khẩu thành công!</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm text-[var(--color-text-secondary)] mb-2">
                                Mật khẩu cũ
                            </label>
                            <input
                                type="password"
                                value={oldPassword}
                                onChange={(e) => setOldPassword(e.target.value)}
                                className="input"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-[var(--color-text-secondary)] mb-2">
                                Mật khẩu mới
                            </label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="input"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-[var(--color-text-secondary)] mb-2">
                                Nhập lại mật khẩu mới
                            </label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="input"
                                required
                            />
                        </div>

                        {error && (
                            <p className="text-sm text-[var(--color-danger)]">{error}</p>
                        )}

                        <div className="flex gap-3 pt-4">
                            <button type="button" onClick={onClose} className="btn btn-secondary flex-1">
                                Hủy
                            </button>
                            <button type="submit" className="btn btn-primary flex-1">
                                Đổi mật khẩu
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
