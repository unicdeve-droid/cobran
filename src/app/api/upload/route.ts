import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { randomUUID } from 'crypto';
import { uploadFile } from '@/lib/imagekit';

// Uploads vão pro ImageKit (CDN externo) em vez de disco local. Na Vercel,
// cada execução roda numa máquina efêmera sem armazenamento persistente —
// um arquivo gravado com fs.writeFile desapareceria na próxima requisição.

const ALLOWED_TYPES: Record<string, { ext: string; maxSizeMb: number }> = {
  'image/png': { ext: 'png', maxSizeMb: 3 },
  'application/pdf': { ext: 'pdf', maxSizeMb: 8 },
};

export async function POST(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!(file instanceof Blob)) {
      return NextResponse.json({ error: 'Arquivo não enviado.' }, { status: 400 });
    }

    const allowed = ALLOWED_TYPES[file.type];
    if (!allowed) {
      return NextResponse.json(
        { error: 'Apenas arquivos PNG ou PDF são aceitos.' },
        { status: 400 }
      );
    }
    if (file.size > allowed.maxSizeMb * 1024 * 1024) {
      return NextResponse.json(
        { error: `O arquivo precisa ter no máximo ${allowed.maxSizeMb}MB.` },
        { status: 400 }
      );
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    const filename = `${randomUUID()}.${allowed.ext}`;
    const url = await uploadFile(bytes, filename);

    return NextResponse.json({ url });
  } catch (error) {
    console.error('Erro no upload:', error);
    return NextResponse.json({ error: 'Erro interno no upload.' }, { status: 500 });
  }
}
