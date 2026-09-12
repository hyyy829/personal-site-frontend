import request from '@/utils/request';
import type { PageResult } from '@/types/common';
import type { BlogSummary, BlogDetail, BlogQueryRequest, BlogUpsertRequest } from '@/types/blog';

export function pagePosts(params: BlogQueryRequest): Promise<PageResult<BlogSummary>> {
  return request.get('/blog/posts', { params });
}

export function getPost(id: number | string): Promise<BlogDetail> {
  return request.get(`/blog/posts/${id}`);
}

export function adminPagePosts(params: BlogQueryRequest): Promise<PageResult<BlogSummary>> {
  return request.get('/admin/blog/posts', { params });
}

export function adminGetPost(id: number): Promise<BlogDetail> {
  return request.get(`/admin/blog/posts/${id}`);
}

export function createPost(data: BlogUpsertRequest): Promise<number> {
  return request.post('/admin/blog/posts', data);
}

export function updatePost(id: number, data: BlogUpsertRequest): Promise<void> {
  return request.put(`/admin/blog/posts/${id}`, data);
}

export function deletePost(id: number): Promise<void> {
  return request.delete(`/admin/blog/posts/${id}`);
}
