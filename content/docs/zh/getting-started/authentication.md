---
title: 认证说明
category: 入门指南
order: 2
tags:
  - 认证
  - API密钥
---

## API 密钥

要使用 API，您需要一个 API 密钥。您可以在[控制台](/admin)中创建密钥。

## Bearer Token

在 `Authorization` HTTP 请求头中传递您的 API 密钥：

```bash
curl https://api.example.com/v1/chat/completions \
  -H "Authorization: Bearer sk-xxxxxxxxxxxxxxxxxxxx"
```

## 错误响应

如果认证失败，您将收到以下响应之一：

| 状态码 | 错误               | 说明                   |
|--------|--------------------|------------------------|
| 401    | `invalid_api_key`  | API 密钥无效           |
| 403    | `access_forbidden` | 密钥缺少所需权限       |
| 429    | `rate_limit`       | 请求过于频繁           |

## 最佳实践

1. **绝不在客户端代码中暴露 API 密钥** — 始终从服务端发起 API 调用
2. **使用环境变量** — 将密钥存储在 `API_KEY` 环境变量中
3. **定期轮换密钥** — 定期生成新密钥并停用旧密钥
4. **使用最小权限** — 仅创建具有所需范围的密钥
