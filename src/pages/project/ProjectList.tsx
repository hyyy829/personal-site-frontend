import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Empty, Pagination, Skeleton, Tag } from 'antd';
import { GithubOutlined, LinkOutlined } from '@ant-design/icons';
import PageHeader from '@/components/common/PageHeader';
import { pageProjects } from '@/api/project';
import type { ProjectSummary } from '@/types/project';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

const PAGE_SIZE = 50;

const linkStyle = { display: 'inline-flex', alignItems: 'center', gap: 'var(--site-space-1)' } as const;

/** 项目展示：已发布项目卡片列表 */
export default function ProjectList() {
  const { t } = useTranslation();
  useDocumentTitle('common.nav.project');
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    pageProjects({ page, pageSize: PAGE_SIZE })
      .then((data) => {
        setProjects(data.records);
        setTotal(data.total);
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div>
      <PageHeader title={t('common.nav.project')} />

      {loading ? (
        <Skeleton active paragraph={{ rows: 6 }} />
      ) : projects.length === 0 ? (
        <div className="site-empty">
          <Empty description={t('common.state.empty')} />
        </div>
      ) : (
        <div className="site-grid">
          {projects.map((project) => {
            const techTags = (project.techStack || '')
              .split(',')
              .map((item) => item.trim())
              .filter(Boolean);
            return (
              <article key={project.id} className="site-card site-card-hover site-project-card">
                {project.coverUrl && <img className="site-project-cover" src={project.coverUrl} alt={project.name} loading="lazy" />}
                <Link to={`/project/${project.id}`} className="site-project-name">
                  {project.name}
                </Link>
                {project.summary && <p className="site-project-summary">{project.summary}</p>}
                {techTags.length > 0 && (
                  <div className="site-tag-list">
                    {techTags.map((tag) => (
                      <Tag key={tag} color="default">
                        {tag}
                      </Tag>
                    ))}
                  </div>
                )}
                {(project.repoUrl || project.demoUrl) && (
                  <div className="site-meta site-link-list">
                    {project.repoUrl && (
                      <a href={project.repoUrl} target="_blank" rel="noreferrer" style={linkStyle}>
                        <GithubOutlined />
                        {t('project.source')}
                      </a>
                    )}
                    {project.demoUrl && (
                      <a href={project.demoUrl} target="_blank" rel="noreferrer" style={linkStyle}>
                        <LinkOutlined />
                        {t('project.demo')}
                      </a>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}

      {total > PAGE_SIZE && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 'var(--site-space-6)' }}>
          <Pagination total={total} pageSize={PAGE_SIZE} current={page} onChange={setPage} />
        </div>
      )}
    </div>
  );
}
