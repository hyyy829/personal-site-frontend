import { lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import PublicLayout from '@/layouts/PublicLayout';
import AdminLayout from '@/layouts/AdminLayout';
import RequireAuth from '@/router/RequireAuth';
import NotFound from '@/pages/NotFound';

const Home = lazy(() => import('@/pages/home/Home'));
const BlogList = lazy(() => import('@/pages/blog/BlogList'));
const BlogDetailPage = lazy(() => import('@/pages/blog/BlogDetail'));
const About = lazy(() => import('@/pages/about/About'));
const ProjectList = lazy(() => import('@/pages/project/ProjectList'));
const ProjectDetailPage = lazy(() => import('@/pages/project/ProjectDetail'));
const Login = lazy(() => import('@/pages/admin/Login'));
const Dashboard = lazy(() => import('@/pages/admin/Dashboard'));
const BlogManage = lazy(() => import('@/pages/admin/BlogManage'));
const ProjectManage = lazy(() => import('@/pages/admin/ProjectManage'));
const UserManage = lazy(() => import('@/pages/admin/UserManage'));
const RoleManage = lazy(() => import('@/pages/admin/RoleManage'));
const PermissionManage = lazy(() => import('@/pages/admin/PermissionManage'));
const TenantManage = lazy(() => import('@/pages/admin/TenantManage'));
const ConfigManage = lazy(() => import('@/pages/admin/ConfigManage'));

/** 路由结构见 CONSTRAINTS.md 8.3；新增后台模块统一 /admin/<module> */
export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/blog', element: <BlogList /> },
      { path: '/blog/:id', element: <BlogDetailPage /> },
      { path: '/project', element: <ProjectList /> },
      { path: '/project/:id', element: <ProjectDetailPage /> },
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
      { path: 'project', element: <ProjectManage /> },
      { path: 'user', element: <UserManage /> },
      { path: 'role', element: <RoleManage /> },
      { path: 'permission', element: <PermissionManage /> },
      { path: 'tenant', element: <TenantManage /> },
      { path: 'system', element: <ConfigManage /> },
    ],
  },
  { path: '*', element: <NotFound /> },
]);
