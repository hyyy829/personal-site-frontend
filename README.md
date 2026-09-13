# personal-site-frontend

个人网站前端仓库：React + TypeScript + Vite + Ant Design。包含前台（首页 / 博客 / 项目 / 时间线 / 工具箱 / 留言 / 关于 / 搜索）与后台（登录 / 仪表盘 / 内容管理 / 用户角色权限 / 租户 / 文件 / 系统设置 / 日志），支持中英文切换与浅色、深色、跟随系统三种主题。

与后端仓库 `personal-site-backend` 通过 HTTP API 交互，契约以后端 springdoc-openapi 文档为准（`http://127.0.0.1:8081/swagger-ui.html`）。接口变更流程：后端提交并更新 OpenAPI → 前端同步类型（CONSTRAINTS.md 9.6）。

## 1. 技术栈

- React 18 + TypeScript（strict）+ Vite 7
- Ant Design 5.29（组件库）+ `@ant-design/icons`（图标）+ dayjs（日期）
- React Router 7（路由懒加载）、Zustand（主题 / 语言 / 会话状态）
- Axios（统一请求实例：R 信封解包、401 处理、`site-token` 头）
- react-i18next + i18next（zh-CN / en-US，全部用户可见文本走 i18n）
- marked + DOMPurify（博客 Markdown 渲染与 XSS 消毒）
- pnpm（禁止混用 npm / yarn）

## 2. 项目结构

```text
src
├── api/          # auth、blog、project、comment、content、system、infra、search
├── assets/
├── components/
│   ├── common/   # ThemeToggle、LanguageToggle、PageHeader
│   └── blog/     # MarkdownView、CommentSection
├── hooks/        # useDocumentTitle
├── layouts/      # PublicLayout（前台）、AdminLayout（后台）
├── locales/      # zh-CN / en-US，16 个模块命名空间
├── pages/        # home、blog、about、project、timeline、tools、guestbook、search、admin
├── router/       # 路由表 + RequireAuth 守卫
├── stores/       # theme、locale、auth（Zustand）
├── styles/       # tokens.css（设计 Token）、global.css、antdTheme.ts（Token → antd 主题）
├── types/        # 与后端 DTO/VO 对齐
├── utils/        # request、i18n、markdown、token、feedback
└── App.tsx
```

## 3. 环境要求

- Node.js 20.19+（推荐 22/24）、pnpm 9+（当前开发环境为 pnpm 11）
- 后端：网关运行于 `127.0.0.1:8080`（本地开发经 Vite 代理，无需处理跨域）

## 4. 环境变量

- `.env.development` / `.env.production`：`VITE_API_BASE_URL=/api`（同源相对路径；开发经 Vite 代理，生产由 Nginx 反代）。
- `.env.local` 类文件不入库（.gitignore 已覆盖），禁止提交任何密钥。

## 5. 本地依赖（数据库 / Nacos / Docker）

前端自身不需要数据库，但页面数据来自后端服务，因此本地开发前必须先起后端依赖：

1. Docker 启动基础设施（PostgreSQL / Redis / Nacos / MinIO）：

   ```bash
   cd ../personal-site-backend
   cp .env.example .env        # 按需修改，.env 不入库
   docker compose up -d
   docker compose ps
   ```

   容器数据以**宿主机目录绑定挂载**保存在 `personal-site-backend/docker-data/`（postgres / redis / minio / nacos），可直接查看与备份；换盘用 `.env` 的 `SITE_DATA_DIR`。详见后端 README 第 8.3 节。

2. 数据库初始化：由后端启动时的 Flyway 自动完成（`backend/src/main/resources/db/migration/V*.sql`），空库直接启动即可，无需手工建表；禁止手工改库（CONSTRAINTS.md 6.2）。
3. Nacos：注册与配置中心，控制台 `http://127.0.0.1:18080`。后端以 `optional:nacos:site-service-dev.yml` 形式导入配置，缺失时使用 `application-dev.yml` 默认值；需要在 Nacos 覆盖参数时按 `site-service-<env>.yml` / `gateway-service-<env>.yml` 命名创建。
4. MinIO 控制台 `http://127.0.0.1:19001`，文件管理模块依赖它；未启动时上传接口返回统一错误码 50001。

## 6. 本地启动

```bash
pnpm install
pnpm dev        # http://localhost:5173
```

前置条件：后端网关与业务服务已启动（见后端仓库 README）。

## 7. 构建

```bash
pnpm build      # tsc --noEmit 类型检查 + vite build
pnpm preview    # 本地预览构建产物
```

## 8. 账号说明

- 种子账号 `admin`：口令由后端 Flyway 种子迁移脚本内置（本文件不记录明文，见 `personal-site-backend` 的 `db/migration/V1__init_schema_and_seed.sql`），**生产部署后必须立即修改**。
- 登录地址：`/login`，成功后进入 `/admin`；受保护路由由 `router/RequireAuth.tsx` 守卫，未登录跳转登录页并携带 `?expired=1`。

## 9. 路由结构

```text
前台：/  /blog  /blog/:id  /project  /project/:id  /timeline  /tools  /guestbook  /about  /search
后台：/login  /admin  /admin/blog  /admin/project  /admin/comment  /admin/friendlink
      /admin/timeline  /admin/file  /admin/user  /admin/role  /admin/permission
      /admin/tenant  /admin/system  /admin/operation-log  /admin/login-log
```

- 后台菜单来自 `GET /api/auth/menus`（菜单/按钮统一登记在 `sys_permission`，管理员在"权限管理"页面维护），取不到时回退到 `AdminLayout` 内置菜单，保证后台始终可用；前端按权限码过滤仅是体验层，接口权限由后端 `@SaCheckPermission` 最终校验。
- 后台路由声明所需权限码（`router/index.tsx` + `RequirePermission`），缺少权限时渲染"无访问权限"提示而不是跳转；权限尚未加载完成时显示加载态，避免误报。
- 前台路由切换时自动上报访问统计（`POST /api/stats/visit`，仅路径聚合计数）。
- `/tools` 为纯前端小工具（JSON 格式化 / Base64 / 时间戳 / UUID），数据不出浏览器。

## 10. 主题与国际化

- 主题：`stores/theme.ts` 统一管理 `light / dark / system`，持久化于 localStorage，支持跟随系统；深浅色通过 `<html theme-mode="dark">` 表达，`index.html` 内联脚本在渲染前落定，避免首屏闪白。组件内不做散落的深浅色判断。
- 设计 Token：`styles/tokens.css` 是颜色 / 字体 / 间距 / 圆角的唯一出处；`styles/antdTheme.ts` 在运行时读取这些变量构造 Ant Design 的 `ConfigProvider` 主题，因此新增颜色只改 Token。
- 语言：`stores/locale.ts` + `utils/i18n.ts`，切换后页面文本、Ant Design 组件语言、dayjs 日期语言、页面标题立即刷新。

## 11. 部署说明

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
