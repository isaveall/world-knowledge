---
title: 对话补全
category: API 参考
order: 1
tags:
  - api
  - 对话
  - 补全
api_method: POST
api_path: /v1/chat/completions
---

为给定的对话生成模型响应。

## 请求

### HTTP 请求

```
POST https://api.example.com/v1/chat/completions
```

### 请求体

| 参数              | 类型    | 必填  | 说明                                      |
|-------------------|---------|-------|------------------------------------------|
| `model`           | string  | 是    | 模型 ID（例如 `model-v1`、`model-v2`）     |
| `messages`        | array   | 是    | 构成对话的消息列表                         |
| `temperature`     | number  | 否    | 采样温度，0 到 2 之间。默认值：1           |
| `max_tokens`      | integer | 否    | 最大生成 token 数。默认值：4096            |
| `stream`          | boolean | 否    | 是否流式返回部分响应。默认值：false         |
| `top_p`           | number  | 否    | 核采样参数。默认值：1                      |

### 消息对象

| 字段      | 类型   | 说明                                      |
|-----------|--------|------------------------------------------|
| `role`    | string | `system`、`user`、`assistant` 或 `tool`   |
| `content` | string | 消息内容                                  |
| `name`    | string | 可选。参与者的标识符                       |

## 响应

### 成功响应

```json
{
  "id": "chatcmpl-abc123",
  "object": "chat.completion",
  "created": 1699876543,
  "model": "model-v1",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "你好！今天有什么可以帮助你的吗？"
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 10,
    "completion_tokens": 12,
    "total_tokens": 22
  }
}
```

### 响应字段

| 字段                     | 类型    | 说明                     |
|--------------------------|---------|--------------------------|
| `id`                     | string  | 补全的唯一标识             |
| `object`                 | string  | 始终为 `"chat.completion"` |
| `created`                | integer | 创建的 Unix 时间戳         |
| `model`                  | string  | 用于补全的模型             |
| `choices`                | array   | 补全选项列表               |
| `usage`                  | object  | Token 使用统计             |

## 示例

### 基础对话

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
        "messages": [
            {"role": "system", "content": "你是一个有帮助的助手。"},
            {"role": "user", "content": "法国的首都是哪里？"}
        ]
    }
)
print(response.json()["choices"][0]["message"]["content"])
```

```bash
curl https://api.example.com/v1/chat/completions \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "model-v1",
    "messages": [
      {"role": "system", "content": "你是一个有帮助的助手。"},
      {"role": "user", "content": "法国的首都是哪里？"}
    ]
  }'
```

### 流式输出

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
        "messages": [{"role": "user", "content": "给我讲个故事"}],
        "stream": True
    },
    stream=True
)

for line in response.iter_lines():
    if line:
        print(line.decode("utf-8"))
```
