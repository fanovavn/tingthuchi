'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Coins, Delete, Lock } from 'lucide-react';

const PASSWORD_KEY = 'crm-password';
const AUTH_KEY = 'crm-authenticated';
const DEFAULT_PASSWORD = '200415';
const PASSCODE_LENGTH = 6;

export function useAuth() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const auth = sessionStorage.getItem(AUTH_KEY);
        if (auth === 'true') {
            setIsAuthenticated(true);
        }
        setIsLoading(false);
    }, []);

    const login = (password: string): boolean => {
        let storedPassword = localStorage.getItem(PASSWORD_KEY);
        // Migration: if stored password is not a valid 6-digit PIN, clear it
        if (storedPassword && !/^\d{6}$/.test(storedPassword)) {
            localStorage.removeItem(PASSWORD_KEY);
            storedPassword = null;
        }
        const effectivePassword = storedPassword || DEFAULT_PASSWORD;
        if (password === effectivePassword) {
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

// ── Passcode Dots ──────────────────────────────────────────────────────
function PasscodeDots({ length, filled, error }: { length: number; filled: number; error: boolean }) {
    return (
        <div style={{ display: 'flex', gap: '14px', justifyContent: 'center' }}>
            {Array.from({ length }).map((_, i) => (
                <div
                    key={i}
                    style={{
                        width: 16,
                        height: 16,
                        borderRadius: '50%',
                        border: `2px solid ${error ? 'var(--color-danger)' : 'var(--color-primary)'}`,
                        backgroundColor: i < filled
                            ? (error ? 'var(--color-danger)' : 'var(--color-primary)')
                            : 'transparent',
                        transition: 'all 0.15s ease',
                        transform: i < filled ? 'scale(1.1)' : 'scale(1)',
                    }}
                />
            ))}
        </div>
    );
}

// ── Number Pad ─────────────────────────────────────────────────────────
function NumberPad({ onDigit, onDelete, disabled }: {
    onDigit: (d: string) => void;
    onDelete: () => void;
    disabled: boolean;
}) {
    const keys = [
        ['1', '2', '3'],
        ['4', '5', '6'],
        ['7', '8', '9'],
        ['', '0', 'del'],
    ];

    const btnBase: React.CSSProperties = {
        width: 72,
        height: 72,
        borderRadius: '50%',
        border: '2px solid var(--color-border)',
        background: 'var(--color-surface)',
        color: 'var(--color-text-primary)',
        fontSize: 26,
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: disabled ? 'default' : 'pointer',
        transition: 'all 0.12s ease',
        userSelect: 'none',
        opacity: disabled ? 0.5 : 1,
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center' }}>
            {keys.map((row, ri) => (
                <div key={ri} style={{ display: 'flex', gap: 20 }}>
                    {row.map((k, ci) => {
                        if (k === '') {
                            return <div key={ci} style={{ width: 72, height: 72 }} />;
                        }
                        if (k === 'del') {
                            return (
                                <button
                                    key={ci}
                                    type="button"
                                    disabled={disabled}
                                    onClick={onDelete}
                                    style={{ ...btnBase, border: 'none', background: 'transparent' }}
                                    onMouseDown={(e) => e.preventDefault()}
                                >
                                    <Delete className="w-6 h-6" />
                                </button>
                            );
                        }
                        return (
                            <button
                                key={ci}
                                type="button"
                                disabled={disabled}
                                onClick={() => onDigit(k)}
                                style={btnBase}
                                className="passcode-key"
                                onMouseDown={(e) => e.preventDefault()}
                            >
                                {k}
                            </button>
                        );
                    })}
                </div>
            ))}
        </div>
    );
}

// ── Login Form (Passcode Pad) ──────────────────────────────────────────
interface LoginFormProps {
    onLogin: (password: string) => boolean;
}

export function LoginForm({ onLogin }: LoginFormProps) {
    const [passcode, setPasscode] = useState('');
    const [error, setError] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [shaking, setShaking] = useState(false);
    const processingRef = useRef(false);

    const handleDigit = useCallback((digit: string) => {
        if (processingRef.current) return;
        setError(false);
        setErrorMsg('');
        setPasscode((prev) => {
            if (prev.length >= PASSCODE_LENGTH) return prev;
            return prev + digit;
        });
    }, []);

    const handleDelete = useCallback(() => {
        if (processingRef.current) return;
        setError(false);
        setErrorMsg('');
        setPasscode((prev) => prev.slice(0, -1));
    }, []);

    // Auto-submit on 6 digits
    useEffect(() => {
        if (passcode.length === PASSCODE_LENGTH && !processingRef.current) {
            processingRef.current = true;
            // Small delay so the last dot fills visually
            const timer = setTimeout(() => {
                if (!onLogin(passcode)) {
                    setError(true);
                    setErrorMsg('Mật khẩu không đúng');
                    setShaking(true);
                    setTimeout(() => {
                        setShaking(false);
                        setPasscode('');
                        setError(false);
                        processingRef.current = false;
                    }, 600);
                }
            }, 200);
            return () => clearTimeout(timer);
        }
    }, [passcode, onLogin]);

    // Keyboard support
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key >= '0' && e.key <= '9') handleDigit(e.key);
            if (e.key === 'Backspace') handleDelete();
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [handleDigit, handleDelete]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)] p-4">
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32 }}>
                {/* Logo + Title */}
                <div style={{ textAlign: 'center' }}>
                    <div
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 64,
                            height: 64,
                            borderRadius: '50%',
                            background: 'rgba(99,102,241,0.1)',
                            marginBottom: 16,
                        }}
                    >
                        <Coins className="w-8 h-8 text-[var(--color-primary)]" />
                    </div>
                    <h1 className="text-2xl font-bold gradient-text">Ting Thu Chi</h1>
                    <p className="text-sm text-[var(--color-text-muted)]" style={{ marginTop: 8 }}>
                        Nhập mã PIN để truy cập
                    </p>
                </div>

                {/* Dots */}
                <div
                    style={{
                        animation: shaking ? 'passcode-shake 0.5s ease' : 'none',
                    }}
                >
                    <PasscodeDots length={PASSCODE_LENGTH} filled={passcode.length} error={error} />
                </div>

                {/* Error message */}
                {errorMsg && (
                    <p className="text-sm text-[var(--color-danger)]" style={{ marginTop: -16 }}>
                        {errorMsg}
                    </p>
                )}

                {/* Number pad */}
                <NumberPad
                    onDigit={handleDigit}
                    onDelete={handleDelete}
                    disabled={processingRef.current}
                />
            </div>

            {/* Shake animation */}
            <style>{`
                @keyframes passcode-shake {
                    0%, 100% { transform: translateX(0); }
                    20% { transform: translateX(-12px); }
                    40% { transform: translateX(10px); }
                    60% { transform: translateX(-8px); }
                    80% { transform: translateX(6px); }
                }
                .passcode-key:hover {
                    background: var(--color-surface-hover) !important;
                    border-color: var(--color-primary) !important;
                    transform: scale(1.05);
                }
                .passcode-key:active {
                    transform: scale(0.95);
                    background: var(--color-primary) !important;
                    color: white !important;
                    border-color: var(--color-primary) !important;
                }
            `}</style>
        </div>
    );
}

