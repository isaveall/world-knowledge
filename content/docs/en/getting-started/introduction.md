---
title: "Introduction"
category: "Getting Started"
order: 1
tags: ["introduction", "overview"]
---

# Introduction

Welcome to the API Documentation. This platform provides powerful APIs for building intelligent applications.

## Key Features

- **Chat Completions** — Generate conversational responses using advanced language models
- **Embeddings** — Create vector representations of text for semantic search
- **Code Generation** — Generate and complete code snippets in multiple languages

## Base URL

All API requests should be made to:

```
https://api.example.com/v1
```

## Authentication

All API requests require authentication via an API key. Include your key in the `Authorization` header:

```bash
curl https://api.example.com/v1/chat/completions \
  -H "Authorization: Bearer YOUR_API_KEY"
```

## Rate Limits

| Plan       | Requests/min | Tokens/min |
|------------|-------------|------------|
| Free       | 20          | 60,000     |
| Pro        | 100         | 300,000    |
| Enterprise | 1,000       | 3,000,000  |

## Quick Start

Here's a minimal example to get you started:

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
        "messages": [{"role": "user", "content": "Hello!"}]
    }
)
print(response.json())
```
