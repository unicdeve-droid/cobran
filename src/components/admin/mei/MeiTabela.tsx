'use client';

import Link from 'next/link';
import { ChevronLeft, ChevronRight, Loader2, Inbox, CheckCircle2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export interface MeiLeadRow {
  id: string;
  numero: number;
  nome: string;
  cnpjFormatado: string;
  cpfFormatado: string;
  telefone: string | null;
  email: string | null;
  dataAbertura: string | null;
  uf: string;
  municipioNome: string | null;
  municipioCodigo: string;
  cnae: string | null;
  modulo: string;
  cobrancaId: string | null;
}

export function MeiTabela({
  data,
  loading,
  page,
  perPage,
  totalPages,
  totalFiltrado,
  onPageChange,
}: {
  data: MeiLeadRow[];
  loading: boolean;
  page: number;
  perPage: number;
  totalPages: number;
  totalFiltrado: number;
  onPageChange: (page: number) => void;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th className="whitespace-nowrap px-4 py-3 font-medium">Nº</th>
              <th className="whitespace-nowrap px-4 py-3 font-medium">Nome</th>
              <th className="whitespace-nowrap px-4 py-3 font-medium">CNPJ</th>
              <th className="whitespace-nowrap px-4 py-3 font-medium">CPF</th>
              <th className="whitespace-nowrap px-4 py-3 font-medium">Telefone</th>
              <th className="whitespace-nowrap px-4 py-3 font-medium">Email</th>
              <th className="whitespace-nowrap px-4 py-3 font-medium">Abertura</th>
              <th className="whitespace-nowrap px-4 py-3 font-medium">UF</th>
              <th className="whitespace-nowrap px-4 py-3 font-medium">Município</th>
              <th className="whitespace-nowrap px-4 py-3 font-medium">Módulo</th>
              <th className="whitespace-nowrap px-4 py-3 font-medium">Cobrança</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={11} className="px-4 py-10 text-center text-gray-400">
                  <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={11} className="px-4 py-10 text-center text-gray-400">
                  <Inbox className="mx-auto mb-2 h-6 w-6" />
                  Nenhum lead encontrado com esses filtros.
                </td>
              </tr>
            ) : (
              data.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-50/60">
                  <td className="whitespace-nowrap px-4 py-2.5 text-gray-400">{lead.numero}</td>
                  <td className="max-w-[220px] truncate px-4 py-2.5 font-medium text-gray-900">
                    {lead.nome}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2.5 text-gray-600">
                    {lead.cnpjFormatado}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2.5 text-gray-600">
                    {lead.cpfFormatado || '—'}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2.5 text-gray-600">
                    {lead.telefone ?? '—'}
                  </td>
                  <td className="max-w-[200px] truncate px-4 py-2.5 text-gray-600">
                    {lead.email ?? '—'}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2.5 text-gray-600">
                    {formatDate(lead.dataAbertura) || '—'}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2.5 text-gray-600">{lead.uf}</td>
                  <td className="whitespace-nowrap px-4 py-2.5 text-gray-600">
                    {lead.municipioNome ?? `Cód. ${lead.municipioCodigo}`}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2.5 text-gray-600">{lead.modulo}</td>
                  <td className="whitespace-nowrap px-4 py-2.5">
                    {lead.cobrancaId ? (
                      <Link
                        href={`/xcexm2r4oq4tfzm7rf5222/${lead.cobrancaId}`}
                        className="inline-flex items-center gap-1 text-xs font-medium text-success-dark hover:underline"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Ver cobrança
                      </Link>
                    ) : (
                      <span className="text-xs text-gray-300">—</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3">
          <span className="text-sm text-gray-500">
            Página {page} de {totalPages} · {totalFiltrado.toLocaleString('pt-BR')} resultado(s)
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </button>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              className="flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-40"
            >
              Próxima
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
