import request from '@/utils/request';
import type { PageResult } from '@/types/common';
import type { PublicComment, CommentCreateRequest, CommentManagement, CommentQueryRequest } from '@/types/comment';

export function pagePostComments(postId: number | string, page = 1, pageSize = 10): Promise<PageResult<PublicComment>> {
  return request.get(`/blog/posts/${postId}/comments`, { params: { page, pageSize } });
}

export function createPostComment(postId: number | string, data: CommentCreateRequest): Promise<number> {
  return request.post(`/blog/posts/${postId}/comments`, data);
}

export function pageGuestbook(page = 1, pageSize = 10): Promise<PageResult<PublicComment>> {
  return request.get('/guestbook', { params: { page, pageSize } });
}

export function createGuestbookMessage(data: CommentCreateRequest): Promise<number> {
  return request.post('/guestbook', data);
}

export function pageComments(params: CommentQueryRequest): Promise<PageResult<CommentManagement>> {
  return request.get('/admin/comments', { params });
}

export function updateCommentStatus(id: number, status: 'approved' | 'rejected'): Promise<void> {
  return request.put(`/admin/comments/${id}/status`, { status });
}

export function deleteComment(id: number): Promise<void> {
  return request.delete(`/admin/comments/${id}`);
}
