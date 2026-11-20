'use client';

import { useEffect } from 'react';

export function GuiaRedirect({ boletoUrl }: { boletoUrl: string }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.href = boletoUrl;
    }, 3000);
    return () => clearTimeout(timer);
  }, [boletoUrl]);

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-light border-t-brand" />
      <p className="text-sm text-gray-500">Preparando sua guia...</p>
    </div>
  );
}
