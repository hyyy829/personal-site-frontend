import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { App as AntdApp, Button, Form, Input } from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { useAuthStore } from '@/stores/auth';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

interface LoginForm {
  username: string;
  password: string;
}

/** 后台登录页 */
export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { message } = AntdApp.useApp();
  useDocumentTitle('auth.loginTitle');

  const { loggedIn, login } = useAuthStore();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (searchParams.get('expired') === '1') {
      void message.warning(t('auth.expired'));
    }
  }, [searchParams, t, message]);

  useEffect(() => {
    if (loggedIn) {
      navigate('/admin', { replace: true });
    }
  }, [loggedIn, navigate]);

  const handleSubmit = async (values: LoginForm) => {
    setSubmitting(true);
    try {
      await login(values);
      void message.success(t('auth.loginSuccess'));
      navigate('/admin', { replace: true });
    } catch {
      // 错误信息已由请求拦截器统一提示
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="site-login-wrapper">
      <div className="site-login-card">
        <div className="site-login-brand">
          <span className="site-logo-mark" aria-hidden="true">
            {t('common.siteName').slice(0, 1)}
          </span>
          {t('common.siteName')}
        </div>
        <h1 className="site-login-title">{t('auth.loginTitle')}</h1>
        <p className="site-login-subtitle">{t('common.siteTagline')}</p>
        <Form<LoginForm> layout="vertical" onFinish={handleSubmit} requiredMark={false} size="large">
          <Form.Item name="username" label={t('auth.username')} rules={[{ required: true, message: t('auth.usernamePlaceholder') }]}>
            <Input prefix={<UserOutlined />} placeholder={t('auth.usernamePlaceholder')} autoComplete="username" />
          </Form.Item>
          <Form.Item name="password" label={t('auth.password')} rules={[{ required: true, message: t('auth.passwordPlaceholder') }]}>
            <Input.Password prefix={<LockOutlined />} placeholder={t('auth.passwordPlaceholder')} autoComplete="current-password" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block loading={submitting} style={{ marginTop: 'var(--site-space-2)' }}>
            {t('auth.loginButton')}
          </Button>
        </Form>
        <div className="site-login-footer">
          <Link to="/">{t('auth.backHome')}</Link>
        </div>
      </div>
    </div>
  );
}
