export function HeaderLogo({
  logoUrl,
  bgImageUrl,
}: {
  logoUrl: string;
  bgImageUrl?: string;
}) {
  return (
    <header className={bgImageUrl ? 'relative w-full' : 'border-b border-gray-100 bg-white'}>
      {bgImageUrl && (
        // Renderiza a imagem como <img> (não como background-image) para que
        // a altura do header seja sempre a altura natural DESSA imagem —
        // qualquer proporção enviada aparece inteira, sem cortar e sem
        // esticar. Nada de proporção fixa cravada no código.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={bgImageUrl} alt="" className="block h-auto w-full" />
      )}
      <div
        className={
          bgImageUrl
            ? 'absolute inset-0 mx-auto flex max-w-2xl items-center px-6'
            : 'mx-auto flex h-full max-w-2xl items-center px-6 py-4'
        }
      >
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoUrl} alt="Logo" className="h-8 w-auto object-contain" />
        ) : (
          !bgImageUrl && (
            <span className="text-sm font-semibold text-gray-300">Logo da empresa</span>
          )
        )}
      </div>
    </header>
  );
}
