import ImageKit, { toFile } from '@imagekit/nodejs';

// Cliente do ImageKit pra upload de arquivos (logo, imagem de fundo do header,
// imagem do rodapé do email, boletos em PDF). Substitui o armazenamento em
// disco (fs.writeFile): na Vercel cada execução roda numa máquina efêmera,
// sem disco persistente entre requisições, então qualquer arquivo salvo
// localmente desapareceria.
const client = new ImageKit({
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
});

// Envia um buffer pro ImageKit e devolve a URL pública definitiva do arquivo.
export async function uploadFile(buffer: Buffer, fileName: string): Promise<string> {
  const response = await client.files.upload({
    file: await toFile(buffer, fileName),
    fileName,
  });
  if (!response.url) {
    throw new Error('Upload para o ImageKit não retornou uma URL.');
  }
  return response.url;
}
