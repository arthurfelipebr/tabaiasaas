import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { User, EvolutionSession, EvolutionSessionStatus, Product, Supplier, Quote, RawMessage, ExtractedInfo } from './types';
import { GEMINI_API_KEY, GEMINI_MODEL_TEXT, MOCK_EVOLUTION_INSTANCE_NAME, AUTH_STORAGE_KEY, EVOLUTION_SESSION_STORAGE_KEY } from './constants';

// --- Gemini AI Service ---
let ai: GoogleGenAI | null = null;
if (GEMINI_API_KEY) {
  ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
} else {
  console.warn("Gemini API Key is not configured. Message processing will be disabled.");
}

export const extractInfoFromMessageViaGemini = async (messageContent: string): Promise<ExtractedInfo | null> => {
  if (!ai) {
    console.error("Gemini AI client not initialized. API Key missing?");
    return null;
  }

  const prompt = `
    Analyze the following supplier message and extract the product name, price, supplier name, and any specific conditions (like payment terms or delivery deadlines).
    The supplier name might be implicit from the sender or context, if not explicitly stated, try to infer or leave it null.
    Return the information as a JSON object with keys: "productName", "price" (as a number), "supplierName" (string or null), "conditions" (string or null).
    If multiple products are mentioned, focus on the first clearly identifiable one or the most prominent one.
    If crucial information like product name or price is missing, return null.

    Example Message 1: "Hi, we have new stock of 'Premium Coffee Beans' at $25.50 per kg. Payment 30 days. - The Coffee Co."
    Expected JSON: {"productName": "Premium Coffee Beans", "price": 25.50, "supplierName": "The Coffee Co.", "conditions": "Payment 30 days."}

    Example Message 2: " oferta especial SSD Kingston 1TB por R$350,00. Validade 2 dias. Estoque limitado."
    Expected JSON: {"productName": "SSD Kingston 1TB", "price": 350.00, "supplierName": null, "conditions": "Validade 2 dias. Estoque limitado."}
    
    Example Message 3: "Super promoção: açucar cristal marca DoceLar, pacote 5kg por apenas 18,90. Falar com Vendas."
    Expected JSON: {"productName": "Açucar cristal DoceLar 5kg", "price": 18.90, "supplierName": null, "conditions": "Falar com Vendas."}

    Message to analyze:
    "${messageContent}"

    JSON Output:
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_MODEL_TEXT,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.2, // Lower temperature for more deterministic extraction
      },
    });

    let jsonStr = response.text.trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim();
    }
    
    const parsedData = JSON.parse(jsonStr) as ExtractedInfo;
    
    // Basic validation
    if (!parsedData.productName || typeof parsedData.price !== 'number' || parsedData.price <=0) {
        console.warn("Gemini extraction missing crucial fields or invalid price:", parsedData);
        return null;
    }
    return parsedData;

  } catch (error) {
    console.error("Error calling Gemini API or parsing response:", error);
    return null;
  }
};

// --- Mock Data Store ---
// Simulates a database. In a real app, this would be Prisma + SQLite/Postgres.
// Data is scoped by userId.
interface MockDB {
  users: User[];
  evolutionSessions: EvolutionSession[];
  products: Product[];
  suppliers: Supplier[];
  quotes: Quote[];
  rawMessages: RawMessage[];
}

let db: MockDB = {
  users: [
    { id: 'user-001', email: 'test@example.com', name: 'Test User' }
  ],
  evolutionSessions: [],
  products: [],
  suppliers: [],
  quotes: [],
  rawMessages: [],
};

// Helper to persist to localStorage (optional, for some persistence during dev)
const loadDb = () => {
    const storedDb = localStorage.getItem('mockDb');
    if (storedDb) {
        db = JSON.parse(storedDb);
        // Ensure dates are parsed correctly
        db.quotes.forEach(q => q.extractedAt = new Date(q.extractedAt));
        db.rawMessages.forEach(m => m.timestamp = new Date(m.timestamp));

    }
};
const saveDb = () => {
    localStorage.setItem('mockDb', JSON.stringify(db));
};
// Call loadDb once on script load
// loadDb(); // Uncomment to enable localStorage persistence for mock DB

// --- Mock Auth Service ---
export const mockLogin = async (email: string, pass: string): Promise<User> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const user = db.users.find(u => u.email === email); // Simplified: no password check
      if (user) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
        resolve(user);
      } else {
        reject(new Error("Invalid credentials"));
      }
    }, 500);
  });
};

export const mockSignup = async (name: string, email: string, pass: string): Promise<User> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (db.users.find(u => u.email === email)) {
        reject(new Error("User already exists"));
        return;
      }
      const newUser: User = { id: `user-${Date.now()}`, name, email };
      db.users.push(newUser);
      // saveDb();
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser));
      resolve(newUser);
    }, 500);
  });
};

export const mockLogout = async (): Promise<void> => {
  return new Promise(resolve => {
    setTimeout(() => {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem(EVOLUTION_SESSION_STORAGE_KEY); // Clear session too
      resolve();
    }, 200);
  });
};

export const mockGetCurrentUser = async (): Promise<User | null> => {
  return new Promise(resolve => {
    setTimeout(() => {
      const storedUser = localStorage.getItem(AUTH_STORAGE_KEY);
      if (storedUser) {
        resolve(JSON.parse(storedUser));
      } else {
        resolve(null);
      }
    }, 100);
  });
};


// --- Mock Evolution API Service ---
export const mockCreateEvolutionSession = async (userId: string): Promise<EvolutionSession> => {
  return new Promise(resolve => {
    setTimeout(() => {
      const newSession: EvolutionSession = {
        id: `session-${Date.now()}`,
        userId,
        instanceName: `${MOCK_EVOLUTION_INSTANCE_NAME}-${userId}`,
        qrCodeUrl: `https://picsum.photos/seed/${Date.now()}/256/256`, // Placeholder QR
        status: EvolutionSessionStatus.SCAN_QR_CODE,
        statusMessage: 'Please scan the QR code with your WhatsApp.'
      };
      // Remove old session for this user if exists
      db.evolutionSessions = db.evolutionSessions.filter(s => s.userId !== userId);
      db.evolutionSessions.push(newSession);
      // saveDb();
      resolve(newSession);
    }, 1000);
  });
};

