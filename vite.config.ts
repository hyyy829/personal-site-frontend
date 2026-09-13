import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

/**
 * 解析依赖包名：pnpm 的模块 id 形如 `.../node_modules/.pnpm/antd@5/node_modules/antd/es/...`，
 * 必须取最后一个 node_modules 之后的路径段，否则会把 `.pnpm` 目录误当成包名。
 */
function resolvePackageName(id: string): string | null {
  const normalized = id.replace(/\\/g, '/');
  const marker = '/node_modules/';
  const index = normalized.lastIndexOf(marker);
  if (index === -1) {
    return null;
  }
  const [first, second] = normalized.slice(index + marker.length).split('/');
  if (!first) {
    return null;
  }
  return first.startsWith('@') && second ? `${first}/${second}` : first;
}

/** 手动拆包：第三方库体积大且更新频率低于业务代码，独立成 chunk 可避免业务改动让其缓存整体失效 */
function resolveVendorChunk(id: string): string | undefined {
  const pkg = resolvePackageName(id);
  if (!pkg) {
    return undefined;
  }
  if (
    pkg === 'react' ||
    pkg === 'react-dom' ||
    pkg === 'react-router' ||
    pkg === 'react-router-dom' ||
    pkg === 'scheduler'
  ) {
    return 'react';
  }
  if (
    pkg === 'antd' ||
    pkg === 'dayjs' ||
    pkg.startsWith('@ant-design/') ||
    pkg.startsWith('@rc-component/') ||
    pkg.startsWith('rc-')
  ) {
    return 'antd';
  }
  if (pkg === 'i18next' || pkg === 'react-i18next') {
    return 'i18n';
  }
  return undefined;
}

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 1024,
    rollupOptions: {
      output: {
        manualChunks: resolveVendorChunk,
      },
    },
  },
});
