/** 与后端 friendlink / timeline 模块对齐 */
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

export interface TimelineItem {
  id: number;
  title: string;
  content: string | null;
  eventDate: string;
  tag: string | null;
  published: boolean;
  createdAt: string;
}

export interface TimelineUpsertRequest {
  title: string;
  content?: string;
  eventDate: string;
  tag?: string;
  published?: boolean;
}

export interface TimelineQueryRequest {
  page?: number;
  pageSize?: number;
  tag?: string;
}
