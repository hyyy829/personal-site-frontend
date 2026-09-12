import { useTranslation } from 'react-i18next';
import { Empty, Typography } from '@douyinfe/semi-ui';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

/** 项目展示：Phase 1 骨架页，后端 project 表已建好，接口按分期规划在后续实现 */
export default function Project() {
  const { t } = useTranslation();
  useDocumentTitle('common.nav.project');

  return (
    <div>
      <h1 className="site-section-title" style={{ fontSize: 'var(--site-font-size-xxl)', margin: 0 }}>
        {t('common.nav.project')}
      </h1>
      <div style={{ padding: 'var(--site-space-10) 0' }}>
        <Empty title={<Typography.Text type="tertiary">{t('common.state.underConstruction')}</Typography.Text>} />
      </div>
    </div>
  );
}
