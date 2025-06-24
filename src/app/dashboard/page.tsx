import { getUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import Link from 'next/link';

export default async function Dashboard() {
  const user = await getUser();
  if (!user) return <div className="p-4">Não autenticado</div>;
  const produtos = await prisma.produto.findMany({
    where: { userId: user.id },
    include: { cotacoes: { include: { fornecedor: true }, orderBy: { preco: 'asc' }, take: 1 } }
  });

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <Link href="/session" className="underline">Conectar WhatsApp</Link>
      <div className="grid md:grid-cols-3 gap-4">
        {produtos.map(p => (
          <div key={p.id} className="bg-white/20 backdrop-blur p-4 rounded">
            <h2 className="font-semibold">{p.nome}</h2>
            {p.cotacoes[0] ? (
              <p>Melhor preço: R$ {p.cotacoes[0].preco.toFixed(2)} por {p.cotacoes[0].fornecedor.nome}</p>
            ) : (
              <p>Sem cotações</p>
            )}
            <Link href={`/produto/${p.id}`} className="text-sm underline">ver histórico</Link>
          </div>
        ))}
      </div>
    </div>
  );
}
