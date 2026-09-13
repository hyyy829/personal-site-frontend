/** 与后端 timeline 模块对齐 */
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
