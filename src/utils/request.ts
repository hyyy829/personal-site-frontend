import axios, { AxiosError } from 'axios';
import { Toast } from '@douyinfe/semi-ui';
import { getToken, clearToken } from '@/utils/token';

interface ApiEnvelope {
  code?: number;
  message?: string;
  data?: unknown;
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
      Toast.error(envelope.message || 'Error');
      return Promise.reject(new Error(envelope.message));
    }
    return response.data;
  },
  (error: AxiosError<ApiEnvelope>) => {
    const message = error.response?.data?.message || error.message || 'Network error';
    Toast.error(message);
    return Promise.reject(error);
  },
);

export default request;
