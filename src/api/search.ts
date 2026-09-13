import request from '@/utils/request';
import type { SearchResponse } from '@/types/search';

export function searchSite(keyword: string): Promise<SearchResponse> {
  return request.get('/search', { params: { keyword } });
}
