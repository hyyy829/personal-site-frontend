import request from '@/utils/request';
import type { PageResult } from '@/types/common';
import type { ProjectSummary, ProjectDetail, ProjectQueryRequest, ProjectUpsertRequest } from '@/types/project';

export function pageProjects(params: ProjectQueryRequest): Promise<PageResult<ProjectSummary>> {
  return request.get('/projects', { params });
}

export function getProject(id: number | string): Promise<ProjectDetail> {
  return request.get(`/projects/${id}`);
}

export function adminPageProjects(params: ProjectQueryRequest): Promise<PageResult<ProjectSummary>> {
  return request.get('/admin/projects', { params });
}

export function adminGetProject(id: number): Promise<ProjectDetail> {
  return request.get(`/admin/projects/${id}`);
}

export function createProject(data: ProjectUpsertRequest): Promise<number> {
  return request.post('/admin/projects', data);
}

export function updateProject(id: number, data: ProjectUpsertRequest): Promise<void> {
  return request.put(`/admin/projects/${id}`, data);
}

export function deleteProject(id: number): Promise<void> {
  return request.delete(`/admin/projects/${id}`);
}
