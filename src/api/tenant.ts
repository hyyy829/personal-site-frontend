import request from '@/utils/request';
import type { PageResult } from '@/types/common';
import type { TenantManagement, TenantCreateRequest, TenantUpdateRequest, SystemPageQuery } from '@/types/tenant';

export function pageTenants(params: SystemPageQuery): Promise<PageResult<TenantManagement>> {
  return request.get('/admin/system/tenants', { params });
}

export function createTenant(data: TenantCreateRequest): Promise<number> {
  return request.post('/admin/system/tenants', data);
}

export function updateTenant(id: number, data: TenantUpdateRequest): Promise<void> {
  return request.put(`/admin/system/tenants/${id}`, data);
}
