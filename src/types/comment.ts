export type CommentStatus = 'pending' | 'approved' | 'rejected';
export type CommentTargetType = 'blog' | 'guestbook';

/** 与后端 comment 模块对齐 */
export interface PublicComment {
  id: number;
  authorName: string;
  content: string;
  createdAt: string;
}

export interface CommentCreateRequest {
  authorName: string;
  authorEmail?: string;
  content: string;
}

export interface CommentManagement {
  id: number;
  targetType: CommentTargetType;
  targetId: number | null;
  authorName: string;
  authorEmail: string | null;
  content: string;
  status: CommentStatus;
  createdAt: string;
}

export interface CommentQueryRequest {
  page?: number;
  pageSize?: number;
  status?: CommentStatus;
  targetType?: CommentTargetType;
}
