# 世界知识文档 (World Knowledge Docs) — Markdown CMS v1.0.0

基于 Next.js 16 的 Markdown 内容管理系统，支持文档管理、在线编辑、多语言、深色模式、权限控制等功能。

## 功能特性

- **Markdown 文档管理** — 基于文件系统的 Markdown 文档存储，支持 YAML frontmatter
- **在线编辑** — 后台管理支持 Markdown 实时编辑与预览（@uiw/react-md-editor）
- **分类排序管理** — 后台可视化调整前端侧边栏分类顺序
- **多语言支持** — 中英文切换，语言偏好通过 Cookie 持久化
- **深色模式** — 支持亮色/深色主题切换
- **全局搜索** — 全站文档全文搜索
- **GitHub 风格渲染** — Markdown 内容以 GitHub 风格展示，含代码语法高亮（prism-react-renderer）
- **权限管理** — 管理员/编辑者/查看者角色控制
- **用户管理** — 后台用户创建、角色分配、删除
- **修改密码** — 支持管理员在线修改密码
- **版本历史** — 文档编辑历史记录与回溯
- **面包屑导航** — 管理后台全局面包屑导航+主页快捷入口

## 技术栈

- **框架**: Next.js 16 (App Router) + TypeScript
- **样式**: Tailwind CSS v4
- **数据库**: SQLite (better-sqlite3)
- **文档存储**: Markdown 文件 (content/docs/)
- **认证**: JWT (jsonwebtoken + bcryptjs)
- **Markdown 渲染**: react-markdown + prism-react-renderer
- **Markdown 编辑器**: @uiw/react-md-editor
- **深色模式**: next-themes

## 快速开始

```bash
# 安装依赖
npm install

# 开发服务器
npm run dev

# 构建生产版本
npm run build

# 启动生产服务
npm start
```

访问 [http://localhost:3000](http://localhost:3000) 查看文档。

默认管理账号：`admin` / `admin123`

## 项目结构

```
content/
  docs/                  # Markdown 文档文件 (en/zh)
  categories.json        # 分类排序配置
src/
  app/
    docs/                # 文档查看页面 (含 TOC、前后导航、版权)
    admin/               # 管理后台
      (dashboard)/       # 仪表盘、文档管理、用户管理、分类排序、修改密码
      login/             # 登录页
    api/                 # API 路由 (auth/documents/search/categories)
  components/
    Sidebar.tsx          # 前端侧边栏 (含版本号)
    TableOfContents.tsx  # 右侧目录导航
    CodeBlock.tsx        # 代码高亮
    admin/               # 后台管理组件
  lib/                   # 工具库 (数据库、认证、文档读写)
```

## 管理后台

| 功能 | 路径 |
|------|------|
| 仪表盘 | `/admin` |
| 文档管理 | `/admin/documents` |
| 新建文档 | `/admin/documents/new` |
| 分类排序 | `/admin/categories` |
| 用户管理 | `/admin/users` |
| 修改密码 | `/admin/password` |

## 部署

### 方案一：VPS / 服务器部署（推荐）

```bash
# 克隆代码
git clone https://github.com/isaveall/world-knowledge.git
cd world-knowledge
npm install
npm run build

# 使用 PM2 守护进程
npm install -g pm2
pm2 start npm --name "world-knowledge" -- start
pm2 save
pm2 startup
```

Nginx 反代配置：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 方案二：Vercel

```bash
npm install -g vercel
vercel --prod
```

> 注意：使用 `better-sqlite3`，Vercel 需要额外配置 Serverless Function。

### 方案三：Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

```bash
docker build -t world-knowledge .
docker run -d -p 3000:3000 --name wk world-knowledge
```

## License

Copyright © 2026 iSaveall, 骏九文化 Inc.
