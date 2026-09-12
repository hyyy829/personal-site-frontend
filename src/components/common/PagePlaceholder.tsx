import { useTranslation } from 'react-i18next';
import { Typography } from '@douyinfe/semi-ui';

interface Props {
  titleKey: string;
}

/** 后台占位页统一组件，Phase 2+ 的模块先落路由与菜单 */
export default function PagePlaceholder({ titleKey }: Props) {
  const { t } = useTranslation();

  return (
    <div className="site-admin-page">
      <Typography.Title heading={4}>{t(titleKey)}</Typography.Title>
      <Typography.Paragraph type="tertiary">{t('common.state.underConstruction')}</Typography.Paragraph>
    </div>
  );
}
