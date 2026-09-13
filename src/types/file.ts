/** 与后端 file 模块对齐 */
export interface FileManagement {
  id: number;
  fileId: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  contentType: string;
  createdAt: string;
}
