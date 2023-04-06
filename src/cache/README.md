# Caching Requirements

- Some kind of TTL setting
- Action to perform on invalidation
- If version == "latest"
  - If TTL expires, check for latest version
    - If version has changed, invalidate cache
- If requested version changes
  - Invalidate cache
