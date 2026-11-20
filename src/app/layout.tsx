import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Sistema de Cobranças',
  description: 'Painel de cobranças e regularização de débitos',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        {/* eslint-disable @next/next/no-page-custom-font */}
        {/* Fonte oficial do Design System de Governo Digital (OFL) */}
        <link
          rel="stylesheet"
          href="https://cdngovbr-ds.estaleiro.serpro.gov.br/design-system/fonts/rawline/css/rawline.css"
        />
        {/* Raleway via Google Fonts como alternativa: é a base da Rawline (OFL),
            garante uma aparência quase idêntica caso o CDN acima esteja indisponível. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Raleway:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        {/* eslint-enable @next/next/no-page-custom-font */}
      </head>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
