import {
  User,
  FoodListing,
  Claim,
  Rating,
  UserDashboardData,
  ProviderDashboardData,
  AdminDashboardData,
  ImpactData
} from '../types';

const TOKEN_KEY = 'foodloop_token';

export const getToken = (): string | null => localStorage.getItem(TOKEN_KEY);
export const setToken = (token: string): void => localStorage.setItem(TOKEN_KEY, token);
export const removeToken = (): void => localStorage.removeItem(TOKEN_KEY);

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`/api${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data?.error || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return data as T;
}

// Authentication API
export const api = {
  auth: {
    register: (payload: { name: string; email: string; phone?: string; password: string; role?: string }) =>
      request<{ token: string; user: User }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),

    login: (payload: { email: string; password: string }) =>
      request<{ token: string; user: User }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),

    getMe: () => request<{ user: User }>('/auth/me'),
  },

  listings: {
    getAll: (params: Record<string, string | number | boolean | undefined> = {}) => {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          searchParams.append(key, String(val));
        }
      });
      const query = searchParams.toString();
      return request<{ listings: FoodListing[] }>(`/listings${query ? `?${query}` : ''}`);
    },

    getById: (id: string) => request<{ listing: FoodListing; reviews: Rating[] }>(`/listings/${id}`),

    create: (payload: Partial<FoodListing>) =>
      request<{ listing: FoodListing }>('/listings', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),

    update: (id: string, payload: Partial<FoodListing>) =>
      request<{ listing: FoodListing }>(`/listings/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      }),

    delete: (id: string) =>
      request<{ message: string }>(`/listings/${id}`, {
        method: 'DELETE',
      }),
  },

  claims: {
    create: (listing_id: string, quantity: number) =>
      request<{ claim: Claim; updated_listing: FoodListing }>('/claims', {
        method: 'POST',
        body: JSON.stringify({ listing_id, quantity }),
      }),

    getAll: () => request<{ claims: Claim[] }>('/claims'),

    getById: (id: string) => request<{ claim: Claim }>(`/claims/${id}`),

    complete: (id: string) =>
      request<{ claim: Claim; message: string }>(`/claims/${id}/complete`, {
        method: 'PUT',
      }),

    cancel: (id: string) =>
      request<{ claim: Claim; message: string }>(`/claims/${id}/cancel`, {
        method: 'PUT',
      }),
  },

  ratings: {
    create: (claim_id: string, rating: number, review: string) =>
      request<{ rating: Rating }>('/ratings', {
        method: 'POST',
        body: JSON.stringify({ claim_id, rating, review }),
      }),
  },

  dashboard: {
    getUser: () => request<UserDashboardData>('/dashboard/user'),
    getProvider: () => request<ProviderDashboardData>('/dashboard/provider'),
    getAdmin: () => request<AdminDashboardData>('/dashboard/admin'),
    getImpact: () => request<ImpactData>('/dashboard/impact'),
    resetAdminDb: () => request<{ message: string }>('/dashboard/admin/reset', { method: 'POST' }),
  },
};
