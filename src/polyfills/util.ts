export function deprecate(fn: Function, msg: string): Function {
  // Simple polyfill for util.deprecate
  return function(...args: any[]) {
    console.warn('DEPRECATED:', msg);
    return fn.apply(this, args);
  };
}

// Add other util functions as needed
export default {
  deprecate,
  // Add other util functions here if needed
}; 