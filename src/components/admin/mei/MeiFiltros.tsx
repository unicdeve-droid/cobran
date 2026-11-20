'use client';

import { useEffect, useState } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';

export interface MeiFiltrosValues {
  uf: string;
  municipioCodigo: string;
  modulo: string;
  cnae: string;
  dataDe: string;
  dataAte: string;
  busca: string;
}

export const FILTROS_VAZIOS: MeiFiltrosValues = {
  uf: '',
  municipioCodigo: '',
  modulo: '',
  cnae: '',
  dataDe: '',
  dataAte: '',
  busca: '',
};

interface Opcoes {
  ufs: string[];
  modulos: string[];
  cnaes: string[];
  municipios: { codigo: string; nome: string | null }[];
}

export function MeiFiltros({
  values,
  onChange,
}: {
  values: MeiFiltrosValues;
  onChange: (values: MeiFiltrosValues) => void;
}) {
  const [opcoes, setOpcoes] = useState<Opcoes>({
    ufs: [],
    modulos: [],
    cnaes: [],
    municipios: [],
  });

  useEffect(() => {
    const params = values.uf ? `?uf=${values.uf}` : '';
    fetch(`/api/mei/opcoes${params}`)
      .then((res) => res.json())
      .then(setOpcoes)
      .catch(() => {});
  }, [values.uf]);

  function set<K extends keyof MeiFiltrosValues>(key: K, value: MeiFiltrosValues[K]) {
    if (key === 'uf') {
      onChange({ ...values, uf: value, municipioCodigo: '' });
    } else {
      onChange({ ...values, [key]: value });
    }
  }

  const temFiltroAtivo = Object.values(values).some((v) => v !== '');

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Select label="UF" value={values.uf} onChange={(e) => set('uf', e.target.value)}>
          <option value="">Todas</option>
          {opcoes.ufs.map((uf) => (
            <option key={uf} value={uf}>
              {uf}
            </option>
          ))}
        </Select>

        <Select
          label="Município"
          value={values.municipioCodigo}
          onChange={(e) => set('municipioCodigo', e.target.value)}
          disabled={!values.uf}
        >
          <option value="">{values.uf ? 'Todos' : 'Selecione a UF primeiro'}</option>
          {opcoes.municipios.map((m) => (
            <option key={m.codigo} value={m.codigo}>
              {m.nome ?? `Código ${m.codigo}`}
            </option>
          ))}
        </Select>

        <Select label="Módulo" value={values.modulo} onChange={(e) => set('modulo', e.target.value)}>
          <option value="">Todos</option>
          {opcoes.modulos.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </Select>

        <Select label="CNAE" value={values.cnae} onChange={(e) => set('cnae', e.target.value)}>
          <option value="">Todos</option>
          {opcoes.cnaes.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>

        <Input
          label="Aberta de"
          type="date"
          value={values.dataDe}
          onChange={(e) => set('dataDe', e.target.value)}
        />
        <Input
          label="Aberta até"
          type="date"
          value={values.dataAte}
          onChange={(e) => set('dataAte', e.target.value)}
        />

        <div className="col-span-2">
          <Input
            label="Buscar por nome ou CNPJ"
            value={values.busca}
            onChange={(e) => set('busca', e.target.value)}
            placeholder="Digite parte do nome ou o CNPJ"
          />
        </div>
      </div>

      {temFiltroAtivo && (
        <div>
          <Button variant="ghost" onClick={() => onChange(FILTROS_VAZIOS)}>
            <X className="h-4 w-4" />
            Limpar filtros
          </Button>
        </div>
      )}
    </div>
  );
}
