import request from '@/utils/request';
import type { PageResult } from '@/types/common';
import type { TimelineItem, TimelineUpsertRequest, TimelineQueryRequest } from '@/types/timeline';

export function pageTimeline(params: TimelineQueryRequest): Promise<PageResult<TimelineItem>> {
  return request.get('/timeline', { params });
}

export function adminPageTimeline(params: TimelineQueryRequest): Promise<PageResult<TimelineItem>> {
  return request.get('/admin/timeline', { params });
}

export function createTimeline(data: TimelineUpsertRequest): Promise<number> {
  return request.post('/admin/timeline', data);
}

export function updateTimeline(id: number, data: TimelineUpsertRequest): Promise<void> {
  return request.put(`/admin/timeline/${id}`, data);
}

export function deleteTimeline(id: number): Promise<void> {
  return request.delete(`/admin/timeline/${id}`);
}
