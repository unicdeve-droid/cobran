import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { getConfig, saveConfig, DEFAULT_CONFIG } from '@/lib/config';

export async function GET() {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  const config = await getConfig();
  return NextResponse.json(config);
}

export async function PUT(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const allowedKeys = Object.keys(DEFAULT_CONFIG);
    const values: Record<string, string> = {};

    for (const key of allowedKeys) {
      if (typeof body[key] === 'string') {
        values[key] = body[key];
      }
    }

    await saveConfig(values);
    const config = await getConfig();
    return NextResponse.json(config);
  } catch (error) {
    console.error('Erro ao salvar configurações:', error);
    return NextResponse.json(
      { error: 'Erro interno ao salvar configurações.' },
      { status: 500 }
    );
  }
}
