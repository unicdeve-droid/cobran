import { notFound } from 'next/navigation';

// A raiz do site não redireciona mais pro painel: se redirecionasse, qualquer
// visitante do domínio veria o caminho secreto na barra de endereço. Sem uma
// rota pública própria, o certo é se comportar como qualquer URL desconhecida.
export default function HomePage() {
  notFound();
}
