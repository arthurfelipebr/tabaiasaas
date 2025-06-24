'use client';
import useSWR from 'swr';

async function createSession() {
  const res = await fetch('/api/session/new', { method: 'POST' });
  if (!res.ok) throw new Error('erro');
  return res.json();
}

export default function SessionPage() {
  const { data, mutate } = useSWR('/api/session/new', createSession);
  if (!data) return <div className="p-4">Gerando sessão...</div>;

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold">Conecte seu WhatsApp</h1>
      {data.qrCode && <img src={data.qrCode} alt="QR Code" className="w-64" />}
      <button className="px-4 py-2 bg-blue-500 text-white rounded" onClick={() => mutate()}>verificar agora</button>
    </div>
  );
}
