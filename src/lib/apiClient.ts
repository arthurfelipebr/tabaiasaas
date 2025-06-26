export async function apiClient<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const res = await fetch(input, init);
  if (!res.ok) {
    let data: unknown = {};
    try {
      data = await res.json();
    } catch {
      // ignore parse errors
    }
    const message = mapError(res.status, (data as { error?: string }).error);
    throw new Error(message);
  }
  return res.json();
}

function mapError(status: number, code?: string): string {
  if (code === 'Exists') return 'Usuário já existe';
  if (status === 401) return 'Não autorizado';
  if (status === 404) return 'Recurso não encontrado';
  if (status === 400) {
    if (code === 'Invalid Token') return 'Token inválido';
    if (code === 'Invalid') return 'Dados inválidos';
    return 'Requisição inválida';
  }
  return 'Erro inesperado';
}
