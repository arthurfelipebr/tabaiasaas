import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useData, useAuth } from '../contexts';
import { Card, Button, Spinner, Alert, Input } from '../components/ui';
import { Product, EvolutionSessionStatus } from '../types';
import { GEMINI_API_KEY } from '../constants';

const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  return (
    <Card glass className="hover:shadow-xl transition-shadow duration-300">
      <h3 className="text-xl font-semibold text-primary-700 dark:text-primary-300 truncate">{product.name}</h3>
      {product.bestPrice !== undefined ? (
        <>
          <p className="text-3xl font-bold text-secondary-800 dark:text-secondary-100 mt-2">
            R$ {product.bestPrice.toFixed(2)}
          </p>
          <p className="text-sm text-secondary-600 dark:text-secondary-400">
            Melhor fornecedor: {product.bestSupplierName || 'N/A'}
          </p>
        </>
      ) : (
        <p className="text-secondary-600 dark:text-secondary-400 mt-2">Nenhuma cotação encontrada.</p>
      )}
      <Link to={`/products/${product.id}/history`}>
        <Button variant="ghost" size="sm" className="mt-4 w-full">
          Ver Histórico / Fornecedores
          <ion-icon name="arrow-forward-outline" className="ml-2"></ion-icon>
        </Button>
      </Link>
    </Card>
  );
};

const DashboardPage: React.FC = () => {
  const { 
    products, 
    isLoadingData, 
    error, 
    fetchDashboardData, 
    evolutionSession,
    simulateIncomingMessage,
    processPendingMessages,
    rawMessages
  } = useData();
  const { currentUser } = useAuth();
  const [showDataEntry, setShowDataEntry] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [newSender, setNewSender] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]); // fetchDashboardData itself depends on currentUser now.

  const handleSimulateMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage || !newSender) return;
    setIsSimulating(true);
    await simulateIncomingMessage(newMessage, newSender);
    setNewMessage('');
    // setNewSender(''); // Keep sender for multiple entries from same supplier
    setIsSimulating(false);
  };
  
  const handleProcessMessages = async () => {
    setIsProcessing(true);
    await processPendingMessages();
    setIsProcessing(false);
  };

  const unProcessedMessagesCount = rawMessages.filter(m => !m.processed).length;

  if (isLoadingData && products.length === 0) {
    return <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>;
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-secondary-800 dark:text-secondary-100">Dashboard</h1>
        <div className="flex gap-2 mt-4 sm:mt-0 flex-wrap">
         {GEMINI_API_KEY && unProcessedMessagesCount > 0 && (
            <Button 
              onClick={handleProcessMessages} 
              isLoading={isProcessing}
              variant="secondary"
              leftIcon={<ion-icon name="analytics-outline"></ion-icon>}
            >
              Processar {unProcessedMessagesCount} Mensagen{unProcessedMessagesCount > 1 ? 's' : ''}
            </Button>
          )}
          {!GEMINI_API_KEY && (
             <span className="text-xs text-amber-600 dark:text-amber-400 p-2 bg-amber-100 dark:bg-amber-900 rounded">
                API Key do Gemini não configurada. Processamento de mensagens desabilitado.
            </span>
          )}
          <Button onClick={() => setShowDataEntry(!showDataEntry)} variant="secondary" leftIcon={<ion-icon name={showDataEntry ? "close-outline" : "add-outline"}></ion-icon>}>
            {showDataEntry ? 'Fechar Entrada Manual' : 'Entrada Manual de Mensagem'}
          </Button>
        </div>
      </div>

      {error && <Alert type="error" message={`Erro: ${error}`} />}

      {evolutionSession?.status !== EvolutionSessionStatus.CONNECTED && (
        <Alert type="warning" message="WhatsApp não conectado. A leitura automática de mensagens está desabilitada.">
          <Link to="/whatsapp-connect">
            <Button size="sm" variant="primary" className="ml-0 mt-2 sm:mt-0 sm:ml-4">Conectar WhatsApp</Button>
          </Link>
        </Alert>
      )}
      
      {showDataEntry && (
        <Card glass className="mb-6">
          <h2 className="text-xl font-semibold mb-3">Simular Mensagem de Fornecedor</h2>
          <form onSubmit={handleSimulateMessage} className="space-y-3">
            <Input 
              label="Nome/Número do Fornecedor"
              value={newSender}
              onChange={(e) => setNewSender(e.target.value)}
              placeholder="Ex: Fornecedor XYZ ou (11) 99999-8888"
              required
            />
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Cole a mensagem do fornecedor aqui... Ex: 'Produto ABC por R$10,50. Validade 2 dias.'"
              rows={3}
              className="block w-full px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-md shadow-sm placeholder-secondary-400 dark:placeholder-secondary-500 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-white dark:bg-secondary-800 text-secondary-900 dark:text-secondary-100"
              required
            />
            <Button type="submit" isLoading={isSimulating} leftIcon={<ion-icon name="send-outline"></ion-icon>}>
              Adicionar e Processar Depois
            </Button>
          </form>
        </Card>
      )}

      {products.length === 0 && !isLoadingData && (
        <Card glass className="text-center py-10">
          <ion-icon name="cube-outline" className="text-5xl text-secondary-400 dark:text-secondary-500 mx-auto"></ion-icon>
          <h2 className="mt-4 text-xl font-semibold">Nenhum produto encontrado.</h2>
          <p className="text-secondary-600 dark:text-secondary-400 mt-1">
            Conecte seu WhatsApp ou adicione mensagens manualmente para começar.
          </p>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default DashboardPage;