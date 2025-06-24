'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/register', { method: 'POST', body: JSON.stringify({ email, password }) });
    if (res.ok) router.push('/login');
    else setError('Erro ao registrar');
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="bg-white/20 backdrop-blur p-6 rounded shadow w-80 space-y-4">
        <h1 className="text-xl font-bold text-center">Registrar</h1>
        <input className="w-full p-2 rounded bg-white/50" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input type="password" className="w-full p-2 rounded bg-white/50" placeholder="Senha" value={password} onChange={e=>setPassword(e.target.value)} />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button className="w-full py-2 bg-blue-500 text-white rounded" type="submit">Criar conta</button>
      </form>
    </div>
  );
}
