'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Copy, Check, Pencil, Trash2 } from 'lucide-react';

export function CobrancaRowActions({ id, uuid }: { id: string; uuid: string }) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleCopy() {
    const url = `${window.location.origin}/cobranca/${uuid}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleDelete() {
    if (!confirm('Tem certeza que deseja excluir esta cobrança? Essa ação não pode ser desfeita.')) {
      return;
    }
    setDeleting(true);
    try {
      await fetch(`/api/cobrancas/${id}`, { method: 'DELETE' });
      router.refresh();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex items-center justify-end gap-1.5">
      <button
        onClick={handleCopy}
        title="Copiar link de cobrança"
        className="flex h-8 w-8 items-center justify-center rounded-lg text-brand hover:bg-brand-light"
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </button>
      <Link
        href={`/xcexm2r4oq4tfzm7rf5222/${id}`}
        title="Editar"
        className="flex h-8 w-8 items-center justify-center rounded-lg text-brand hover:bg-brand-light"
      >
        <Pencil className="h-4 w-4" />
      </Link>
      <button
        onClick={handleDelete}
        disabled={deleting}
        title="Excluir"
        className="flex h-8 w-8 items-center justify-center rounded-lg text-red-500 hover:bg-red-50 disabled:opacity-50"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
