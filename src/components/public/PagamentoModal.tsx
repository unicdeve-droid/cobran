'use client';

import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';

interface PagamentoModalProps {
  onClose: () => void;
  logoUrl: string;
  htmlContent: string;
  buttonLabel: string;
  guiaButtonLabel: string;
  uuid: string;
}

export function PagamentoModal({
  onClose,
  logoUrl,
  htmlContent,
  buttonLabel,
  guiaButtonLabel,
  uuid,
}: PagamentoModalProps) {
  const router = useRouter();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 p-4 animate-overlay-in"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-modal-in"
      >
        <div className="mb-4 flex items-start justify-between">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt="Logo" className="h-8 w-auto object-contain" />
          ) : (
            <span />
          )}
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div
          className="text-sm leading-relaxed text-gray-800"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />

        <button
          onClick={() => router.push(`/cobranca/${uuid}/fatura`)}
          className="mt-6 w-full rounded-lg bg-success px-5 py-3 text-sm font-semibold text-white hover:bg-success-dark"
        >
          {buttonLabel}
        </button>

        <button
          onClick={() => router.push(`/cobranca/${uuid}/guia`)}
          className="mt-3 w-full rounded-lg border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          {guiaButtonLabel}
        </button>
      </div>
    </div>
  );
}
