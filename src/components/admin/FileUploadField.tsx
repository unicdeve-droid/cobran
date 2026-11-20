'use client';

import { useRef, useState } from 'react';
import { Upload, X, Loader2, ImageIcon, FileText, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploadFieldProps {
  label?: string;
  value: string;
  onChange: (url: string) => void;
  kind?: 'image' | 'pdf';
}

const KIND_CONFIG = {
  image: {
    accept: 'image/png',
    mimeType: 'image/png',
    maxSizeMb: 3,
    errorMessage: 'O arquivo precisa ser uma imagem PNG.',
    uploadLabel: 'Enviar PNG',
    changeLabel: 'Trocar imagem',
  },
  pdf: {
    accept: 'application/pdf',
    mimeType: 'application/pdf',
    maxSizeMb: 8,
    errorMessage: 'O arquivo precisa ser um PDF.',
    uploadLabel: 'Enviar PDF',
    changeLabel: 'Trocar PDF',
  },
};

export function FileUploadField({ label, value, onChange, kind = 'image' }: FileUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const config = KIND_CONFIG[kind];

  async function handleFile(file: File) {
    setError('');
    if (file.type !== config.mimeType) {
      setError(config.errorMessage);
      return;
    }
    if (file.size > config.maxSizeMb * 1024 * 1024) {
      setError(`O arquivo precisa ter no máximo ${config.maxSizeMb}MB.`);
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Falha no upload');
      }
      const data = await res.json();
      onChange(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha no upload');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      {label && <span className="text-sm font-medium text-gray-700">{label}</span>}
      <div className="flex items-center gap-3">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-dashed border-gray-300 bg-gray-50">
          {value ? (
            kind === 'pdf' ? (
              <FileText className="h-6 w-6 text-brand" />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={value} alt="Preview" className="h-full w-full object-contain" />
            )
          ) : kind === 'pdf' ? (
            <FileText className="h-6 w-6 text-gray-300" />
          ) : (
            <ImageIcon className="h-6 w-6 text-gray-300" />
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={uploading}
              onClick={() => inputRef.current?.click()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-brand px-3 py-1.5 text-xs font-medium text-brand hover:bg-brand-light disabled:opacity-60"
            >
              {uploading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Upload className="h-3.5 w-3.5" />
              )}
              {value ? config.changeLabel : config.uploadLabel}
            </button>
            {value && kind === 'pdf' && (
              <a
                href={value}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Ver PDF
              </a>
            )}
            {value && (
              <button
                type="button"
                onClick={() => onChange('')}
                className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-50"
              >
                <X className="h-3.5 w-3.5" />
                Remover
              </button>
            )}
          </div>
          {error && <span className="text-xs text-red-600">{error}</span>}
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={config.accept}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = '';
        }}
      />
    </div>
  );
}
