import React, { useEffect } from 'react';
import { useData } from '../contexts';
import { Card, Button, Spinner, Alert } from '../components/ui';
import { EvolutionSessionStatus } from '../types';

const ConnectWhatsAppPage: React.FC = () => {
  const { 
    evolutionSession, 
    createEvolutionSession, 
    checkEvolutionSessionStatus, 
    isLoadingData, // This is a general loading flag from context
    error 
  } = useData();

  const handleCreateSession = () => {
    createEvolutionSession();
  };

  const handleCheckStatus = () => {
    checkEvolutionSessionStatus();
  };
  
  // Auto-check status periodically if QR is shown or loading
  useEffect(() => {
    let intervalId: number | undefined; // Changed NodeJS.Timeout to number
    if (evolutionSession?.status === EvolutionSessionStatus.SCAN_QR_CODE || evolutionSession?.status === EvolutionSessionStatus.LOADING) {
      intervalId = setInterval(() => {
        if (document.visibilityState === 'visible') { // Only check if tab is active
          checkEvolutionSessionStatus();
        }
      }, 5000); // Check every 5 seconds
    }
    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [evolutionSession?.status]); // Dependency on checkEvolutionSessionStatus can cause loops if not memoized, but here it's from context


  const getStatusColor = (status: EvolutionSessionStatus) => {
    switch (status) {
      case EvolutionSessionStatus.CONNECTED: return "text-green-500";
      case EvolutionSessionStatus.ERROR:
      case EvolutionSessionStatus.DISCONNECTED: return "text-red-500";
      case EvolutionSessionStatus.SCAN_QR_CODE:
      case EvolutionSessionStatus.PENDING_QR: return "text-yellow-500";
      case EvolutionSessionStatus.LOADING: return "text-blue-500";
      default: return "text-secondary-500";
    }
  };
  
  const getStatusIcon = (status: EvolutionSessionStatus) => {
    switch (status) {
      case EvolutionSessionStatus.CONNECTED: return <ion-icon name="checkmark-circle-outline" className="text-2xl"></ion-icon>;
      case EvolutionSessionStatus.ERROR: return <ion-icon name="alert-circle-outline" className="text-2xl"></ion-icon>;
      case EvolutionSessionStatus.DISCONNECTED: return <ion-icon name="warning-outline" className="text-2xl"></ion-icon>;
      case EvolutionSessionStatus.SCAN_QR_CODE: return <ion-icon name="qr-code-outline" className="text-2xl"></ion-icon>;
      case EvolutionSessionStatus.LOADING: return <Spinner size="sm" className="w-6 h-6" />; // Spinner already handles its own animation and color
      default: return <ion-icon name="help-circle-outline" className="text-2xl"></ion-icon>;
    }
  }


  return (
    <div className="p-4 md:p-6 lg:p-8 flex flex-col items-center">
      <h1 className="text-3xl font-bold text-secondary-800 dark:text-secondary-100 mb-8 text-center">Conectar WhatsApp</h1>
      
      {error && <Alert type="error" message={`Erro: ${error}`} />}

      <Card glass className="w-full max-w-lg text-center">
        {!evolutionSession || evolutionSession.status === EvolutionSessionStatus.NOT_INITIALIZED ? (
          <>
            <ion-icon name="logo-whatsapp" className="text-6xl text-green-500 mx-auto mb-4"></ion-icon>
            <p className="mb-6 text-secondary-700 dark:text-secondary-300">
              Conecte sua conta do WhatsApp para permitir que o sistema leia as mensagens dos seus fornecedores e encontre os melhores preços automaticamente.
            </p>
            <Button 
              onClick={handleCreateSession} 
              isLoading={isLoadingData} 
              size="lg" 
              leftIcon={<ion-icon name="qr-code-outline"></ion-icon>}
            >
              Gerar QR Code para Conectar
            </Button>
          </>
        ) : (
          <>
            <div className={`flex items-center justify-center space-x-2 mb-2 font-semibold text-lg ${getStatusColor(evolutionSession.status)}`}>
              {getStatusIcon(evolutionSession.status)}
              <span>Status: {evolutionSession.statusMessage || evolutionSession.status.replace(/_/g, ' ')}</span>
            </div>

            {evolutionSession.status === EvolutionSessionStatus.SCAN_QR_CODE && evolutionSession.qrCodeUrl && (
              <div className="my-6">
                <p className="mb-2 text-secondary-700 dark:text-secondary-300">Escaneie este QR Code com o app WhatsApp no seu celular:</p>
                <img 
                    src={evolutionSession.qrCodeUrl} 
                    alt="WhatsApp QR Code" 
                    className="mx-auto rounded-lg border-4 border-white dark:border-secondary-700 shadow-lg"
                    width="256"
                    height="256"
                />
                 <p className="mt-2 text-xs text-secondary-500 dark:text-secondary-400">Este é um QR code de placeholder. Em uma aplicação real, seria gerado pela Evolution API.</p>
              </div>
            )}

            {(evolutionSession.status === EvolutionSessionStatus.ERROR || evolutionSession.status === EvolutionSessionStatus.DISCONNECTED) && (
                 <Button 
                    onClick={handleCreateSession} 
                    isLoading={isLoadingData} 
                    className="my-4" 
                    leftIcon={<ion-icon name="refresh-outline"></ion-icon>}
                  >
                    Tentar Gerar Novo QR Code
                </Button>
            )}

            {evolutionSession.status !== EvolutionSessionStatus.CONNECTED && evolutionSession.status !== EvolutionSessionStatus.LOADING && (
              <Button 
                onClick={handleCheckStatus} 
                variant="secondary" 
                className="my-4" 
                leftIcon={<ion-icon name="search-circle-outline"></ion-icon>}
              >
                Verificar Status da Conexão
              </Button>
            )}

            {evolutionSession.status === EvolutionSessionStatus.LOADING && (
                <div className="my-6 flex flex-col items-center">
                    <Spinner size="lg" />
                    <p className="mt-2 text-secondary-600 dark:text-secondary-400">Verificando status...</p>
                </div>
            )}
            
            {evolutionSession.status === EvolutionSessionStatus.CONNECTED && (
                 <div className="my-6 p-4 bg-green-100 dark:bg-green-800 rounded-lg text-green-700 dark:text-green-200">
                    <ion-icon name="checkmark-done-circle-outline" className="text-4xl mx-auto mb-2"></ion-icon>
                    <p className="font-semibold">WhatsApp conectado com sucesso!</p>
                    <p className="text-sm">O sistema agora pode receber e processar mensagens dos seus fornecedores.</p>
                </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
};

export default ConnectWhatsAppPage;