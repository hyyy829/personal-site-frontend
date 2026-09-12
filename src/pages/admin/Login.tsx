import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, Form, Toast } from '@douyinfe/semi-ui';
import { useAuthStore } from '@/stores/auth';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

/** 后台登录页 */
export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  useDocumentTitle('auth.loginTitle');

  const { loggedIn, login } = useAuthStore();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (searchParams.get('expired') === '1') {
      Toast.warning(t('auth.expired'));
    }
  }, [searchParams, t]);

  useEffect(() => {
    if (loggedIn) {
      navigate('/admin', { replace: true });
    }
  }, [loggedIn, navigate]);

  const handleSubmit = async (values: { username: string; password: string }) => {
    setSubmitting(true);
    try {
      await login(values);
      Toast.success(t('auth.loginButton'));
      navigate('/admin', { replace: true });
    } catch {
      // 错误信息已由请求拦截器统一 Toast
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="site-login-wrapper">
      <div className="site-login-card">
        <h1 className="site-login-title">{t('auth.loginTitle')}</h1>
        <Form onSubmit={handleSubmit} labelPosition="inset">
          <Form.Input field="username" label={t('auth.username')} placeholder={t('auth.usernamePlaceholder')} rules={[{ required: true }]} />
          <Form.Input
            field="password"
            label={t('auth.password')}
            placeholder={t('auth.passwordPlaceholder')}
            mode="password"
            rules={[{ required: true }]}
          />
          <Button htmlType="submit" type="primary" theme="solid" block loading={submitting} style={{ marginTop: 16 }}>
            {t('auth.loginButton')}
          </Button>
        </Form>
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Link to="/">{t('auth.backHome')}</Link>
        </div>
      </div>
    </div>
  );
}
