'use client';

import { useState } from 'react';
import { Mail } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { GerarEmailsModal } from '@/components/admin/GerarEmailsModal';

export function GerarEmailsButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        <Mail className="h-4 w-4" />
        Gerar emails
      </Button>
      {open && <GerarEmailsModal onClose={() => setOpen(false)} />}
    </>
  );
}
