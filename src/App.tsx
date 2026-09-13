import { useEffect, useMemo } from 'react';
import { RouterProvider } from 'react-router-dom';
import { App as AntdApp, ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import enUS from 'antd/locale/en_US';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import { router } from '@/router';
import { useLocaleStore } from '@/stores/locale';
import { useThemeStore } from '@/stores/theme';
import { buildAntdTheme } from '@/styles/antdTheme';
import { setMessageInstance } from '@/utils/feedback';

/** 把带主题上下文的 message 实例交给非组件模块（请求拦截器等）使用 */
function MessageBridge() {
  const { message } = AntdApp.useApp();

  useEffect(() => {
    setMessageInstance(message);
  }, [message]);

  return null;
}

/** 应用根组件：Ant Design 主题 / 语言 / 全局消息上下文 */
export default function App() {
  const { language } = useLocaleStore();
  const { resolved } = useThemeStore();

  const antdLocale = language === 'zh-CN' ? zhCN : enUS;
  const antdTheme = useMemo(() => buildAntdTheme(resolved), [resolved]);

  // DatePicker 等日期组件的月份与星期名称来自 dayjs，必须与站点语言同步
  useEffect(() => {
    dayjs.locale(language === 'zh-CN' ? 'zh-cn' : 'en');
    // <html lang> 跟随站点语言，供屏幕阅读器与搜索引擎判定（初始值在 index.html）
    document.documentElement.lang = language;
  }, [language]);

  return (
    <ConfigProvider locale={antdLocale} theme={antdTheme}>
      <AntdApp component={false}>
        <MessageBridge />
        <RouterProvider router={router} />
      </AntdApp>
    </ConfigProvider>
  );
}
