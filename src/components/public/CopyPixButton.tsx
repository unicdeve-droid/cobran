'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export function CopyPixButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5">
        <p className="break-all font-mono text-xs text-gray-600">{code}</p>
      </div>
      <button
        onClick={handleCopy}
        className="flex items-center justify-center gap-1.5 rounded-lg bg-brand px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-dark"
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        {copied ? 'Código copiado!' : 'Copiar código'}
      </button>
    </div>
  );
}
