'use client';

import { useState, useEffect } from 'react';
import { Moon, Sun, Cloud, Lock, LogOut, Link as LinkIcon, Copy, Check, ExternalLink, AlertCircle } from 'lucide-react';
import { useAuth, ChangePasswordForm } from '@/components/auth';
import { useTheme } from '@/components/theme';

const SERVICE_ACCOUNT_EMAIL = 'tingthuchi@tingthuchi.iam.gserviceaccount.com';

export default function SettingsPage() {
    const { logout, changePassword } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [spreadsheetId, setSpreadsheetId] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [copied, setCopied] = useState(false);

    // Load config on mount
    useEffect(() => {
        fetch('/api/config')
            .then(res => res.json())
            .then(data => {
                if (data.spreadsheetId) {
                    setSpreadsheetId(data.spreadsheetId);
                }
            })
            .catch(console.error);
    }, []);

    const extractSpreadsheetId = (input: string): string => {
        // If it's a full URL, extract the ID
        const match = input.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
        if (match) {
            return match[1];
        }
        // Otherwise assume it's already an ID
        return input.trim();
    };

    const handleSaveSpreadsheet = async () => {
        const id = extractSpreadsheetId(spreadsheetId);
        if (!id) {
            setSaveStatus('error');
            return;
        }

        setIsSaving(true);
        setSaveStatus('idle');

        try {
            const res = await fetch('/api/config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ spreadsheetId: id }),
            });

            if (res.ok) {
                setSpreadsheetId(id);
                setSaveStatus('success');
                // Reload data after changing spreadsheet
                window.location.reload();
            } else {
                setSaveStatus('error');
            }
        } catch (error) {
            console.error(error);
            setSaveStatus('error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCopyEmail = async () => {
        await navigator.clipboard.writeText(SERVICE_ACCOUNT_EMAIL);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleLogout = () => {
        if (confirm('Bạn có chắc muốn đăng xuất?')) {
            sessionStorage.removeItem('crm-authenticated');
            window.location.replace('/');
        }
    };

    const handleToggleTheme = () => {
        toggleTheme();
    };

    return (
        <div className="space-y-6 max-w-2xl">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold">Cài Đặt</h1>
                <p className="text-[var(--color-text-muted)]">
                    Tùy chỉnh ứng dụng theo ý bạn
                </p>
            </div>

            {/* Google Sheets Integration */}
            <div className="glass-card p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Cloud className="w-5 h-5" />
                    Google Sheets
                </h2>

                {/* Instructions */}
                <div className="mb-6 p-4 bg-[var(--color-info-bg)] border border-[var(--color-info)]/20 rounded-lg">
                    <h3 className="font-medium text-[var(--color-info)] mb-2 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        Hướng dẫn cấu hình
                    </h3>
                    <ol className="text-sm space-y-2 text-[var(--color-text-secondary)]">
                        <li><strong>1.</strong> Tạo Google Spreadsheet mới hoặc mở spreadsheet có sẵn</li>
                        <li><strong>2.</strong> Đổi tên sheet tab thành <code className="px-1 py-0.5 bg-[var(--color-surface-hover)] rounded">Transaction</code></li>
                        <li><strong>3.</strong> Thêm header ở hàng đầu tiên với các cột:
                            <code className="block mt-1 px-2 py-1 bg-[var(--color-surface-hover)] rounded text-xs">
                                Ngày | Amount | Phân nhóm | Mô tả | Kiểu giao dịch | ID
                            </code>
                        </li>
                        <li><strong>4.</strong> Share spreadsheet với email bên dưới (quyền <strong>Editor</strong>)</li>
                        <li><strong>5.</strong> Copy Spreadsheet ID từ URL và dán vào ô bên dưới</li>
                    </ol>
                </div>

                {/* Service Account Email */}
                <div className="mb-4">
                    <label className="block text-xs text-[var(--color-text-muted)] mb-1">
                        Email cần thêm quyền Editor
                    </label>
                    <div className="flex gap-2">
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                value={SERVICE_ACCOUNT_EMAIL}
                                readOnly
                                className="input w-full pr-10 text-sm bg-[var(--color-surface-hover)]"
                            />
                        </div>
                        <button
                            onClick={handleCopyEmail}
                            className="btn btn-secondary px-3"
                            title="Copy email"
                        >
                            {copied ? <Check className="w-4 h-4 text-[var(--color-success)]" /> : <Copy className="w-4 h-4" />}
                        </button>
                    </div>
                    {copied && (
                        <p className="text-xs text-[var(--color-success)] mt-1">Đã copy!</p>
                    )}
                </div>

                {/* Spreadsheet ID Input */}
                <div className="mb-4">
                    <label className="block text-xs text-[var(--color-text-muted)] mb-1">
                        Spreadsheet ID hoặc URL
                    </label>
                    <div className="flex gap-2">
                        <div className="flex-1 relative">
                            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
                            <input
                                type="text"
                                value={spreadsheetId}
                                onChange={(e) => {
                                    setSpreadsheetId(e.target.value);
                                    setSaveStatus('idle');
                                }}
                                placeholder="https://docs.google.com/spreadsheets/d/xxx/edit hoặc xxx"
                                className="input pl-10 w-full"
                            />
                        </div>
                        <button
                            onClick={handleSaveSpreadsheet}
                            disabled={isSaving || !spreadsheetId.trim()}
                            className="btn btn-primary"
                        >
                            {isSaving ? 'Đang lưu...' : 'Lưu'}
                        </button>
                    </div>
                    {saveStatus === 'success' && (
                        <p className="text-xs text-[var(--color-success)] mt-1 flex items-center gap-1">
                            <Check className="w-3 h-3" /> Đã lưu và đang tải lại dữ liệu...
                        </p>
                    )}
                    {saveStatus === 'error' && (
                        <p className="text-xs text-[var(--color-danger)] mt-1">
                            Không thể lưu. Vui lòng kiểm tra lại ID.
                        </p>
                    )}
                </div>

                {/* Current Config */}
                {spreadsheetId && (
                    <div className="p-3 bg-[var(--color-surface-hover)] rounded-lg">
                        <p className="text-xs text-[var(--color-text-muted)] mb-1">Spreadsheet ID hiện tại:</p>
                        <div className="flex items-center gap-2">
                            <code className="text-sm flex-1 truncate">{extractSpreadsheetId(spreadsheetId)}</code>
                            <a
                                href={`https://docs.google.com/spreadsheets/d/${extractSpreadsheetId(spreadsheetId)}/edit`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[var(--color-primary)] hover:underline flex items-center gap-1 text-sm"
                            >
                                Mở <ExternalLink className="w-3 h-3" />
                            </a>
                        </div>
                    </div>
                )}
            </div>

            {/* Security */}
            <div className="glass-card p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Lock className="w-5 h-5" />
                    Bảo mật
                </h2>
                <div className="space-y-4">
                    <button
                        onClick={() => setShowPasswordForm(true)}
                        className="btn btn-secondary w-full justify-start"
                    >
                        <Lock className="w-4 h-4" />
                        Đổi mật khẩu
                    </button>
                    <button
                        onClick={handleLogout}
                        className="btn btn-secondary w-full justify-start text-[var(--color-danger)]"
                    >
                        <LogOut className="w-4 h-4" />
                        Đăng xuất
                    </button>
                </div>
            </div>

            {/* Appearance */}
            <div className="glass-card p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                    Giao diện
                </h2>
                <div
                    className="flex items-center justify-between p-3 bg-[var(--color-surface-hover)] rounded-lg cursor-pointer"
                    onClick={handleToggleTheme}
                >
                    <div className="flex items-center gap-3">
                        {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                        <div>
                            <p className="font-medium">{theme === 'dark' ? 'Chế độ tối' : 'Chế độ sáng'}</p>
                            <p className="text-sm text-[var(--color-text-muted)]">
                                Nhấn để chuyển đổi
                            </p>
                        </div>
                    </div>
                    <div
                        className={`w-12 h-6 rounded-full relative transition-colors ${theme === 'dark' ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-surface)] border border-[var(--color-border)]'
                            }`}
                    >
                        <div
                            className={`absolute top-1 w-4 h-4 rounded-full transition-transform ${theme === 'dark'
                                ? 'bg-white right-1'
                                : 'bg-[var(--color-text-muted)] left-1'
                                }`}
                        />
                    </div>
                </div>
            </div>

            {/* Password change modal */}
            {showPasswordForm && (
                <ChangePasswordForm
                    onChangePassword={changePassword}
                    onClose={() => setShowPasswordForm(false)}
                />
            )}
        </div>
    );
}
