import request from '@/utils/request';
import type { PageResult } from '@/types/common';
import type {
  FriendLink,
  FriendLinkUpsertRequest,
  FriendLinkQueryRequest,
  TimelineItem,
  TimelineUpsertRequest,
  TimelineQueryRequest,
} from '@/types/content';

/* ---------- 友链 ---------- */

export function pageFriendLinks(params: FriendLinkQueryRequest): Promise<PageResult<FriendLink>> {
  return request.get('/friend-links', { params });
}

export function adminPageFriendLinks(params: FriendLinkQueryRequest): Promise<PageResult<FriendLink>> {
  return request.get('/admin/friend-links', { params });
}

export function createFriendLink(data: FriendLinkUpsertRequest): Promise<number> {
  return request.post('/admin/friend-links', data);
}

export function updateFriendLink(id: number, data: FriendLinkUpsertRequest): Promise<void> {
  return request.put(`/admin/friend-links/${id}`, data);
}

export function deleteFriendLink(id: number): Promise<void> {
  return request.delete(`/admin/friend-links/${id}`);
}

/* ---------- 时间线 ---------- */

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
