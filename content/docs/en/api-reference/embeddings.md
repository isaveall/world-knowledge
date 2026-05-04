---
title: "Embeddings"
category: "API Reference"
order: 2
tags: ["api", "embeddings", "vectors"]
api_method: "POST"
api_path: "/v1/embeddings"
---

# Embeddings

Creates an embedding vector representing the input text.

## Request

### HTTP Request

```
POST https://api.example.com/v1/embeddings
```

### Request Body

| Parameter | Type     | Required | Description                                    |
|-----------|----------|----------|------------------------------------------------|
| `model`   | string   | Yes      | ID of the model (e.g., `embed-v1`)             |
| `input`   | string/array | Yes  | Text to embed. String or array of strings      |
| `encoding_format` | string | No | Format of the output: `float` or `base64`     |

## Response

```json
{
  "object": "list",
  "data": [
    {
      "object": "embedding",
      "index": 0,
      "embedding": [0.0023, -0.0124, 0.0456, "... 1533 more floats"]
    }
  ],
  "model": "embed-v1",
  "usage": {
    "prompt_tokens": 8,
    "total_tokens": 8
  }
}
```

## Examples

### Single Text

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
        "input": "The quick brown fox jumps over the lazy dog"
    }
)
embedding = response.json()["data"][0]["embedding"]
print(f"Dimension: {len(embedding)}")
```

```bash
curl https://api.example.com/v1/embeddings \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "embed-v1",
    "input": "The quick brown fox jumps over the lazy dog"
  }'
```

### Batch Embeddings

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
            "First text to embed",
            "Second text to embed",
            "Third text to embed"
        ]
    }
)
for item in response.json()["data"]:
    print(f"Index {item['index']}: {len(item['embedding'])} dimensions")
```
