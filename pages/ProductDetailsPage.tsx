import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useData, useAuth } from '../contexts';
import { Card, Button, Spinner, Alert } from '../components/ui';
import { Product, Quote } from '../types'; // Removed unused Supplier import
// Note: Recharts for charts would be great here but adds complexity.
// For now, a simple table/list.

const ProductDetailsPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const { getProductDetails, isLoadingData, error, suppliers, rawMessages } = useData(); // Removed fetchDashboardData as it was commented out
  const { currentUser } = useAuth();
  
  const [details, setDetails] = useState<{ product: Product | undefined; quotes: Quote[] } | null>(null);

  useEffect(() => {
    // Re-fetch data to ensure it's fresh, or rely on existing context data
    // For simplicity, let's assume data is reasonably up-to-date or refetch if needed
    if (currentUser && productId) {
        // fetchDashboardData(); // Potentially refresh all data. Or rely on DataContext internal refresh
        const productData = getProductDetails(productId);
        setDetails(productData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId, currentUser, getProductDetails]); // getProductDetails might change if products/quotes change

  if (isLoadingData && !details) {
    return <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>;
  }

  if (error) {
    return <Alert type="error" message={`Erro: ${error}`} />;
  }

  if (!details || !details.product) {
    return (
      <div className="p-4 md:p-6 lg:p-8 text-center">
        <Alert type="warning" message="Produto não encontrado." />
        <Link to="/dashboard">
          <Button className="mt-4">Voltar ao Dashboard</Button>
        </Link>
      </div>
    );
  }

  const { product, quotes } = details;

  const getSupplierName = (supplierId: string): string => {
    const supplier = suppliers.find(s => s.id === supplierId);
    return supplier?.name || 'Fornecedor Desconhecido';
  };
  
  const getRawMessageContent = (rawMessageId: string): string => {
    const message = rawMessages.find(m => m.id === rawMessageId);
    return message?.content.substring(0, 100) + (message && message.content.length > 100 ? '...' : '') || 'Mensagem original não encontrada.';
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
            <h1 className="text-3xl font-bold text-secondary-800 dark:text-secondary-100">{product.name}</h1>
            {product.bestPrice && (
                 <p className="text-lg text-primary-600 dark:text-primary-400">
                    Melhor Preço Atual: <span className="font-bold">R$ {product.bestPrice.toFixed(2)}</span> (Fornecedor: {product.bestSupplierName})
                </p>
            )}
        </div>
        <Link to="/dashboard">
          <Button variant="secondary" leftIcon={<ion-icon name="arrow-back-outline"></ion-icon>}>
            Voltar ao Dashboard
          </Button>
        </Link>
      </div>

      <Card glass>
        <h2 className="text-xl font-semibold mb-4 text-secondary-700 dark:text-secondary-200">Histórico de Cotações</h2>
        {quotes.length === 0 ? (
          <p className="text-secondary-600 dark:text-secondary-400">Nenhuma cotação registrada para este produto.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-secondary-200 dark:divide-secondary-700">
              <thead className="bg-secondary-50 dark:bg-secondary-800">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">Data</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">Fornecedor</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">Preço</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">Condições</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider hidden md:table-cell">Mensagem Original (trecho)</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-secondary-800/50 divide-y divide-secondary-200 dark:divide-secondary-700/50">
                {quotes.map(quote => (
                  <tr key={quote.id} className="hover:bg-secondary-50 dark:hover:bg-secondary-700/50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-secondary-700 dark:text-secondary-300">{new Date(quote.extractedAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-secondary-700 dark:text-secondary-300">{getSupplierName(quote.supplierId)}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-secondary-800 dark:text-secondary-100">R$ {quote.price.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm text-secondary-600 dark:text-secondary-400 max-w-xs truncate" title={quote.conditions}>{quote.conditions || '-'}</td>
                    <td className="px-4 py-3 text-xs text-secondary-500 dark:text-secondary-400 hidden md:table-cell max-w-sm truncate" title={getRawMessageContent(quote.rawMessageId)}>{getRawMessageContent(quote.rawMessageId)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      
      {/* Placeholder for future chart implementation */}
      <div className="mt-8 text-center text-sm text-secondary-500 dark:text-secondary-400">
        <p>(Em breve: Gráfico de histórico de preços aqui. Use uma biblioteca como Recharts para visualização.)</p>
      </div>

    </div>
  );
};

export default ProductDetailsPage;