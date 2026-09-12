import { useMemo } from 'react';
import { renderMarkdown } from '@/utils/markdown';

/** 博客正文渲染：marked + DOMPurify 消毒 */
export default function MarkdownView({ content }: { content: string }) {
  const html = useMemo(() => renderMarkdown(content), [content]);
  return <div className="site-markdown" dangerouslySetInnerHTML={{ __html: html }} />;
}
