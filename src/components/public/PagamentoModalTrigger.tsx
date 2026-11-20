'use client';

import { useState } from 'react';
import { PagamentoModal } from '@/components/public/PagamentoModal';

interface PagamentoModalTriggerProps {
  uuid: string;
  logoUrl: string;
  modalHtml: string;
  botaoRegularizarLabel: string;
  linkPagamentoLabel: string;
  botaoEmitirLabel: string;
  botaoEmitirGuiaLabel: string;
}

export function PagamentoModalTrigger({
  uuid,
  logoUrl,
  modalHtml,
  botaoRegularizarLabel,
  linkPagamentoLabel,
  botaoEmitirLabel,
  botaoEmitirGuiaLabel,
}: PagamentoModalTriggerProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col items-center gap-3 pt-2 text-center">
      <button
        onClick={() => setOpen(true)}
        className="w-full rounded-lg bg-brand px-5 py-3 text-center text-sm font-semibold text-white hover:bg-brand-dark sm:w-auto sm:px-10"
      >
        {botaoRegularizarLabel}
      </button>
      <button
        onClick={() => setOpen(true)}
        className="text-xs text-gray-400 underline-offset-2 hover:text-brand hover:underline"
      >
        {linkPagamentoLabel}
      </button>

      {open && (
        <PagamentoModal
          onClose={() => setOpen(false)}
          logoUrl={logoUrl}
          htmlContent={modalHtml}
          buttonLabel={botaoEmitirLabel}
          guiaButtonLabel={botaoEmitirGuiaLabel}
          uuid={uuid}
        />
      )}
    </div>
  );
}
