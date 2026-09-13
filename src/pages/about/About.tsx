import { useTranslation } from 'react-i18next';
import { Typography } from 'antd';
import PageHeader from '@/components/common/PageHeader';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

const { Paragraph } = Typography;

/** 技术栈条目：内容来自 i18n（形如“后端：xxx”），渲染时拆成标签 + 描述 */
const STACK_KEYS = ['stackBackend', 'stackFrontend', 'stackInfra'] as const;

const SECONDARY_TEXT = { color: 'var(--site-color-text-secondary)' } as const;

/**
 * 把 "后端：Java 25、…" 形式的文案拆成标签与内容，只按首个冒号切分一次。
 * 切不出冒号时整行作为内容展示，因此不依赖任何硬编码的文案结构。
 */
function splitStackLine(line: string): { label?: string; value: string } {
  const match = /^([^:：]{1,16})[:：]\s*(.+)$/.exec(line.trim());
  if (!match) {
    return { value: line };
  }
  // 英文冒号曾出现在时间戳等场景，标签限制为短且不含数字的纯文本
  if (/\d/.test(match[1])) {
    return { value: line };
  }
  return { label: match[1], value: match[2] };
}

/** 关于页：静态内容，全部走 i18n */
export default function About() {
  const { t } = useTranslation();
  useDocumentTitle('about.title');

  return (
    <div>
      <PageHeader title={t('about.title')} />

      <section className="site-section" style={{ marginTop: 0 }}>
        <h2 className="site-section-title">{t('about.introTitle')}</h2>
        <Paragraph style={{ ...SECONDARY_TEXT, lineHeight: 'var(--site-line-height-relaxed)' }}>
          {t('about.intro')}
        </Paragraph>
      </section>

      <section className="site-section">
        <h2 className="site-section-title">{t('about.stackTitle')}</h2>
        <dl style={{ margin: 'var(--site-space-5) 0 0', display: 'grid', gap: 'var(--site-space-4)' }}>
          {STACK_KEYS.map((key) => {
            const { label, value } = splitStackLine(t(`about.${key}`));
            return (
              <div
                key={key}
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: 'var(--site-space-3)',
                  paddingBottom: 'var(--site-space-4)',
                  borderBottom: '1px solid var(--site-color-border)',
                }}
              >
                {label ? (
                  <dt
                    style={{
                      flexShrink: 0,
                      fontWeight: 'var(--site-font-weight-medium)',
                      color: 'var(--site-color-text)',
                    }}
                  >
                    {label}
                  </dt>
                ) : null}
                <dd style={{ margin: 0, flex: 1, wordBreak: 'break-word', ...SECONDARY_TEXT }}>{value}</dd>
              </div>
            );
          })}
        </dl>
      </section>

      <section className="site-section">
        <h2 className="site-section-title">{t('about.contactTitle')}</h2>
        <Paragraph style={SECONDARY_TEXT}>{t('about.contact')}</Paragraph>
      </section>
    </div>
  );
}
