'use client';

import { useRef, useEffect } from 'react';
import { Bold, Italic } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  label?: string;
}

// Editor simples de texto rico (negrito / itálico) usando contentEditable.
// É "não controlado" após a montagem inicial para não perder a posição do
// cursor a cada tecla — só escreve de volta pro estado do formulário pai.
export function RichTextEditor({ value, onChange, label }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (editorRef.current && !initialized.current) {
      editorRef.current.innerHTML = value || '';
      initialized.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function exec(command: 'bold' | 'italic') {
    editorRef.current?.focus();
    document.execCommand(command);
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  }

  return (
    <div className="flex flex-col gap-1.5">
      {label && <span className="text-sm font-medium text-gray-700">{label}</span>}
      <div className="overflow-hidden rounded-lg border border-gray-300 focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/20">
        <div className="flex gap-1 border-b border-gray-200 bg-gray-50 px-2 py-1.5">
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              exec('bold');
            }}
            className="rounded-md p-1.5 text-brand hover:bg-brand-light"
            aria-label="Negrito"
          >
            <Bold className="h-4 w-4" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              exec('italic');
            }}
            className="rounded-md p-1.5 text-brand hover:bg-brand-light"
            aria-label="Itálico"
          >
            <Italic className="h-4 w-4" />
          </button>
        </div>
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={(e) => onChange(e.currentTarget.innerHTML)}
          className={cn(
            'min-h-[110px] w-full px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none',
            '[&_strong]:font-bold [&_b]:font-bold [&_em]:italic [&_i]:italic'
          )}
        />
      </div>
      <span className="text-xs text-gray-400">
        Selecione um trecho do texto e use os botões acima para negrito ou itálico.
      </span>
    </div>
  );
}
