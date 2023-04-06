interface CacheOptions {
  TTL: string;
}

function cache<ReturnType, Action extends (...args: any[]) => ReturnType>(
  options: CacheOptions,
  action: Action
): ReturnType {
  return action();
}
