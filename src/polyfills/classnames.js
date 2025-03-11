// Simple polyfill for classnames
function classNames(...args) {
  const classes = [];
  
  args.forEach(arg => {
    if (!arg) return;
    
    const argType = typeof arg;
    
    if (argType === 'string' || argType === 'number') {
      classes.push(arg);
    } else if (Array.isArray(arg)) {
      if (arg.length) {
        const inner = classNames(...arg);
        if (inner) {
          classes.push(inner);
        }
      }
    } else if (argType === 'object') {
      for (const key in arg) {
        if (Object.prototype.hasOwnProperty.call(arg, key) && arg[key]) {
          classes.push(key);
        }
      }
    }
  });
  
  return classes.join(' ');
}

// Export as both default and named export
export default classNames;
export { classNames }; 