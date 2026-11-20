'use client';

import { useCallback, useEffect, useState } from 'react';
import { Users, Download, Receipt, FileArchive } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { MeiImportPanel } from '@/components/admin/mei/MeiImportPanel';
import { MeiFiltros, FILTROS_VAZIOS, type MeiFiltrosValues } from '@/components/admin/mei/MeiFiltros';
import { MeiTabela, type MeiLeadRow } from '@/components/admin/mei/MeiTabela';
import { MeiExportModal } from '@/components/admin/mei/MeiExportModal';
import { MeiGerarCobrancasModal } from '@/components/admin/mei/MeiGerarCobrancasModal';
import { BoletosLoteModal } from '@/components/admin/mei/BoletosLoteModal';

const PER_PAGE = 25;

export default function MeiLeadsPage() {
  const [filtros, setFiltros] = useState<MeiFiltrosValues>(FILTROS_VAZIOS);
  const [page, setPage] = useState(1);
  const [data, setData] = useState<MeiLeadRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalFiltrado, setTotalFiltrado] = useState(0);
  const [totalGeral, setTotalGeral] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [exportOpen, setExportOpen] = useState(false);
  const [gerarOpen, setGerarOpen] = useState(false);
  const [boletosLoteOpen, setBoletosLoteOpen] = useState(false);

  const carregar = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), perPage: String(PER_PAGE) });
    Object.entries(filtros).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });

    try {
      const res = await fetch(`/api/mei?${params.toString()}`);
      const json = await res.json();
      setData(json.data);
      setTotalFiltrado(json.totalFiltrado);
      setTotalGeral(json.totalGeral);
      setTotalPages(json.totalPages);
    } finally {
      setLoading(false);
    }
  }, [page, filtros]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  function handleFiltrosChange(novos: MeiFiltrosValues) {
    setFiltros(novos);
    setPage(1);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Base de MEIs</h1>
          <p className="text-sm text-gray-500">Leads importados via CSV, para prospecção.</p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5">
          <Users className="h-4 w-4 text-brand" />
          <span className="text-sm text-gray-500">Total no banco:</span>
          <span className="text-sm font-semibold text-gray-900">
            {totalGeral.toLocaleString('pt-BR')}
          </span>
        </div>
      </div>

      <MeiImportPanel onFinished={carregar} />

      <MeiFiltros values={filtros} onChange={handleFiltrosChange} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-gray-500">
          {totalFiltrado.toLocaleString('pt-BR')} resultado(s)
        </p>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => setGerarOpen(true)}>
            <Receipt className="h-4 w-4" />
            Gerar cobranças
          </Button>
          <Button variant="secondary" onClick={() => setBoletosLoteOpen(true)}>
            <FileArchive className="h-4 w-4" />
            Subir boletos (.zip)
          </Button>
          <Button variant="secondary" onClick={() => setExportOpen(true)}>
            <Download className="h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      <MeiTabela
        data={data}
        loading={loading}
        page={page}
        perPage={PER_PAGE}
        totalPages={totalPages}
        totalFiltrado={totalFiltrado}
        onPageChange={setPage}
      />

      {exportOpen && (
        <MeiExportModal
          filtros={filtros}
          totalFiltrado={totalFiltrado}
          onClose={() => setExportOpen(false)}
        />
      )}

      {gerarOpen && (
        <MeiGerarCobrancasModal
          filtros={filtros}
          totalFiltrado={totalFiltrado}
          onClose={() => setGerarOpen(false)}
          onGerado={carregar}
        />
      )}

      {boletosLoteOpen && <BoletosLoteModal onClose={() => setBoletosLoteOpen(false)} />}
    </div>
  );
}
