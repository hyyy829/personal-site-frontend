import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, Empty, Spin, Tag, Typography } from '@douyinfe/semi-ui';
import { IconGithubLogo, IconLink } from '@douyinfe/semi-icons';
import { pageProjects } from '@/api/project';
import type { ProjectSummary } from '@/types/project';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

/** 项目展示：已发布项目卡片列表 */
export default function ProjectList() {
  const { t } = useTranslation();
  useDocumentTitle('common.nav.project');
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    pageProjects({ page: 1, pageSize: 50 })
      .then((data) => setProjects(data.records))
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <Spin size="large" style={{ display: 'block', margin: '96px auto' }} />;
  }

  return (
    <div>
      <h1 className="site-section-title" style={{ fontSize: 'var(--site-font-size-xxl)', margin: 0 }}>
        {t('common.nav.project')}
      </h1>

      {projects.length === 0 ? (
        <div style={{ padding: 'var(--site-space-10) 0' }}>
          <Empty title={<Typography.Text type="tertiary">{t('common.state.empty')}</Typography.Text>} />
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16, marginTop: 'var(--site-space-6)' }}>
          {projects.map((project) => {
            const techTags = (project.techStack || '').split(',').map((item) => item.trim()).filter(Boolean);
            return (
              <div
                key={project.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--site-space-3)',
                  border: '1px solid var(--site-color-border)',
                  borderRadius: 'var(--site-radius-md)',
                  padding: 'var(--site-space-5)',
                  background: 'var(--site-color-bg)',
                }}
              >
                <Link to={`/project/${project.id}`} className="site-post-item-title" style={{ fontSize: 'var(--site-font-size-lg)' }}>
                  {project.name}
                </Link>
                {project.summary && (
                  <Typography.Text type="tertiary" style={{ lineHeight: 1.6 }}>
                    {project.summary}
                  </Typography.Text>
                )}
                {techTags.length > 0 && (
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {techTags.map((tag) => (
                      <Tag key={tag} color="white" type="light">
                        {tag}
                      </Tag>
                    ))}
                  </div>
                )}
                <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
                  {project.repoUrl && (
                    <Button size="small" theme="borderless" icon={<IconGithubLogo />} onClick={() => window.open(project.repoUrl ?? '', '_blank')}>
                      {t('project.source')}
                    </Button>
                  )}
                  {project.demoUrl && (
                    <Button size="small" theme="borderless" icon={<IconLink />} onClick={() => window.open(project.demoUrl ?? '', '_blank')}>
                      {t('project.demo')}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
