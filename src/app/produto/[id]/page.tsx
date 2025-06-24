import prisma from '@/lib/prisma';
import { getUser } from '@/lib/auth';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function ProdutoPage({ params }: { params: any }) {
  const user = await getUser();
  if (!user) return <div className="p-4">Não autenticado</div>;
  const produto = await prisma.produto.findFirst({ where: { id: Number(params.id), userId: user.id }, include: { cotacoes: { include: { fornecedor: true }, orderBy: { createdAt: 'desc' } } } });
  if (!produto) return <div className="p-4">Produto não encontrado</div>;
  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">{produto.nome}</h1>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left"><th>Fornecedor</th><th>Preço</th><th>Data</th></tr>
        </thead>
        <tbody>
          {produto.cotacoes.map(c => (
            <tr key={c.id}><td>{c.fornecedor.nome}</td><td>R$ {c.preco.toFixed(2)}</td><td>{c.createdAt.toLocaleDateString()}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
