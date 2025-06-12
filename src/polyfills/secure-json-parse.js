// This is a simplified polyfill for secure-json-parse
// It doesn't have the security features of the original but will work for basic usage

// Only export one version of parse
function parseImpl(text, reviver) {
  try {
    return JSON.parse(text, reviver);
  } catch (e) {
    throw e;
  }
}

// Export as default and named export
export default parseImpl;
export const parse = parseImpl;

export function parseAsync(text, reviver) {
  return Promise.resolve(parseImpl(text, reviver));
}

export function safeParse(text, reviver) {
  try {
    return JSON.parse(text, reviver);
  } catch (e) {
    return null;
  }
}

export function safeParseAsync(text, reviver) {
  return Promise.resolve(safeParse(text, reviver));
} 