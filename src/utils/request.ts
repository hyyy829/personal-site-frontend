import axios, { AxiosError } from 'axios';
import { getMessage } from '@/utils/feedback';
import i18next from '@/utils/i18n';
import { getToken, clearToken } from '@/utils/token';

interface ApiEnvelope {
  code?: number;
  message?: string;
  data?: unknown;
}

declare module 'axios' {
  export interface AxiosRequestConfig {
    /** 可选接口（如尚未上线或允许失败的调用）：失败时不弹全局提示 */
    silent?: boolean;
  }
}

/** 统一请求实例： baseURL 指向网关，R 信封在拦截器中解包 */
const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000,
});

request.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    // 后端 Sa-Token 配置的 token-name 为 site-token，前缀 Bearer
    config.headers['site-token'] = `Bearer ${token}`;
  }
  return config;
});

request.interceptors.response.use(
  (response) => {
    const envelope = response.data as ApiEnvelope;
    if (envelope && typeof envelope.code === 'number') {
      if (envelope.code === 200) {
        return envelope.data === undefined ? undefined : envelope.data;
      }
      if (envelope.code === 401) {
        clearToken();
        if (!window.location.pathname.startsWith('/login')) {
          window.location.assign('/login?expired=1');
        }
      }
      if (!response.config.silent) {
        getMessage().error(envelope.message || i18next.t('common.state.error'));
      }
      return Promise.reject(new Error(envelope.message));
    }
    return response.data;
  },
  (error: AxiosError<ApiEnvelope>) => {
    // 只透出后端文案；axios 自身的英文提示（Network Error 等）不对用户展示
    if (!error.config?.silent) {
      getMessage().error(error.response?.data?.message || i18next.t('common.state.error'));
    }
    return Promise.reject(error);
  },
);

export default request;
