###REST API Client

Just a basic REST client for GET/POST/PUT/DELETE

Usage:
```JavaScript
  const restClient = new RestApiClient("hostname.com");
  const result = await restClient.get("some/path", {pageLength: 10});
```

Data passed to `get()` or `delete()` will automatically be converted to a query string.
Data passed to `post()` or `put` will be sent in the body;

All methods take optional credentials as a third parameter.
Pass a string for a bearer token. Pass `{username: string, password: string}` for basic auth.
Pass `null` for no auth. Default is `null`.

Url encoded form posts can be sent with `restClient.postForm()`.
