import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Pagination({
  page,
  totalPages,
  basePath,
}: {
  page: number;
  totalPages: number;
  basePath: string;
}) {
  if (totalPages <= 1) return null;

  const prevDisabled = page <= 1;
  const nextDisabled = page >= totalPages;

  return (
    <div className="flex items-center justify-between border-t border-gray-200 pt-4">
      <span className="text-sm text-gray-500">
        Página {page} de {totalPages}
      </span>
      <div className="flex gap-2">
        <Link
          href={`${basePath}?page=${page - 1}`}
          aria-disabled={prevDisabled}
          className={cn(
            'flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-600',
            prevDisabled
              ? 'pointer-events-none opacity-40'
              : 'hover:bg-gray-50'
          )}
        >
          <ChevronLeft className="h-4 w-4" />
          Anterior
        </Link>
        <Link
          href={`${basePath}?page=${page + 1}`}
          aria-disabled={nextDisabled}
          className={cn(
            'flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-600',
            nextDisabled
              ? 'pointer-events-none opacity-40'
              : 'hover:bg-gray-50'
          )}
        >
          Próxima
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
