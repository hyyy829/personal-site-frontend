import request from '@/utils/request';
import type { VisitSummary, TopPath } from '@/types/stats';

export function reportVisit(path: string): Promise<void> {
  return request.post('/stats/visit', { path });
}

export function getVisitSummary(): Promise<VisitSummary> {
  return request.get('/stats/visits');
}

export function getTopPaths(limit = 10): Promise<TopPath[]> {
  return request.get('/admin/stats/top-paths', { params: { limit } });
}
