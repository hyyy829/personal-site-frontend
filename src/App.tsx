import { RouterProvider } from 'react-router-dom';
import { ConfigProvider } from '@douyinfe/semi-ui';
import enUS from '@douyinfe/semi-ui/lib/es/locale/source/en_US';
import zhCN from '@douyinfe/semi-ui/lib/es/locale/source/zh_CN';
import { router } from '@/router';
import { useLocaleStore } from '@/stores/locale';

/** 应用根组件：路由 + Semi 组件库语言跟随站点语言 */
export default function App() {
  const { language } = useLocaleStore();
  const semiLocale = language === 'zh-CN' ? zhCN : enUS;

  return (
    <ConfigProvider locale={semiLocale}>
      <RouterProvider router={router} />
    </ConfigProvider>
  );
}
