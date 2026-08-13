import React from 'react';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon = '📭', title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-lg font-extrabold text-[#111] mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-[#666] mb-6 max-w-xs leading-relaxed">{description}</p>
      )}
      {action && (
        <Button variant="primary" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}

export function LoadingState({ message = 'Memuat data...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6">
      <div className="w-8 h-8 border-3 border-black border-t-[#AADD00] rounded-full animate-spin mb-4" style={{ borderWidth: '3px' }} />
      <p className="text-sm font-semibold text-[#666]">{message}</p>
    </div>
  );
}

export function LoadingSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="brutal-card p-4 flex items-center gap-3">
          <div className="skeleton w-10 h-10 rounded-lg flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="skeleton h-4 w-3/4 rounded" />
            <div className="skeleton h-3 w-1/2 rounded" />
          </div>
          <div className="skeleton h-5 w-20 rounded" />
        </div>
      ))}
    </div>
  );
}

export function ErrorState({
  message = 'Terjadi kesalahan',
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="text-5xl mb-4">⚠️</div>
      <h3 className="text-lg font-extrabold text-[#111] mb-2">Oops!</h3>
      <p className="text-sm text-[#666] mb-6">{message}</p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          Coba Lagi
        </Button>
      )}
    </div>
  );
}

interface ConfirmDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onConfirm,
  onCancel,
  title,
  message,
  confirmLabel = 'Konfirmasi',
  danger = false,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative brutal-card-lg max-w-sm w-full p-5 animate-slide-up">
        <h3 className="text-base font-extrabold mb-2">{title}</h3>
        <p className="text-sm text-[#666] mb-5 leading-relaxed">{message}</p>
        <div className="flex gap-2">
          <Button variant="outline" fullWidth onClick={onCancel}>
            Batal
          </Button>
          <Button variant={danger ? 'danger' : 'primary'} fullWidth onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default EmptyState;
