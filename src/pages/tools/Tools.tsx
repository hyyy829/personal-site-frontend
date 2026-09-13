import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Tabs, TextArea, Typography } from '@douyinfe/semi-ui';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

interface ToolState {
  input: string;
  output: string;
  error: string | null;
}

const INITIAL: ToolState = { input: '', output: '', error: null };

function formatJson(input: string): ToolState {
  try {
    return { input, output: JSON.stringify(JSON.parse(input), null, 2), error: null };
  } catch (error) {
    return { input, output: '', error: (error as Error).message };
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
  ) => (
    <div style={{ display: 'grid', gap: 12, maxWidth: 760 }}>
      <TextArea rows={6} value={state.input} onChange={(value: string) => onInput(value ?? '')} />
      <div>
        <Button theme="solid" onClick={onRun} disabled={!state.input}>
          {runLabel}
        </Button>
      </div>
      {state.error && <Typography.Text type="danger">{state.error}</Typography.Text>}
      {state.output && <TextArea rows={6} value={state.output} readOnly />}
    </div>
  );

  return (
    <div style={{ maxWidth: 800 }}>
      <h1 className="site-section-title" style={{ fontSize: 'var(--site-font-size-xxl)', margin: 0 }}>
        {t('common.nav.tools')}
      </h1>
      <Typography.Paragraph type="tertiary">{t('tools.subtitle')}</Typography.Paragraph>

      <Tabs type="line">
        <Tabs.TabPane tab={t('tools.json')} itemKey="json">
          {renderTool(jsonState, (v) => setJsonState({ input: v, output: '', error: null }), () => setJsonState(formatJson(jsonState.input)), t('tools.run'))}
        </Tabs.TabPane>
        <Tabs.TabPane tab={t('tools.base64')} itemKey="base64">
          {renderTool(
            base64State,
            (v) => setBase64State({ input: v, output: '', error: null }),
            () =>
              setBase64State(
                transform(base64State.input, (value) =>
                  btoa(String.fromCharCode(...new TextEncoder().encode(value))),
                ),
              ),
            t('tools.encode'),
          )}
        </Tabs.TabPane>
        <Tabs.TabPane tab={t('tools.timestamp')} itemKey="timestamp">
          {renderTool(
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
                    return `${date.toLocaleString()} (unix: ${Math.floor(date.getTime() / 1000)})`;
                  } catch {
                    return t('tools.invalidInput');
                  }
                }),
              ),
            t('tools.convert'),
          )}
        </Tabs.TabPane>
        <Tabs.TabPane tab={t('tools.uuid')} itemKey="uuid">
          <div style={{ display: 'grid', gap: 12, maxWidth: 760 }}>
            <Button theme="solid" onClick={generateUuids}>
              {t('tools.generate')}
            </Button>
            {uuidOutput && <TextArea rows={5} value={uuidOutput} readOnly />}
          </div>
        </Tabs.TabPane>
      </Tabs>
    </div>
  );
}
