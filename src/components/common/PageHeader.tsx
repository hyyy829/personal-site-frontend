import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  extra?: ReactNode;
}

/** 页面标题区：统一前台与后台的标题层级、间距与右侧操作位 */
export default function PageHeader({ title, subtitle, extra }: PageHeaderProps) {
  return (
    <div className="site-page-header">
      <div>
        <h1 className="site-page-title">{title}</h1>
        {subtitle ? <p className="site-page-subtitle">{subtitle}</p> : null}
      </div>
      {extra ? <div className="site-page-extra">{extra}</div> : null}
    </div>
  );
}
