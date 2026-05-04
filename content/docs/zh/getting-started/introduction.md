---
title: 简介
category: 入门指南
order: 1
tags:
  - 简介
  - 概况
---

欢迎使用 API 文档。本平台提供强大的 API，用于构建智能应用。

## 核心功能

- **对话补全** — 使用先进的语言模型生成对话回复
- **文本嵌入** — 创建文本的向量表示，用于语义搜索
- **代码生成** — 生成和补全多语言代码片段

## 基础 URL

所有 API 请求应发送至：

```
https://api.example.com/v1
```

## 认证

所有 API 请求需要通过 API 密钥进行认证。在 `Authorization` 请求头中包含您的密钥：

```bash
curl https://api.example.com/v1/chat/completions \
  -H "Authorization: Bearer YOUR_API_KEY"
```

## 速率限制

| 套餐       | 请求/分钟 | Token/分钟 |
|------------|----------|-----------|
| 免费版     | 20       | 60,000    |
| 专业版     | 100      | 300,000   |
| 企业版     | 1,000    | 3,000,000 |

## 快速开始

以下是一个最小示例，帮助您快速上手：

```python
import requests

response = requests.post(
    "https://api.example.com/v1/chat/completions",
    headers={
        "Authorization": "Bearer YOUR_API_KEY",
        "Content-Type": "application/json"
    },
    json={
        "model": "model-v1",
        "messages": [{"role": "user", "content": "你好！"}]
    }
)
print(response.json())
```
