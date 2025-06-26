import React, { Suspense } from 'react';
import { HashRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { AuthProvider, DataProvider, useTheme, useAuth } from './contexts';
import { APP_NAME } from './constants';
import { Button, Spinner } from './components/ui';

// Lazy load pages
const AuthPage = React.lazy(() => import('./pages/AuthPage'));
const DashboardPage = React.lazy(() => import('./pages/DashboardPage'));
const ConnectWhatsAppPage = React.lazy(() => import('./pages/ConnectWhatsAppPage'));
const ProductDetailsPage = React.lazy(() => import('./pages/ProductDetailsPage'));


const Navbar: React.FC = () => {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { currentUser, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: 'grid-outline' },
    { path: '/whatsapp-connect', label: 'Conectar WhatsApp', icon: 'logo-whatsapp' },
  ];

  return (
    <nav className="bg-white/70 dark:bg-secondary-800/70 backdrop-blur-md shadow-md sticky top-0 z-50 glassmorphism border-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to={currentUser ? "/dashboard" : "/"} className="flex-shrink-0 text-2xl font-bold text-primary-600 dark:text-primary-400 flex items-center">
              <ion-icon name="pricetags-outline" className="mr-2"></ion-icon>
              {APP_NAME}
            </Link>
          </div>
          {currentUser && (
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                {navItems.map(item => (
                   <Link
                    key={item.path}
                    to={item.path}
                    className={`px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-2
                      ${location.pathname.startsWith(item.path) 
                        ? 'bg-primary-500 text-white dark:bg-primary-600' 
                        : 'text-secondary-700 dark:text-secondary-300 hover:bg-secondary-100 dark:hover:bg-secondary-700'}`}
                  >
                    <ion-icon name={item.icon}></ion-icon>
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
          <div className="flex items-center">
            <Button onClick={toggleDarkMode} variant="ghost" size="sm" className="mr-3 p-2">
              <ion-icon name={isDarkMode ? 'sunny-outline' : 'moon-outline'} className="text-xl"></ion-icon>
            </Button>
            {currentUser && (
              <div className="relative group">
                 <Button variant="ghost" size="sm" className="p-2">
                    <ion-icon name="person-circle-outline" className="text-2xl mr-1"></ion-icon>
                    <span className="hidden sm:inline">{currentUser.name.split(' ')[0]}</span>
                    <ion-icon name="chevron-down-outline" className="text-xs ml-1 hidden sm:inline"></ion-icon>
                 </Button>
                 <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-md shadow-lg py-1 bg-white dark:bg-secondary-800 ring-1 ring-black ring-opacity-5 dark:ring-white dark:ring-opacity-10 focus:outline-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 ease-in-out transform scale-95 group-hover:scale-100 z-20">
                    <button
                        onClick={logout}
                        className="w-full text-left block px-4 py-2 text-sm text-secondary-700 dark:text-secondary-300 hover:bg-secondary-100 dark:hover:bg-secondary-700"
                    >
                        Logout
                    </button>
                 </div>
              </div>
            )}
            {currentUser && ( // Mobile menu button
                <div className="md:hidden ml-2">
                     {/* Basic toggle, full mobile menu would need more state */}
                    <Button variant="ghost" size="sm" onClick={() => alert('Mobile menu not fully implemented. Use desktop for all nav items.')}>
                        <ion-icon name="menu-outline" className="text-2xl"></ion-icon>
                    </Button>
                </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-0 sm:px-4 py-4">
        {children}
      </main>
      <footer className="text-center py-4 text-xs text-secondary-500 dark:text-secondary-400 border-t border-secondary-200 dark:border-secondary-700">
        © {new Date().getFullYear()} {APP_NAME}. All rights reserved (concept).
      </footer>
    </div>
  );
};


const App: React.FC = () => {
  return (
    <AuthProvider>
      <DataProvider> {/* DataProvider needs AuthContext, so it's nested */}
        <HashRouter>
          <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-secondary-100 dark:bg-secondary-900">
              <Spinner size="lg" />
            </div>
          }>
            <Routes>
              <Route path="/auth" element={<AuthPage />} />
              <Route 
                path="/" 
                element={
                  <ProtectedRoute>
                    <Navigate to="/dashboard" replace />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <MainLayout><DashboardPage /></MainLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/whatsapp-connect" 
                element={
                  <ProtectedRoute>
                    <MainLayout><ConnectWhatsAppPage /></MainLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/products/:productId/history" 
                element={
                  <ProtectedRoute>
                    <MainLayout><ProductDetailsPage /></MainLayout>
                  </ProtectedRoute>
                } 
              />
              <Route path="*" element={<Navigate to="/" replace />} /> {/* Fallback route */}
            </Routes>
          </Suspense>
        </HashRouter>
      </DataProvider>
    </AuthProvider>
  );
};

export default App;