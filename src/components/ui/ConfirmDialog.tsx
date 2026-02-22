'use client';

import { AlertTriangle } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning';
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  variant = 'danger',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) {
      // Focus cancel by default to prevent accidental confirm
      confirmRef.current?.focus();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onCancel]);

  if (!open) return null;

  const isDanger = variant === 'danger';

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-[60]" onClick={onCancel} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[60] w-[420px] max-w-[90vw] bg-white rounded-xl shadow-2xl">
        <div className="p-6">
          <div className="flex items-start gap-3">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                isDanger ? 'bg-[#FFF0F0]' : 'bg-[#FFF8E6]'
              }`}
            >
              <AlertTriangle
                size={20}
                className={isDanger ? 'text-[#E2445C]' : 'text-[#FDAB3D]'}
              />
            </div>
            <div>
              <h3 className="text-[16px] font-semibold text-[#323338] mb-1">
                {title}
              </h3>
              <p className="text-[14px] text-[#676879] leading-relaxed">
                {message}
              </p>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 px-6 py-4 border-t border-[#E6E9EF]">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-[13px] font-medium text-[#323338] hover:bg-[#F6F7FB] rounded-lg transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            onClick={onConfirm}
            className={`px-4 py-2 text-[13px] font-medium text-white rounded-lg transition-colors ${
              isDanger
                ? 'bg-[#E2445C] hover:bg-[#D93A52]'
                : 'bg-[#FDAB3D] hover:bg-[#E69A2E]'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </>
  );
}
