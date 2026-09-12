import request from '@/utils/request';
import type { LoginRequest, LoginResponse, CurrentUserResponse } from '@/types/auth';

export function login(data: LoginRequest): Promise<LoginResponse> {
  return request.post('/auth/login', data);
}

export function me(): Promise<CurrentUserResponse> {
  return request.get('/auth/me');
}

export function logout(): Promise<void> {
  return request.post('/auth/logout');
}

export function switchTenant(tenantId: number): Promise<CurrentUserResponse> {
  return request.post('/auth/tenant', { tenantId });
}
