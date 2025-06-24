import prisma from './prisma';

type MessagePayload = {
  text: string;
  session: string;
  from: string;
};

export async function processMessage(message: MessagePayload) {
  const { text } = message;
  const regex = /([A-Za-z0-9 ]+) -?\s*R\$\s*(\d+(?:[\.,]\d+)?)/i;
  const match = text.match(regex);
  if (!match) return;
  const name = match[1].trim();
  const price = parseFloat(match[2].replace(',', '.'));
  const fornecedorName = message.from;

  let produto = await prisma.produto.findFirst({ where: { nome: name } });
  if (!produto) {
    if (!message.session) return;
    const session = await prisma.session.findFirst({ where: { evolutionId: message.session } });
    if (!session) return;
    produto = await prisma.produto.create({ data: { nome: name, userId: session.userId } });
  }

  let fornecedor = await prisma.fornecedor.findFirst({ where: { nome: fornecedorName } });
  if (!fornecedor) {
    if (!message.session) return;
    const session = await prisma.session.findFirst({ where: { evolutionId: message.session } });
    if (!session) return;
    fornecedor = await prisma.fornecedor.create({ data: { nome: fornecedorName, userId: session.userId } });
  }

  await prisma.cotacao.create({ data: { produtoId: produto.id, fornecedorId: fornecedor.id, preco: price } });
}
