# 世界知识文档 (World Knowledge Docs) — Markdown CMS v1.0.1

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

#### 方式 A：Git 克隆部署

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
```

#### 方式 B：本地构建后上传部署

适用于生产服务器无 git 或需快速从开发机同步的场景。

```bash
# 1. 在开发机打包（排除 node_modules、构建产物、git 记录）
tar --exclude='node_modules' --exclude='.next' --exclude='.git' --exclude='.DS_Store' -czf world-knowledge.tar.gz .

# 2. 上传到服务器
scp world-knowledge.tar.gz root@your-server:/usr/share/nginx/html/

# 3. 在服务器上解压并部署
ssh root@your-server
rm -rf /usr/share/nginx/html/world-knowledge
cd /usr/share/nginx/html
tar xzf world-knowledge.tar.gz -C world-knowledge
rm world-knowledge.tar.gz

# 4. 确保 Node.js 版本 ≥ 18（建议 20+）
source ~/.nvm/nvm.sh
nvm install 20
nvm alias default 20

# 5. 安装依赖并构建
cd /usr/share/nginx/html/world-knowledge
npm ci
npm run build

# 6. PM2 启动
npm install -g pm2
pm2 start npm --name "world-knowledge" -- start
pm2 save
```

### Nginx 反代配置

```nginx
# 标准配置（端口 80/443）
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    client_max_body_size 20m;
}

# 自定义端口配置（如 8443 映射到内部端口 3002）
server {
    listen 8443;
    server_name www.heyanper.top;

    location / {
        proxy_pass http://127.0.0.1:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host:8443;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    client_max_body_size 20m;
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
