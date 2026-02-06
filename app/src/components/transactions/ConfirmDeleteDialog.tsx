
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ConfirmDeleteDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
    title?: string;
    description?: string;
}

import { AlertTriangle } from 'lucide-react';

export function ConfirmDeleteDialog({
    open,
    onOpenChange,
    onConfirm,
    title = "Xóa giao dịch?",
    description = "Hành động này không thể hoàn tác. Bạn có chắc chắn muốn xóa giao dịch này không?",
}: ConfirmDeleteDialogProps) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="max-w-[400px] border-[var(--color-border)]">
                <div className="flex flex-col items-center gap-2 text-center sm:text-center">
                    <div className="p-3 rounded-full bg-[var(--color-danger-bg)] mb-2">
                        <AlertTriangle className="w-6 h-6 text-[var(--color-danger)]" />
                    </div>
                    <AlertDialogHeader className="space-y-2">
                        <AlertDialogTitle className="text-xl font-bold text-center sm:text-center">
                            {title}
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-center sm:text-center text-[var(--color-text-muted)]">
                            {description}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                </div>
                <AlertDialogFooter className="sm:justify-center gap-3 w-full mt-4">
                    <AlertDialogCancel className="w-full sm:w-auto mt-0 border-[var(--color-border)] hover:bg-[var(--color-surface-hover)]">
                        Hủy bỏ
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onConfirm}
                        className="w-full sm:w-auto bg-[var(--color-danger)] hover:opacity-90 text-white"
                    >
                        Xóa giao dịch
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
