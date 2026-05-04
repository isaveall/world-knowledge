---
title: 模型列表
category: API 参考
order: 3
tags:
  - api
  - 模型
api_method: GET
api_path: /v1/models
---
列出当前可用的模型。

## 请求

```
GET https://api.example.com/v1/models
```

## 响应

```json
{
  "object": "list",
  "data": [
    {
      "id": "model-v1",
      "object": "model",
      "created": 1699000000,
      "owned_by": "example"
    },
    {
      "id": "model-v2",
      "object": "model",
      "created": 1700000000,
      "owned_by": "example"
    },
    {
      "id": "embed-v1",
      "object": "model",
      "created": 1699000000,
      "owned_by": "example"
    }
  ]
}
```

## 获取单个模型

通过 ID 获取特定模型。

```
GET https://api.example.com/v1/models/{model_id}
```

### 响应

```json
{
  "id": "model-v1",
  "object": "model",
  "created": 1699000000,
  "owned_by": "example"
}
```

## 示例

```bash
curl https://api.example.com/v1/models \
  -H "Authorization: Bearer YOUR_API_KEY"
```

```python
import requests

response = requests.get(
    "https://api.example.com/v1/models",
    headers={"Authorization": "Bearer YOUR_API_KEY"}
)
for model in response.json()["data"]:
    print(f"{model['id']} (所有者: {model['owned_by']})")
```
