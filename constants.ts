
export const APP_NAME = "Supplier Price Optimizer";
export const GEMINI_MODEL_TEXT = 'gemini-2.5-flash-preview-04-17';

// Mock API Key: In a real app, process.env.API_KEY would be set in the environment.
// The prompt is very strict on using process.env.API_KEY directly.
// If process.env.API_KEY is undefined, the Gemini service will not work.
export const GEMINI_API_KEY = process.env.API_KEY;

export const MOCK_USER_ID = "user-123"; // For simulating a logged-in user in mock services
export const MOCK_EVOLUTION_INSTANCE_NAME = "my-whatsapp-instance";

// LocalStorage Keys
export const THEME_STORAGE_KEY = 'app-theme';
export const AUTH_STORAGE_KEY = 'app-auth-user';
export const EVOLUTION_SESSION_STORAGE_KEY = 'app-evolution-session';