// ── Change Password Form (Passcode) ────────────────────────────────────
interface ChangePasswordFormProps {
    onChangePassword: (oldPassword: string, newPassword: string) => boolean;
    onClose: () => void;
}

function PasscodeInput({ label, value, onChange }: {
    label: string;
    value: string;
    onChange: (v: string) => void;
}) {
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const handleChange = (index: number, val: string) => {
        if (!/^\d?$/.test(val)) return;
        const arr = value.split('');
        arr[index] = val;
        const next = arr.join('').slice(0, PASSCODE_LENGTH);
        onChange(next);
        if (val && index < PASSCODE_LENGTH - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !value[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    return (
        <div>
            <label className="block text-sm text-[var(--color-text-secondary)] mb-2">{label}</label>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                {Array.from({ length: PASSCODE_LENGTH }).map((_, i) => (
                    <input
                        key={i}
                        ref={(el) => { inputRefs.current[i] = el; }}
                        type="password"
                        inputMode="numeric"
                        maxLength={1}
                        value={value[i] || ''}
                        onChange={(e) => handleChange(i, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(i, e)}
                        style={{
                            width: 42,
                            height: 48,
                            textAlign: 'center',
                            fontSize: 20,
                            fontWeight: 700,
                            borderRadius: 10,
                            border: '2px solid var(--color-border)',
                            background: 'var(--color-surface)',
                            color: 'var(--color-text-primary)',
                            outline: 'none',
                            transition: 'border-color 0.15s',
                        }}
                        onFocus={(e) => { e.target.style.borderColor = 'var(--color-primary)'; }}
                        onBlur={(e) => { e.target.style.borderColor = 'var(--color-border)'; }}
                    />
                ))}
            </div>
        </div>
    );
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

        if (newPassword.length !== PASSCODE_LENGTH) {
            setError(`Mã PIN mới phải có đúng ${PASSCODE_LENGTH} số`);
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Mã PIN mới không khớp');
            return;
        }

        if (onChangePassword(oldPassword, newPassword)) {
            setSuccess(true);
            setTimeout(() => {
                onClose();
            }, 1500);
        } else {
            setError('Mã PIN cũ không đúng');
        }
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-xl font-bold mb-6">Đổi Mã PIN</h2>

                {success ? (
                    <div className="text-center py-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--color-success-bg)] mb-4">
                            <Lock className="w-8 h-8 text-[var(--color-success)]" />
                        </div>
                        <p className="text-[var(--color-success)]">Đổi mã PIN thành công!</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <PasscodeInput
                            label="Mã PIN cũ"
                            value={oldPassword}
                            onChange={setOldPassword}
                        />
                        <PasscodeInput
                            label="Mã PIN mới"
                            value={newPassword}
                            onChange={setNewPassword}
                        />
                        <PasscodeInput
                            label="Nhập lại mã PIN mới"
                            value={confirmPassword}
                            onChange={setConfirmPassword}
                        />

                        {error && (
                            <p className="text-sm text-[var(--color-danger)]">{error}</p>
                        )}

                        <div className="flex gap-3 pt-4">
                            <button type="button" onClick={onClose} className="btn btn-secondary flex-1">
                                Hủy
                            </button>
                            <button type="submit" className="btn btn-primary flex-1">
                                Đổi mã PIN
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
