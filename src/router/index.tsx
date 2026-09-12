import { lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import PublicLayout from '@/layouts/PublicLayout';
import AdminLayout from '@/layouts/AdminLayout';
import RequireAuth from '@/router/RequireAuth';
import NotFound from '@/pages/NotFound';
import PagePlaceholder from '@/components/common/PagePlaceholder';

const Home = lazy(() => import('@/pages/home/Home'));
const BlogList = lazy(() => import('@/pages/blog/BlogList'));
const BlogDetailPage = lazy(() => import('@/pages/blog/BlogDetail'));
const About = lazy(() => import('@/pages/about/About'));
const Project = lazy(() => import('@/pages/project/Project'));
const Login = lazy(() => import('@/pages/admin/Login'));
const Dashboard = lazy(() => import('@/pages/admin/Dashboard'));
const BlogManage = lazy(() => import('@/pages/admin/BlogManage'));

/** 路由结构见 CONSTRAINTS.md 8.3；新增后台模块统一 /admin/<module> */
export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/blog', element: <BlogList /> },
      { path: '/blog/:id', element: <BlogDetailPage /> },
      { path: '/project', element: <Project /> },
      { path: '/about', element: <About /> },
    ],
  },
  { path: '/login', element: <Login /> },
  {
    path: '/admin',
    element: (
      <RequireAuth>
        <AdminLayout />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'blog', element: <BlogManage /> },
      { path: 'project', element: <PagePlaceholder titleKey="admin.project.title" /> },
      { path: 'user', element: <PagePlaceholder titleKey="admin.user.title" /> },
      { path: 'role', element: <PagePlaceholder titleKey="admin.role.title" /> },
      { path: 'permission', element: <PagePlaceholder titleKey="admin.permission.title" /> },
      { path: 'tenant', element: <PagePlaceholder titleKey="admin.tenantPage.title" /> },
      { path: 'system', element: <PagePlaceholder titleKey="admin.system.title" /> },
    ],
  },
  { path: '*', element: <NotFound /> },
]);
