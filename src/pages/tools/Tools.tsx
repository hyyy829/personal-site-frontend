import { useState } from 'react';
import type { CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Input, Tabs, Typography } from 'antd';
import PageHeader from '@/components/common/PageHeader';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

interface ToolState {
  input: string;
  output: string;
  error: string | null;
}

const INITIAL: ToolState = { input: '', output: '', error: null };

/** 输入 / 输出小标题：仅做排版微调，间距取自设计 token */
const labelStyle: CSSProperties = {
  display: 'block',
  marginBottom: 'var(--site-space-2)',
};

const panelStyle: CSSProperties = {
  display: 'grid',
  gap: 'var(--site-space-3)',
  maxWidth: 'var(--site-reading-width)',
};

function formatJson(input: string, invalidMessage: string): ToolState {
  try {
    return { input, output: JSON.stringify(JSON.parse(input), null, 2), error: null };
  } catch {
    // 不把浏览器英文报错抛给用户，统一用本地化文案
    return { input, output: '', error: invalidMessage };
  }
}

function transform(input: string, transformFn: (value: string) => string): ToolState {
  return { input, output: transformFn(input), error: null };
}

/** 工具箱：纯前端小工具，无后端依赖 */
export default function Tools() {
  const { t } = useTranslation();
  useDocumentTitle('common.nav.tools');
  const [jsonState, setJsonState] = useState<ToolState>(INITIAL);
  const [base64State, setBase64State] = useState<ToolState>(INITIAL);
  const [timestampState, setTimestampState] = useState<ToolState>(INITIAL);
  const [uuidOutput, setUuidOutput] = useState('');

  const generateUuids = () => {
    setUuidOutput(
      Array.from({ length: 5 }, () =>
        typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      ).join('\n'),
    );
  };

  const renderTool = (
    state: ToolState,
    onInput: (value: string) => void,
    onRun: () => void,
    runLabel: string,
    outputLabel: string,
  ) => (
    <div style={panelStyle}>
      <div>
        <Typography.Text type="secondary" style={labelStyle}>
          {t('comment.content')}
        </Typography.Text>
        <Input.TextArea
          rows={6}
          value={state.input}
          onChange={(event) => onInput(event.target.value)}
          style={{ fontFamily: 'var(--site-font-family-mono)' }}
        />
      </div>
      <div>
        <Button type="primary" onClick={onRun} disabled={!state.input}>
          {runLabel}
        </Button>
      </div>
      {state.error ? <Typography.Text type="danger">{state.error}</Typography.Text> : null}
      {state.output ? (
        <div>
          <Typography.Text type="secondary" style={labelStyle}>
            {outputLabel}
          </Typography.Text>
          <pre className="site-tool-output">{state.output}</pre>
        </div>
      ) : null}
    </div>
  );

  return (
    <div className="site-page">
      <PageHeader title={t('common.nav.tools')} subtitle={t('tools.subtitle')} />

      <Tabs
        items={[
          {
            key: 'json',
            label: t('tools.json'),
            children: renderTool(
              jsonState,
              (v) => setJsonState({ input: v, output: '', error: null }),
              () => setJsonState(formatJson(jsonState.input, t('tools.invalidInput'))),
              t('tools.run'),
              t('tools.json'),
            ),
          },
          {
            key: 'base64',
            label: t('tools.base64'),
            children: renderTool(
              base64State,
              (v) => setBase64State({ input: v, output: '', error: null }),
              () =>
                setBase64State(
                  transform(base64State.input, (value) =>
                    btoa(String.fromCharCode(...new TextEncoder().encode(value))),
                  ),
                ),
              t('tools.encode'),
              t('tools.base64'),
            ),
          },
          {
            key: 'timestamp',
            label: t('tools.timestamp'),
            children: renderTool(
              timestampState,
              (v) => setTimestampState({ input: v, output: '', error: null }),
              () =>
                setTimestampState(
                  transform(timestampState.input, (value) => {
                    try {
                      const numeric = Number(value);
                      const date = Number.isFinite(numeric) && value.trim() !== ''
                        ? new Date(value.includes('-') || value.includes(':') ? value : numeric < 1e12 ? numeric * 1000 : numeric)
                        : new Date(value);
                      if (Number.isNaN(date.getTime())) {
                        return t('tools.invalidInput');
                      }
                      return `${date.toLocaleString()} (${t('tools.unixLabel')}: ${Math.floor(date.getTime() / 1000)})`;
                    } catch {
                      return t('tools.invalidInput');
                    }
                  }),
                ),
              t('tools.convert'),
              t('tools.timestamp'),
            ),
          },
          {
            key: 'uuid',
            label: t('tools.uuid'),
            children: (
              <div style={panelStyle}>
                <div>
                  <Button type="primary" onClick={generateUuids}>
                    {t('tools.generate')}
                  </Button>
                </div>
                {uuidOutput ? (
                  <div>
                    <Typography.Text type="secondary" style={labelStyle}>
                      {t('tools.uuid')}
                    </Typography.Text>
                    <pre className="site-tool-output">{uuidOutput}</pre>
                  </div>
                ) : null}
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
