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
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'blog', element: <BlogManage /> },
      { path: 'project', element: <ProjectManage /> },
      { path: 'comment', element: <CommentManage /> },
      { path: 'friendlink', element: <FriendLinkManage /> },
      { path: 'timeline', element: <TimelineManage /> },
      { path: 'file', element: <FileManage /> },
      { path: 'user', element: <UserManage /> },
      { path: 'role', element: <RoleManage /> },
      { path: 'permission', element: <PermissionManage /> },
      { path: 'tenant', element: <TenantManage /> },
      { path: 'system', element: <ConfigManage /> },
      { path: 'operation-log', element: <OperationLogPage /> },
      { path: 'login-log', element: <LoginLogPage /> },
    ],
  },
  { path: '*', element: <NotFound /> },
]);
