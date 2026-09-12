import { useTranslation } from 'react-i18next';
import { Typography } from '@douyinfe/semi-ui';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

/** 关于页：静态内容，全部走 i18n */
export default function About() {
  const { t } = useTranslation();
  useDocumentTitle('about.title');

  return (
    <div style={{ maxWidth: 720 }}>
      <h1 className="site-section-title" style={{ fontSize: 'var(--site-font-size-xxl)' }}>
        {t('about.title')}
      </h1>

      <section className="site-section" style={{ marginTop: 'var(--site-space-6)' }}>
        <h2 className="site-section-title">{t('about.introTitle')}</h2>
        <Typography.Paragraph style={{ color: 'var(--site-color-text-secondary)', lineHeight: 1.8 }}>
          {t('about.intro')}
        </Typography.Paragraph>
      </section>

      <section className="site-section">
        <h2 className="site-section-title">{t('about.stackTitle')}</h2>
        <Typography.Paragraph style={{ color: 'var(--site-color-text-secondary)', lineHeight: 1.8 }}>
          {t('about.stackBackend')}
        </Typography.Paragraph>
        <Typography.Paragraph style={{ color: 'var(--site-color-text-secondary)', lineHeight: 1.8 }}>
          {t('about.stackFrontend')}
        </Typography.Paragraph>
        <Typography.Paragraph style={{ color: 'var(--site-color-text-secondary)', lineHeight: 1.8 }}>
          {t('about.stackInfra')}
        </Typography.Paragraph>
      </section>

      <section className="site-section">
        <h2 className="site-section-title">{t('about.contactTitle')}</h2>
        <Typography.Paragraph style={{ color: 'var(--site-color-text-secondary)' }}>{t('about.contact')}</Typography.Paragraph>
      </section>
    </div>
  );
}
