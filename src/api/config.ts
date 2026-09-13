import request from '@/utils/request';
import type { PageResult } from '@/types/common';
import type { ConfigManagement, ConfigUpsertRequest, SystemPageQuery } from '@/types/config';

export function pageConfigs(params: SystemPageQuery): Promise<PageResult<ConfigManagement>> {
  return request.get('/admin/system/configs', { params });
}

export function createConfig(data: ConfigUpsertRequest): Promise<number> {
  return request.post('/admin/system/configs', data);
}

export function updateConfig(id: number, data: ConfigUpsertRequest): Promise<void> {
  return request.put(`/admin/system/configs/${id}`, data);
}

export function deleteConfig(id: number): Promise<void> {
  return request.delete(`/admin/system/configs/${id}`);
}