export const mockCheckEvolutionSessionStatus = async (instanceName: string, userId: string): Promise<EvolutionSession> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      let session = db.evolutionSessions.find(s => s.instanceName === instanceName && s.userId === userId);
      if (!session) {
        reject(new Error("Session not found"));
        return;
      }
      // Simulate status change
      if (session.status === EvolutionSessionStatus.SCAN_QR_CODE) {
        // 50% chance to connect
        if (Math.random() < 0.5) {
            session.status = EvolutionSessionStatus.CONNECTED;
            session.statusMessage = 'WhatsApp connected successfully!';
            session.qrCodeUrl = undefined; // QR no longer needed
        } else {
            session.statusMessage = 'Still waiting for QR scan...';
        }
      } else if (session.status === EvolutionSessionStatus.CONNECTED) {
         // Small chance of disconnecting
         if (Math.random() < 0.1) {
            session.status = EvolutionSessionStatus.DISCONNECTED;
            session.statusMessage = 'WhatsApp disconnected unexpectedly.';
         } else {
            session.statusMessage = 'Connection remains active.';
         }
      }
      // saveDb();
      resolve({...session}); // Return a new object to trigger state updates
    }, 1500);
  });
};


// --- Mock Data Processing and Persistence Service ---

const findOrCreateProduct = (name: string, userId: string): Product => {
  let product = db.products.find(p => p.name.toLowerCase() === name.toLowerCase() && p.userId === userId);
  if (!product) {
    product = { id: `prod-${Date.now()}-${Math.random().toString(16).slice(2)}`, name, userId };
    db.products.push(product);
  }
  return product;
};

const findOrCreateSupplier = (name: string, userId: string): Supplier => {
  let supplier = db.suppliers.find(s => s.name.toLowerCase() === name.toLowerCase() && s.userId === userId);
  if (!supplier) {
    supplier = { id: `supp-${Date.now()}-${Math.random().toString(16).slice(2)}`, name, userId };
    db.suppliers.push(supplier);
  }
  return supplier;
};

// This function simulates a webhook call or internal message processing trigger
export const mockProcessSingleMessage = async (message: RawMessage): Promise<void> => {
  if (message.processed || !GEMINI_API_KEY || !ai) {
    message.processingError = !GEMINI_API_KEY || !ai ? "Gemini service not available." : undefined;
    message.processed = true;
    // saveDb();
    return;
  }

  const extractedInfo = await extractInfoFromMessageViaGemini(message.content);
  if (extractedInfo) {
    const product = findOrCreateProduct(extractedInfo.productName, message.userId);
    // Use sender as supplier name if Gemini doesn't provide one
    const supplierName = extractedInfo.supplierName || message.sender || 'Unknown Supplier';
    const supplier = findOrCreateSupplier(supplierName, message.userId);

    const newQuote: Quote = {
      id: `quote-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      productId: product.id,
      supplierId: supplier.id,
      price: extractedInfo.price,
      conditions: extractedInfo.conditions,
      extractedAt: new Date(),
      rawMessageId: message.id,
      userId: message.userId,
    };
    db.quotes.push(newQuote);
    message.processed = true;
    message.processingError = undefined;
  } else {
    message.processed = true;
    message.processingError = "Failed to extract information from message.";
  }
  // saveDb();
};


export const mockProcessPendingMessages = async (userId: string): Promise<void> => {
    const pendingMessages = db.rawMessages.filter(m => m.userId === userId && !m.processed);
    for (const msg of pendingMessages) {
        await mockProcessSingleMessage(msg); // Process one by one
    }
    // saveDb(); // Save after all processing
};

// This simulates the POST /api/webhook for Evolution API
export const mockSimulateIncomingMessage = async (userId: string, messageContent: string, sender: string): Promise<void> => {
  return new Promise(resolve => {
    setTimeout(async () => {
      const newMessage: RawMessage = {
        id: `msg-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        userId,
        sender,
        content: messageContent,
        timestamp: new Date(),
        processed: false,
      };
      db.rawMessages.push(newMessage);
      // saveDb();
      // Optionally, trigger immediate processing for simulation
      // await mockProcessSingleMessage(newMessage);
      resolve();
    }, 200);
  });
};

