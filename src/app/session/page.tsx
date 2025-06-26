'use client';
import useSWR from 'swr';
import { apiClient } from '@/lib/apiClient';

async function createSession() {
  return apiClient('/api/session/new', { method: 'POST' });
}

export default function SessionPage() {
  const { data, error, mutate } = useSWR('/api/session/new', createSession);
  if (error) return <div className="p-4">{error.message}</div>;
  if (!data) return <div className="p-4">Gerando sessão...</div>;

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold">Conecte seu WhatsApp</h1>
      {data.qrCode && <img src={data.qrCode} alt="QR Code" className="w-64" />}
      <button className="px-4 py-2 bg-blue-500 text-white rounded" onClick={() => mutate()}>verificar agora</button>
    </div>
  );
}
