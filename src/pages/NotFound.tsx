import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from 'antd';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export default function NotFound() {
  const { t } = useTranslation();
  useDocumentTitle();

  return (
    <div className="site-notfound">
      <p className="site-notfound-code">404</p>
      <p className="site-notfound-text">{t('common.state.notFound')}</p>
      <Link to="/">
        <Button type="primary">{t('common.actions.back')}</Button>
      </Link>
    </div>
  );
}
