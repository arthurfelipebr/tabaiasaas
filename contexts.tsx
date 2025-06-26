
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, ThemeContextType, AuthContextType, DataContextType, EvolutionSession, EvolutionSessionStatus, Product, Supplier, Quote, RawMessage } from './types';
import { THEME_STORAGE_KEY, AUTH_STORAGE_KEY, EVOLUTION_SESSION_STORAGE_KEY } from './constants';
import { 
  mockLogin, mockSignup, mockLogout, mockGetCurrentUser, 
  mockCreateEvolutionSession, mockCheckEvolutionSessionStatus, 
  mockFetchDashboardData, mockGetProductDetails, 
  mockSimulateIncomingMessage, mockProcessPendingMessages,
  mockRefreshData
} from './services'; // Assuming services.ts exports these

// Theme Context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    if (storedTheme) return storedTheme === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem(THEME_STORAGE_KEY, 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem(THEME_STORAGE_KEY, 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(prev => !prev);

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};

// Auth Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadUser = async () => {
      setIsLoading(true);
      const user = await mockGetCurrentUser();
      setCurrentUser(user);
      setIsLoading(false);
    };
    loadUser();
  }, []);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const user = await mockLogin(email, pass);
      setCurrentUser(user);
    } catch (error) {
      setCurrentUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (name: string, email: string, pass: string) => {
    setIsLoading(true);
    try {
      const user = await mockSignup(name, email, pass);
      setCurrentUser(user);
    } catch (error) {
      setCurrentUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    await mockLogout();
    setCurrentUser(null);
    setIsLoading(false);
    // Also clear other user-specific data from storage if needed.
    localStorage.removeItem(EVOLUTION_SESSION_STORAGE_KEY);
  };

  return (
    <AuthContext.Provider value={{ currentUser, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};


// Data Context
const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const { currentUser } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [rawMessages, setRawMessages] = useState<RawMessage[]>([]);
  const [evolutionSession, setEvolutionSession] = useState<EvolutionSession | null>(null);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadInitialData = useCallback(async () => {
    if (!currentUser) {
      setProducts([]);
      setSuppliers([]);
      setQuotes([]);
      setRawMessages([]);
      setEvolutionSession(null);
      return;
    }
    setIsLoadingData(true);
    setError(null);
    try {
      const data = await mockFetchDashboardData(currentUser.id);
      setProducts(data.products);
      setSuppliers(data.suppliers);
      setQuotes(data.quotes);
      setRawMessages(data.rawMessages);
      
      const storedSession = localStorage.getItem(EVOLUTION_SESSION_STORAGE_KEY);
      if (storedSession) {
        const parsedSession: EvolutionSession = JSON.parse(storedSession);
        if(parsedSession.userId === currentUser.id) {
            setEvolutionSession(parsedSession);
        } else {
            localStorage.removeItem(EVOLUTION_SESSION_STORAGE_KEY); // Stale session for different user
            setEvolutionSession({ id: '', userId: currentUser.id, instanceName: '', status: EvolutionSessionStatus.NOT_INITIALIZED });
        }
      } else {
        setEvolutionSession({ id: '', userId: currentUser.id, instanceName: '', status: EvolutionSessionStatus.NOT_INITIALIZED });
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setIsLoadingData(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id]);


  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);


  const fetchDashboardData = async () => {
    await loadInitialData();
  };
  
  const refreshData = async () => {
    if (!currentUser) return;
    setIsLoadingData(true);
    try {
      const data = await mockRefreshData(currentUser.id);
      setProducts(data.products);
      setSuppliers(data.suppliers);
      setQuotes(data.quotes);
      setRawMessages(data.rawMessages);
      setError(null);
    } catch (err) {
       setError(err instanceof Error ? err.message : 'Failed to refresh data');
    } finally {
      setIsLoadingData(false);
    }
  };


  const getProductDetails = (productId: string) => {
    const product = products.find(p => p.id === productId);
    const productQuotes = quotes.filter(q => q.productId === productId).sort((a,b) => b.extractedAt.getTime() - a.extractedAt.getTime());
    return { product, quotes: productQuotes };
  };

  const createEvolutionSession = async () => {
    if (!currentUser) return;
    setIsLoadingData(true);
    setError(null);
    try {
      const session = await mockCreateEvolutionSession(currentUser.id);
      setEvolutionSession(session);
      localStorage.setItem(EVOLUTION_SESSION_STORAGE_KEY, JSON.stringify(session));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create session');
      const errorSession : EvolutionSession = { id: '', userId: currentUser.id, instanceName: '', status: EvolutionSessionStatus.ERROR, statusMessage: err instanceof Error ? err.message : 'Failed to create session' };
      setEvolutionSession(errorSession);
      localStorage.setItem(EVOLUTION_SESSION_STORAGE_KEY, JSON.stringify(errorSession));
    } finally {
      setIsLoadingData(false);
    }
  };

  const checkEvolutionSessionStatus = async () => {
    if (!currentUser || !evolutionSession || !evolutionSession.instanceName) return;
    // To avoid rapid calls, set loading on the session itself
    setEvolutionSession(prev => prev ? {...prev, status: EvolutionSessionStatus.LOADING} : null);
    setError(null);
    try {
      const updatedSession = await mockCheckEvolutionSessionStatus(evolutionSession.instanceName, currentUser.id);
      setEvolutionSession(updatedSession);
      localStorage.setItem(EVOLUTION_SESSION_STORAGE_KEY, JSON.stringify(updatedSession));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check session status');
      const errorSession : EvolutionSession = { ...evolutionSession, status: EvolutionSessionStatus.ERROR, statusMessage: err instanceof Error ? err.message : 'Failed to check status' };
      setEvolutionSession(errorSession);
      localStorage.setItem(EVOLUTION_SESSION_STORAGE_KEY, JSON.stringify(errorSession));
    }
  };

  const simulateIncomingMessage = async (messageContent: string, sender: string) => {
     if (!currentUser) return;
     setIsLoadingData(true); // Or a more specific loading state
     setError(null);
     try {
       await mockSimulateIncomingMessage(currentUser.id, messageContent, sender);
       await refreshData(); // Refresh data to see new message and potentially processed info
     } catch (err) {
       setError(err instanceof Error ? err.message : 'Failed to simulate message');
     } finally {
       setIsLoadingData(false);
     }
  };
  
  const processPendingMessages = async () => {
    if(!currentUser) return;
    setIsLoadingData(true);
    setError(null);
    try {
        await mockProcessPendingMessages(currentUser.id);
        await refreshData(); // Refresh data to reflect processed messages
    } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to process messages');
    } finally {
        setIsLoadingData(false);
    }
  };

  return (
    <DataContext.Provider value={{ 
      products, suppliers, quotes, rawMessages, evolutionSession, 
      isLoadingData, error, fetchDashboardData, getProductDetails, 
      createEvolutionSession, checkEvolutionSessionStatus, simulateIncomingMessage, processPendingMessages,
      refreshData
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within a DataProvider');
  return context;
};
