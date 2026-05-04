---
title: 文本嵌入
category: API 参考
order: 2
tags:
  - api
  - 嵌入
  - 向量
api_method: POST
api_path: /v1/embeddings
---

创建表示输入文本的嵌入向量。

## 请求

### HTTP 请求

```
POST https://api.example.com/v1/embeddings
```

### 请求体

| 参数              | 类型          | 必填  | 说明                                    |
|-------------------|---------------|-------|----------------------------------------|
| `model`           | string        | 是    | 模型 ID（例如 `embed-v1`）              |
| `input`           | string/array  | 是    | 要嵌入的文本。字符串或字符串数组         |
| `encoding_format` | string        | 否    | 输出格式：`float` 或 `base64`           |

## 响应

```json
{
  "object": "list",
  "data": [
    {
      "object": "embedding",
      "index": 0,
      "embedding": [0.0023, -0.0124, 0.0456, "... 还有 1533 个浮点数"]
    }
  ],
  "model": "embed-v1",
  "usage": {
    "prompt_tokens": 8,
    "total_tokens": 8
  }
}
```

## 示例

### 单个文本

```python
import requests

response = requests.post(
    "https://api.example.com/v1/embeddings",
    headers={
        "Authorization": "Bearer YOUR_API_KEY",
        "Content-Type": "application/json"
    },
    json={
        "model": "embed-v1",
        "input": "快速的棕色狐狸跳过了懒惰的狗"
    }
)
embedding = response.json()["data"][0]["embedding"]
print(f"向量维度: {len(embedding)}")
```

### 批量嵌入

```python
response = requests.post(
    "https://api.example.com/v1/embeddings",
    headers={
        "Authorization": "Bearer YOUR_API_KEY",
        "Content-Type": "application/json"
    },
    json={
        "model": "embed-v1",
        "input": [
            "第一段要嵌入的文本",
            "第二段要嵌入的文本",
            "第三段要嵌入的文本"
        ]
    }
)
for item in response.json()["data"]:
    print(f"索引 {item['index']}: {len(item['embedding'])} 维")
```
