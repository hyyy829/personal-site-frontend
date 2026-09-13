/** 与后端 search 模块对齐 */
export interface BlogHit {
  id: number;
  title: string;
  summary: string | null;
  publishedAt: string | null;
}

export interface ProjectHit {
  id: number;
  name: string;
  summary: string | null;
}

export interface SearchResponse {
  blogs: BlogHit[];
  projects: ProjectHit[];
}
