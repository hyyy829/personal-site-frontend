# personal-site-frontend

个人网站前端仓库：React + TypeScript + Vite + Semi Design。包含前台（首页 / 博客 / 项目 / 关于）与后台（登录 / 仪表盘 / 博客管理 / 权限化菜单骨架），支持中英文切换与浅色/深色主题。

与后端仓库 `personal-site-backend` 通过 HTTP API 交互，契约以后端 springdoc-openapi 文档为准（`http://127.0.0.1:8081/swagger-ui.html`）。接口变更流程：后端提交并更新 OpenAPI → 前端同步类型（CONSTRAINTS.md 9.6）。

## 1. 技术栈

- React 18 + TypeScript（strict）+ Vite 7
- Semi Design（组件库，深色模式经 `body[theme-mode='dark']` 接入）
- React Router 7（路由懒加载）、Zustand（主题/语言/会话状态）
- Axios（统一请求实例：R 信封解包、401 处理、`site-token` 头）
- react-i18next + i18next（zh-CN / en-US，全部用户可见文本走 i18n）
- marked + DOMPurify（博客 Markdown 渲染与 XSS 消毒）
- pnpm（禁止混用 npm / yarn）

## 2. 项目结构

```text
src
├── api/          # auth、blog（按模块扩展）
├── assets/
├── components/
│   ├── common/   # ThemeToggle、LanguageToggle、PagePlaceholder
│   ├── blog/     # MarkdownView
│   └── layout/
├── hooks/        # useDocumentTitle
├── layouts/      # PublicLayout（前台）、AdminLayout（后台）
├── locales/      # zh-CN / en-US 七个命名空间
├── pages/        # home、blog、about、project、admin
├── router/       # 路由表 + RequireAuth 守卫
├── stores/       # theme、locale、auth（Zustand）
├── styles/       # tokens.css（设计 Token）、global.css
├── types/        # common、auth、blog（与后端 DTO/VO 对齐）
├── utils/        # request、i18n、markdown、token
└── App.tsx
```

## 3. 环境要求

- Node.js 20.19+（推荐 22/24）、pnpm 9+（当前开发环境为 pnpm 11）
- 后端：网关运行于 `127.0.0.1:8080`（本地开发经 Vite 代理，无需处理跨域）

## 4. 环境变量

- `.env.development` / `.env.production`：`VITE_API_BASE_URL=/api`（同源相对路径；开发经 Vite 代理，生产由 Nginx 反代）。
- `.env.local` 类文件不入库（.gitignore 已覆盖），禁止提交任何密钥。

## 5. 本地启动

```bash
pnpm install
pnpm dev        # http://localhost:5173
```

前置条件：后端网关与业务服务已启动（见后端仓库 README 第 7 节），种子账号 `admin / admin123`。

## 6. 构建

```bash
pnpm build      # tsc --noEmit 类型检查 + vite build
pnpm preview    # 本地预览构建产物
```

## 7. 路由结构

```text
前台：/  /blog  /blog/:id  /project  /project/:id  /timeline  /tools  /guestbook  /about  /search
后台：/login  /admin  /admin/blog  /admin/project  /admin/comment  /admin/friendlink
      /admin/timeline  /admin/file  /admin/user  /admin/role  /admin/permission
      /admin/tenant  /admin/system  /admin/operation-log  /admin/login-log
```

- 后台菜单按 `/api/auth/me` 返回的权限码过滤（体验层），接口权限由后端 `@SaCheckPermission` 最终校验。
- 前台路由切换时自动上报访问统计（`POST /api/stats/visit`，仅路径聚合计数）。
- `/tools` 为纯前端小工具（JSON 格式化 / Base64 / 时间戳 / UUID），数据不出浏览器。
- 文件管理依赖 MinIO/OSS：对象存储未启动时上传返回统一错误码 50001。

## 8. 主题与国际化

- 主题：`stores/theme.ts` 统一管理 `light / dark / system`，持久化于 localStorage，支持跟随系统；组件内不做散落的深浅色判断，颜色/字体/间距取自 `styles/tokens.css`。
- 语言：`stores/locale.ts` + `utils/i18n.ts`，切换后页面文本、Semi 组件语言、页面标题立即刷新。

## 9. 部署说明

1. `pnpm build` 产出 `dist/`。
2. Nginx 托管 `dist/` 并将 `/api` 反代到网关：

   ```nginx
   server {
     listen 80;
     root /var/www/site/dist;
     location /api/ { proxy_pass http://gateway:8080; }
     location / { try_files $uri $uri/ /index.html; }
   }
   ```

3. 发布时记录本仓库提交与后端仓库提交的对应版本，保证前后端组合可回溯（CONSTRAINTS.md 9.6.3）。
