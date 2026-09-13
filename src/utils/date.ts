import dayjs from 'dayjs';

/**
 * 日期展示统一收口（PROJECT.md 10.4）：各页面不再手写 slice，避免同一时间在列表与详情里样式不一致。
 * dayjs locale 由 App.tsx 跟随站点语言，这里只负责固定格式与空值兜底。
 */
export function formatDate(value?: string | null): string {
  if (!value) {
    return '-';
  }
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format('YYYY-MM-DD') : '-';
}

export function formatDateTime(value?: string | null): string {
  if (!value) {
    return '-';
  }
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format('YYYY-MM-DD HH:mm') : '-';
}
