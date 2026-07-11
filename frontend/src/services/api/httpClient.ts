import Config from 'react-native-config';

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface ErrorResponseBody {
  message?: string | string[] | { message?: string | string[] };
}

function extractErrorMessage(body: unknown, fallback: string): string {
  const message = (body as ErrorResponseBody | undefined)?.message;

  if (typeof message === 'string') {
    return message;
  }
  if (Array.isArray(message)) {
    return message.join(' ');
  }
  if (message && typeof message === 'object') {
    return extractErrorMessage(message, fallback);
  }
  return fallback;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const baseUrl = Config.API_BASE_URL;

  let response: Response;
  try {
    response = await fetch(`${baseUrl}${path}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...init?.headers },
    });
  } catch {
    throw new ApiError('No pudimos conectar con el servidor.', 0);
  }

  const body = await response.json().catch(() => undefined);

  if (!response.ok) {
    throw new ApiError(
      extractErrorMessage(body, 'Ocurrió un error inesperado.'),
      response.status,
    );
  }

  return body as T;
}

export const httpClient = {
  get<T>(path: string): Promise<T> {
    return request<T>(path, { method: 'GET' });
  },
  post<T>(path: string, body: unknown): Promise<T> {
    return request<T>(path, { method: 'POST', body: JSON.stringify(body) });
  },
};
