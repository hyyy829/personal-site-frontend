import { lazy, Suspense } from 'react';
import type { ReactNode } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import type { RouteObject } from 'react-router-dom';
import { Spin } from 'antd';
import PublicLayout from '@/layouts/PublicLayout';
import AdminLayout from '@/layouts/AdminLayout';
import RequireAuth from '@/router/RequireAuth';
import RequirePermission from '@/router/RequirePermission';

const Home = lazy(() => import('@/pages/home/Home'));
const BlogList = lazy(() => import('@/pages/blog/BlogList'));
const BlogDetailPage = lazy(() => import('@/pages/blog/BlogDetail'));
const About = lazy(() => import('@/pages/about/About'));
const ProjectList = lazy(() => import('@/pages/project/ProjectList'));
const ProjectDetailPage = lazy(() => import('@/pages/project/ProjectDetail'));
const TimelinePage = lazy(() => import('@/pages/timeline/Timeline'));
const Guestbook = lazy(() => import('@/pages/guestbook/Guestbook'));
const Tools = lazy(() => import('@/pages/tools/Tools'));
const Search = lazy(() => import('@/pages/search/Search'));
const Login = lazy(() => import('@/pages/admin/Login'));
const Dashboard = lazy(() => import('@/pages/admin/Dashboard'));
const BlogManage = lazy(() => import('@/pages/admin/BlogManage'));
const ProjectManage = lazy(() => import('@/pages/admin/ProjectManage'));
const UserManage = lazy(() => import('@/pages/admin/UserManage'));
const RoleManage = lazy(() => import('@/pages/admin/RoleManage'));
const PermissionManage = lazy(() => import('@/pages/admin/PermissionManage'));
const TenantManage = lazy(() => import('@/pages/admin/TenantManage'));
const ConfigManage = lazy(() => import('@/pages/admin/ConfigManage'));
const CommentManage = lazy(() => import('@/pages/admin/CommentManage'));
const FriendLinkManage = lazy(() => import('@/pages/admin/FriendLinkManage'));
const TimelineManage = lazy(() => import('@/pages/admin/TimelineManage'));
const FileManage = lazy(() => import('@/pages/admin/FileManage'));
const OperationLogPage = lazy(() => import('@/pages/admin/OperationLogPage'));
const LoginLogPage = lazy(() => import('@/pages/admin/LoginLogPage'));
const NotFound = lazy(() => import('@/pages/NotFound'));

/**
 * 后台子路由：permission 与 AdminLayout 中 ADMIN_MENUS 的权限码一一对应，
 * 为空表示不做页面级控制（CONSTRAINTS.md 7.1.4 / PROJECT.md 10.6）。
 * 前端拦截只是体验层，接口权限始终由后端最终校验。
 */
const ADMIN_ROUTES: { path: string; permission?: string; element: ReactNode }[] = [
  { path: 'blog', permission: 'blog:view', element: <BlogManage /> },
  { path: 'project', permission: 'project:view', element: <ProjectManage /> },
  { path: 'comment', permission: 'comment:view', element: <CommentManage /> },
  { path: 'friendlink', permission: 'friendlink:view', element: <FriendLinkManage /> },
  { path: 'timeline', permission: 'timeline:view', element: <TimelineManage /> },
  { path: 'file', permission: 'file:view', element: <FileManage /> },
  { path: 'user', permission: 'system:view', element: <UserManage /> },
  { path: 'role', permission: 'system:view', element: <RoleManage /> },
  { path: 'permission', permission: 'system:view', element: <PermissionManage /> },
  { path: 'tenant', permission: 'tenant:manage', element: <TenantManage /> },
  { path: 'system', permission: 'system:view', element: <ConfigManage /> },
  { path: 'operation-log', permission: 'operationlog:view', element: <OperationLogPage /> },
  { path: 'login-log', permission: 'loginlog:view', element: <LoginLogPage /> },
];

const adminChildren: RouteObject[] = [
  { index: true, element: <Dashboard /> },
  ...ADMIN_ROUTES.map(
    ({ path, permission, element }): RouteObject => ({
      path,
      element: permission ? <RequirePermission permission={permission}>{element}</RequirePermission> : element,
    }),
  ),
];

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
      { path: '/timeline', element: <TimelinePage /> },
      { path: '/tools', element: <Tools /> },
      { path: '/guestbook', element: <Guestbook /> },
      { path: '/about', element: <About /> },
      { path: '/search', element: <Search /> },
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
    children: adminChildren,
  },
  {
    // 兜底路由不在任何布局内，缺少布局的 Suspense，需自带边界
    path: '*',
    element: (
      <Suspense
        fallback={
          <div className="site-state">
            <Spin size="large" />
          </div>
        }
      >
        <NotFound />
      </Suspense>
    ),
  },
]);
