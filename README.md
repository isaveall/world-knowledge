# 世界知识文档 (World Knowledge Docs)

API 文档管理系统，支持 Markdown 文档存储、在线编辑、多语言、深色模式等功能。

## 功能特性

- **Markdown 文档管理** — 基于文件系统的 Markdown 文档存储，支持 YAML frontmatter
- **在线编辑** — 后台管理支持 Markdown 实时编辑与预览
- **多语言支持** — 中英文切换，语言偏好通过 Cookie 持久化
- **深色模式** — 支持亮色/深色主题切换
- **全局搜索** — 全站文档全文搜索
- **GitHub 风格渲染** — Markdown 内容以 GitHub 风格展示，含代码语法高亮
- **权限管理** — 管理员/编辑者/查看者角色控制
- **版本历史** — 文档编辑历史记录与回溯

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

## 项目结构

```
content/docs/          # Markdown 文档文件
src/
  app/
    docs/              # 文档查看页面
    admin/             # 管理后台
    api/               # API 路由
  components/          # UI 组件
    admin/             # 后台管理组件
  lib/                 # 工具库 (数据库、认证、文档读写)
```

## 管理后台

访问 `/admin/login` 登录管理后台，可进行文档的创建、编辑、删除和用户管理。

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
