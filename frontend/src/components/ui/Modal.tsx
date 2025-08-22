'use client';

import { PropsWithChildren, useEffect } from 'react';

type ModalProps = PropsWithChildren<{
  open: boolean;
  onClose: () => void;
  title?: string;
  className?: string;
}>;

export default function Modal({ open, onClose, title, className = '', children }: ModalProps) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    if (open) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      {/* Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        className="absolute inset-0 flex items-center justify-center p-4"
      >
        <div className={`w-full max-w-md rounded-2xl bg-white dark:bg-zinc-900 shadow-xl ring-1 ring-black/10 ${className}`}>
          <div className="p-5">
            {title && <h3 className="text-lg font-semibold mb-2">{title}</h3>}
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}