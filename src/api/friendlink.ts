import request from '@/utils/request';
import type { PageResult } from '@/types/common';
import type { FriendLink, FriendLinkUpsertRequest, FriendLinkQueryRequest } from '@/types/friendlink';

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
