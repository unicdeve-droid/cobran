import Link from 'next/link';
import { FileSearch } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-white px-6 text-center">
      <FileSearch className="h-10 w-10 text-gray-300" />
      <h1 className="text-lg font-semibold text-gray-900">Página não encontrada</h1>
      <p className="max-w-sm text-sm text-gray-500">
        O link que você acessou não existe ou não está mais disponível.
      </p>
      <Link href="/" className="mt-2 text-sm font-medium text-brand hover:underline">
        Voltar ao início
      </Link>
    </div>
  );
}
