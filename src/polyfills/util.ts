export function deprecate(fn: Function, msg: string): Function {
  // Simple polyfill for util.deprecate
  return function(...args: any[]) {
    console.warn('DEPRECATED:', msg);
    return fn.apply(this, args);
  };
}

export function promisify<T>(fn: Function) {
  return function(this: any, ...args: any[]): Promise<T> {
    return new Promise((resolve, reject) => {
      fn.call(this, ...args, (err: Error, result: T) => {
        if (err) return reject(err);
        resolve(result);
      });
    });
  };
}

// Add other util functions as needed
export default {
  deprecate,
  promisify,
  // Add other util functions here if needed
}; 