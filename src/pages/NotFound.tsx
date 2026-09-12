import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Typography } from '@douyinfe/semi-ui';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export default function NotFound() {
  const { t } = useTranslation();
  useDocumentTitle();

  return (
    <div style={{ textAlign: 'center', padding: '120px 0' }}>
      <Typography.Title heading={2}>404</Typography.Title>
      <Typography.Paragraph type="tertiary">{t('common.state.notFound')}</Typography.Paragraph>
      <Link to="/">{t('common.actions.back')}</Link>
    </div>
  );
}
