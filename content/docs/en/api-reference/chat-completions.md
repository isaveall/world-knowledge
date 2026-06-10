---
title: Chat Completions
category: API Reference
order: 1
tags:
  - api
  - chat
  - completions
api_method: POST
api_path: /v1/chat/completions
---

Creates a model response for the given chat conversation.

## Request

### HTTP Request

```
POST https://api.example.com/v1/chat/completions
```

### Request Body

| Parameter         | Type     | Required | Description                                                |
|-------------------|----------|----------|------------------------------------------------------------|
| `model`           | string   | Yes      | ID of the model to use (e.g., `model-v1`, `model-v2`)     |
| `messages`        | array    | Yes      | A list of messages comprising the conversation so far      |
| `temperature`     | number   | No       | Sampling temperature between 0 and 2. Default: 1           |
| `max_tokens`      | integer  | No       | Maximum number of tokens to generate. Default: 4096        |
| `stream`          | boolean  | No       | Whether to stream partial responses. Default: false         |
| `top_p`           | number   | No       | Nucleus sampling parameter. Default: 1                      |
| `frequency_penalty` | number | No       | Penalize repeated tokens. Range: -2.0 to 2.0. Default: 0  |

### Message Object

| Field      | Type   | Description                                         |
|------------|--------|-----------------------------------------------------|
| `role`     | string | One of `system`, `user`, `assistant`, or `tool`     |
| `content`  | string | The content of the message                          |
| `name`     | string | Optional. An identifier for the participant         |

## Response

### Success Response

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
        "content": "Hello! How can I help you today?"
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

### Response Fields

| Field                   | Type    | Description                                      |
|-------------------------|---------|--------------------------------------------------|
| `id`                    | string  | Unique identifier for the completion              |
| `object`                | string  | Always `"chat.completion"`                        |
| `created`               | integer | Unix timestamp of creation                        |
| `model`                 | string  | The model used for completion                     |
| `choices`               | array   | List of completion choices                        |
| `choices[].message`     | object  | The generated message                             |
| `choices[].finish_reason`| string | Why generation stopped (`stop`, `length`, etc.)  |
| `usage`                 | object  | Token usage statistics                            |

## Examples

### Basic Chat

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
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": "What is the capital of France?"}
        ]
    }
)
print(response.json()["choices"][0]["message"]["content"])
```

```javascript
const response = await fetch('https://api.example.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'model-v1',
    messages: [
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: 'What is the capital of France?' },
    ],
  }),
});
const data = await response.json();
console.log(data.choices[0].message.content);
```

```bash
curl https://api.example.com/v1/chat/completions \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "model-v1",
    "messages": [
      {"role": "system", "content": "You are a helpful assistant."},
      {"role": "user", "content": "What is the capital of France?"}
    ]
  }'
```

### Streaming

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
        "messages": [{"role": "user", "content": "Tell me a story"}],
        "stream": True
    },
    stream=True
)

for line in response.iter_lines():
    if line:
        print(line.decode("utf-8"))
```