const calculateBestPrices = (userId: string): Product[] => {
    const userProducts = db.products.filter(p => p.userId === userId);
    const userQuotes = db.quotes.filter(q => q.userId === userId);

    return userProducts.map(product => {
        const productQuotes = userQuotes.filter(q => q.productId === product.id);
        if (productQuotes.length === 0) {
            return { ...product, bestPrice: undefined, bestSupplierName: undefined };
        }
        // Simple logic: lowest price wins. More complex logic (e.g., considering prazo) could be added.
        const bestQuote = productQuotes.reduce((best, current) => (current.price < best.price ? current : best));
        const bestSupplier = db.suppliers.find(s => s.id === bestQuote.supplierId && s.userId === userId);
        
        return {
            ...product,
            bestPrice: bestQuote.price,
            bestSupplierName: bestSupplier?.name || 'Unknown Supplier',
        };
    });
};


export const mockFetchDashboardData = async (userId: string): Promise<{ products: Product[], suppliers: Supplier[], quotes: Quote[], rawMessages: RawMessage[] }> => {
  return new Promise(resolve => {
    setTimeout(() => {
    // loadDb(); // Ensure latest data from localStorage if using it
      const productsWithBestPrice = calculateBestPrices(userId);
      resolve({
        products: productsWithBestPrice,
        suppliers: db.suppliers.filter(s => s.userId === userId),
        quotes: db.quotes.filter(q => q.userId === userId),
        rawMessages: db.rawMessages.filter(m => m.userId === userId).sort((a,b) => b.timestamp.getTime() - a.timestamp.getTime()),
      });
    }, 700);
  });
};

export const mockRefreshData = mockFetchDashboardData; // Alias for simplicity


export const mockGetProductDetails = (productId: string, userId: string): { product: Product | undefined; quotes: Quote[] } => {
  const product = calculateBestPrices(userId).find(p => p.id === productId && p.userId === userId);
  const productQuotes = db.quotes.filter(q => q.productId === productId && q.userId === userId).sort((a, b) => b.extractedAt.getTime() - a.extractedAt.getTime());
  return { product, quotes: productQuotes };
};

// Initial mock data for a test user if db is empty
if (db.products.length === 0 && db.users.find(u => u.id === 'user-001')) {
    const userId = 'user-001';
    const sampleSuppliers = [
        { id: 'supp-1', name: 'Fornecedor Alpha', userId },
        { id: 'supp-2', name: 'Distribuidora Beta', userId },
    ];
    db.suppliers.push(...sampleSuppliers);

    const sampleProducts = [
        { id: 'prod-1', name: 'Caneta Azul BIC', userId },
        { id: 'prod-2', name: 'Caderno 96fls Capa Dura', userId },
    ];
    db.products.push(...sampleProducts);
    
    const sampleRawMessages = [
        { id: 'rmsg-1', userId, sender: 'Fornecedor Alpha', content: 'Promoção Caneta Azul BIC caixa c/50 por R$20,00. Validade: 3 dias.', timestamp: new Date(Date.now() - 86400000 * 2), processed: false },
        { id: 'rmsg-2', userId, sender: 'Distribuidora Beta', content: 'Caderno 96fls Capa Dura Tilibra R$8.50/un. Pedido mínimo 10un.', timestamp: new Date(Date.now() - 86400000 * 1), processed: false },
        { id: 'rmsg-3', userId, sender: 'Fornecedor Alpha', content: 'Caderno 96fls Capa Dura Milicapas R$7.90/un. Oferta relâmpago!', timestamp: new Date(Date.now() - 3600000 * 5), processed: false },
        { id: 'rmsg-4', userId, sender: 'Distribuidora Beta', content: 'Caneta Azul BIC cx 50un R$22.50. Pagamento em 15dd.', timestamp: new Date(Date.now() - 3600000 * 2), processed: false },
    ];
    db.rawMessages.push(...sampleRawMessages);
    // saveDb();
}