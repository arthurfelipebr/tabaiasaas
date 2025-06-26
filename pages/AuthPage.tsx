import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts';
import { APP_NAME } from '../constants';
import { Input, Button, Card, Spinner, Alert } from '../components/ui'; // Assuming ui.tsx exports these

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const { login, signup, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(name, email, password);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary-100 dark:bg-secondary-900">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-700 dark:from-primary-700 dark:via-primary-800 dark:to-secondary-900 p-4">
      <Card className="w-full max-w-md" glass>
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-secondary-900 dark:text-white">{APP_NAME}</h1>
          <p className="text-secondary-600 dark:text-secondary-300 mt-1">
            {isLogin ? 'Welcome back!' : 'Create your account'}
          </p>
        </div>

        {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <Input
              id="name"
              label="Name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Your Name"
              icon={<ion-icon name="person-outline" className="text-secondary-400"></ion-icon>}
            />
          )}
          <Input
            id="email"
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
            icon={<ion-icon name="mail-outline" className="text-secondary-400"></ion-icon>}
          />
          <Input
            id="password"
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            icon={<ion-icon name="lock-closed-outline" className="text-secondary-400"></ion-icon>}
          />
          <Button type="submit" className="w-full" isLoading={loading} size="lg">
            {isLogin ? 'Login' : 'Sign Up'}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm">
          <button
            onClick={() => { setIsLogin(!isLogin); setError(null);}}
            className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
          >
            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Login'}
          </button>
        </p>
      </Card>
       <footer className="text-center text-xs text-secondary-200 dark:text-secondary-400 mt-8">
          Powered by Gemini & React. This is a conceptual SPA mock.
      </footer>
    </div>
  );
};

export default AuthPage;