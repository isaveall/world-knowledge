---
title: List Models
category: API Reference
order: 3
tags:
  - api
  - models
api_method: GET
api_path: /v1/models
---

Lists the currently available models.

## Request

```
GET https://api.example.com/v1/models
```

## Response

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

## Retrieve Model

Retrieve a specific model by ID.

```
GET https://api.example.com/v1/models/{model_id}
```

### Response

```json
{
  "id": "model-v1",
  "object": "model",
  "created": 1699000000,
  "owned_by": "example"
}
```

## Examples

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
    print(f"{model['id']} (owned by {model['owned_by']})")
```
