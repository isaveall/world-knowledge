---
title: Authentication
category: Getting Started
order: 2
tags:
  - auth
  - api-key
---

## API Keys

To use the API, you need an API key. You can create one in your [Dashboard](/admin).

## Bearer Token

Pass your API key in the `Authorization` HTTP header:

```bash
curl https://api.example.com/v1/chat/completions \
  -H "Authorization: Bearer sk-xxxxxxxxxxxxxxxxxxxx"
```

## Error Responses

If authentication fails, you'll receive one of these responses:

| Status Code | Error                | Description                    |
|-------------|----------------------|--------------------------------|
| 401         | `invalid_api_key`    | The API key is invalid         |
| 403         | `access_forbidden`   | The key lacks required scope   |
| 429         | `rate_limit`         | Too many requests              |

## Best Practices

1. **Never expose API keys in client-side code** — Always make API calls from your server
2. **Use environment variables** — Store keys in `API_KEY` environment variable
3. **Rotate keys regularly** — Generate new keys and deactivate old ones periodically
4. **Use minimal permissions** — Create keys with only the scopes you need
