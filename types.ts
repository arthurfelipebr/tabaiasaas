
export interface User {
  id: string;
  email: string;
  name: string;
}

export enum EvolutionSessionStatus {
  NOT_INITIALIZED = 'NOT_INITIALIZED',
  PENDING_QR = 'PENDING_QR',
  SCAN_QR_CODE = 'SCAN_QR_CODE',
  CONNECTED = 'CONNECTED',
  DISCONNECTED = 'DISCONNECTED',
  ERROR = 'ERROR',
  LOADING = 'LOADING',
}

export interface EvolutionSession {
  id: string;
  userId: string;
  instanceName: string;
  qrCodeUrl?: string; // URL to the QR code image, or base64 data URI
  status: EvolutionSessionStatus;
  statusMessage?: string;
}

export interface Supplier {
  id: string;
  name: string;
  userId: string; // Ensure suppliers are user-specific
}

export interface Product {
  id: string;
  name: string;
  userId: string; // Ensure products are user-specific
  bestPrice?: number;
  bestSupplierName?: string;
}

export interface Quote {
  id: string;
  productId: string;
  supplierId: string;
  price: number;
  conditions?: string; // e.g., payment terms, delivery prazo
  extractedAt: Date;
  rawMessageId: string;
  userId: string;
}

export interface RawMessage {
  id: string;
  userId: string;
  sender: string; // Phone number or contact name
  content: string;
  timestamp: Date;
  processed: boolean;
  processingError?: string;
}

// Context Types
export interface ThemeContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  signup: (name: string, email: string, pass: string) => Promise<void>;
  logout: () => void;
}

export interface DataContextType {
  products: Product[];
  suppliers: Supplier[];
  quotes: Quote[];
  rawMessages: RawMessage[];
  evolutionSession: EvolutionSession | null;
  isLoadingData: boolean;
  error: string | null;
  fetchDashboardData: () => Promise<void>;
  getProductDetails: (productId: string) => { product: Product | undefined; quotes: Quote[] };
  createEvolutionSession: () => Promise<void>;
  checkEvolutionSessionStatus: () => Promise<void>;
  simulateIncomingMessage: (messageContent: string, sender: string) => Promise<void>;
  processPendingMessages: () => Promise<void>;
  refreshData: () => Promise<void>;
}

export interface ExtractedInfo {
  productName: string;
  price: number;
  supplierName: string;
  conditions?: string;
}
