import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, Skeleton, Tag, Typography } from 'antd';
import { GithubOutlined, LinkOutlined } from '@ant-design/icons';
import PageHeader from '@/components/common/PageHeader';
import { getProject } from '@/api/project';
import type { ProjectDetail } from '@/types/project';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

/** 项目详情页 */
export default function ProjectDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  useDocumentTitle('common.nav.project');
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getProject(id ?? '')
      .then((data) => {
        if (!cancelled) setProject(data);
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (project) {
      document.title = `${project.name} · ${t('common.siteName')}`;
    }
  }, [project, t]);

  if (loading) {
    return <Skeleton active paragraph={{ rows: 6 }} />;
  }

  if (!project) {
    return (
      <div className="site-empty">
        <div style={{ textAlign: 'center' }}>
          <Typography.Title level={4} style={{ marginBottom: 'var(--site-space-3)' }}>
            {t('common.state.notFound')}
          </Typography.Title>
          <Link to="/project">{t('common.actions.back')}</Link>
        </div>
      </div>
    );
  }

  const techTags = (project.techStack || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  return (
    <article className="site-article">
      <PageHeader title={project.name} subtitle={project.summary} />

      {project.coverUrl && <img className="site-article-cover" src={project.coverUrl} alt={project.name} loading="lazy" />}

      {techTags.length > 0 && (
        <div className="site-tag-list" style={{ marginBottom: 'var(--site-space-5)' }}>
          {techTags.map((tag) => (
            <Tag key={tag} color="default">
              {tag}
            </Tag>
          ))}
        </div>
      )}

      {project.description && (
        <Typography.Paragraph style={{ color: 'var(--site-color-text-secondary)', lineHeight: 'var(--site-line-height-relaxed)', whiteSpace: 'pre-wrap' }}>
          {project.description}
        </Typography.Paragraph>
      )}

      <div className="site-page-extra" style={{ marginTop: 'var(--site-space-6)' }}>
        {project.repoUrl && (
          <Button type="primary" icon={<GithubOutlined />} href={project.repoUrl} target="_blank" rel="noreferrer">
            {t('project.source')}
          </Button>
        )}
        {project.demoUrl && (
          <Button icon={<LinkOutlined />} href={project.demoUrl} target="_blank" rel="noreferrer">
            {t('project.demo')}
          </Button>
        )}
      </div>
    </article>
  );
}
