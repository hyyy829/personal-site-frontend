import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, Spin, Tag, Typography } from '@douyinfe/semi-ui';
import { IconGithubLogo, IconLink } from '@douyinfe/semi-icons';
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
    return <Spin size="large" style={{ display: 'block', margin: '96px auto' }} />;
  }

  if (!project) {
    return (
      <div style={{ textAlign: 'center', padding: '96px 0' }}>
        <Typography.Title heading={4}>{t('common.state.notFound')}</Typography.Title>
        <Link to="/project">{t('common.actions.back')}</Link>
      </div>
    );
  }

  const techTags = (project.techStack || '').split(',').map((item) => item.trim()).filter(Boolean);

  return (
    <article style={{ maxWidth: 720 }}>
      <h1 className="site-article-title">{project.name}</h1>
      {project.summary && (
        <Typography.Paragraph type="tertiary" style={{ fontSize: 'var(--site-font-size-lg)' }}>
          {project.summary}
        </Typography.Paragraph>
      )}
      {techTags.length > 0 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', margin: 'var(--site-space-4) 0' }}>
          {techTags.map((tag) => (
            <Tag key={tag} color="white" type="light">
              {tag}
            </Tag>
          ))}
        </div>
      )}
      {project.description && (
        <Typography.Paragraph style={{ lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
          {project.description}
        </Typography.Paragraph>
      )}
      <div style={{ display: 'flex', gap: 12, marginTop: 'var(--site-space-5)' }}>
        {project.repoUrl && (
          <Button theme="solid" icon={<IconGithubLogo />} onClick={() => window.open(project.repoUrl ?? '', '_blank')}>
            {t('project.source')}
          </Button>
        )}
        {project.demoUrl && (
          <Button icon={<IconLink />} onClick={() => window.open(project.demoUrl ?? '', '_blank')}>
            {t('project.demo')}
          </Button>
        )}
      </div>
    </article>
  );
}
