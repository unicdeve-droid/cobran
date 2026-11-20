import Link from 'next/link';
import { redirect } from 'next/navigation';
import { FilePlus2, Inbox } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { CobrancaRowActions } from '@/components/admin/CobrancaRowActions';
import { Pagination } from '@/components/admin/Pagination';
import { GerarEmailsButton } from '@/components/admin/GerarEmailsButton';

const PER_PAGE = 10;

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { page?: string; criada?: string };
}) {
  const user = await getAuthUser();
  if (!user) redirect('/xcexm2r4oq4tfzm7rf5222/login');

  const page = Math.max(1, parseInt(searchParams.page || '1', 10));

  const [cobrancas, total] = await Promise.all([
    prisma.cobranca.findMany({
      orderBy: { criadoEm: 'desc' },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
      include: { _count: { select: { dividas: true } } },
    }),
    prisma.cobranca.count(),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Cobranças</h1>
          <p className="text-sm text-gray-500">{total} cobrança(s) cadastrada(s)</p>
        </div>
        <div className="flex gap-2">
          <GerarEmailsButton />
          <Link href="/xcexm2r4oq4tfzm7rf5222/nova">
            <Button>
              <FilePlus2 className="h-4 w-4" />
              Nova cobrança
            </Button>
          </Link>
        </div>
      </div>

      {cobrancas.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-gray-300 bg-white py-16 text-center">
          <Inbox className="h-8 w-8 text-gray-300" />
          <p className="text-sm text-gray-500">Nenhuma cobrança cadastrada ainda.</p>
          <Link href="/xcexm2r4oq4tfzm7rf5222/nova">
            <Button variant="secondary">Criar a primeira cobrança</Button>
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3 font-medium">Nº</th>
                <th className="px-4 py-3 font-medium">Empresa devedora</th>
                <th className="px-4 py-3 font-medium">CNPJ</th>
                <th className="px-4 py-3 font-medium">Titular</th>
                <th className="px-4 py-3 font-medium">Dívidas</th>
                <th className="px-4 py-3 font-medium">Criada em</th>
                <th className="px-4 py-3 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {cobrancas.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50/60">
                  <td className="px-4 py-3 font-medium text-gray-400">#{c.numero}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{c.razaoSocial}</td>
                  <td className="px-4 py-3 text-gray-600">{c.cnpj}</td>
                  <td className="px-4 py-3 text-gray-600">{c.nomeCompleto}</td>
                  <td className="px-4 py-3 text-gray-600">{c._count.dividas}</td>
                  <td className="px-4 py-3 text-gray-600">{formatDate(c.criadoEm)}</td>
                  <td className="px-4 py-3">
                    <CobrancaRowActions id={c.id} uuid={c.uuid} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-4 pb-4">
            <Pagination page={page} totalPages={totalPages} basePath="/xcexm2r4oq4tfzm7rf5222" />
          </div>
        </div>
      )}
    </div>
  );
}
