/** 与后端 friendlink 模块对齐 */
export interface FriendLink {
  id: number;
  name: string;
  url: string;
  logoUrl: string | null;
  description: string | null;
  sortOrder: number;
  published: boolean;
  createdAt: string;
}

export interface FriendLinkUpsertRequest {
  name: string;
  url: string;
  logoUrl?: string;
  description?: string;
  sortOrder?: number;
  published?: boolean;
}

export interface FriendLinkQueryRequest {
  page?: number;
  pageSize?: number;
  keyword?: string;
}
