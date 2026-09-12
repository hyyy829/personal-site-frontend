import { create } from 'zustand';
import { getToken, setToken, clearToken } from '@/utils/token';
import * as authApi from '@/api/auth';
import type { CurrentUserResponse, LoginRequest } from '@/types/auth';

interface AuthState extends CurrentUserResponse {
  token: string | null;
  loggedIn: boolean;
  login: (request: LoginRequest) => Promise<void>;
  fetchMe: () => Promise<void>;
  logout: () => Promise<void>;
  switchTenant: (tenantId: number) => Promise<void>;
  clear: () => void;
  hasPermission: (permission: string) => boolean;
}

const EMPTY_SESSION: CurrentUserResponse = {
  user: { id: 0, username: '', nickname: null },
  roles: [],
  permissions: [],
  tenants: [],
  currentTenantId: 0,
};

export const useAuthStore = create<AuthState>((set, get) => ({
  ...EMPTY_SESSION,
  token: getToken(),
  loggedIn: Boolean(getToken()),

  login: async (request) => {
    const data = await authApi.login(request);
    setToken(data.token);
    set({ ...data, token: data.token, loggedIn: true });
  },

  fetchMe: async () => {
    const data = await authApi.me();
    set({ ...data, loggedIn: true });
  },

  logout: async () => {
    try {
      await authApi.logout();
    } finally {
      get().clear();
    }
  },

  switchTenant: async (tenantId) => {
    const data = await authApi.switchTenant(tenantId);
    set({ ...data });
  },

  clear: () => {
    clearToken();
    set({ ...EMPTY_SESSION, token: null, loggedIn: false });
  },

  hasPermission: (permission) => get().permissions.includes(permission),
}));
