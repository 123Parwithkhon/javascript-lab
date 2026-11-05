/**
 * Код внутри песочниц: одинаково показывает и сравнивает значения в Worker и на странице.
 * Определяет функции safeFormat и serialize.
 */
export const FORMAT_SOURCE = String.raw`
  const format = (value, depth, seen) => {
    if (typeof value === 'string') return depth === 0 ? value : JSON.stringify(value);
    if (typeof value === 'function') return '[Function: ' + (value.name || 'anonymous') + ']';
    if (typeof value === 'bigint') return value + 'n';
    if (value === null || typeof value !== 'object') return String(value);
    if (value instanceof Error) return value.name + ': ' + value.message;
    if (typeof Node !== 'undefined' && value instanceof Node) return '[' + value.nodeName + ']';
    if (seen.includes(value)) return '[Circular]';
    if (depth > 4) return Array.isArray(value) ? '[Array]' : '[Object]';
    const next = seen.concat([value]);
    if (Array.isArray(value)) {
      return '[' + value.map((item) => format(item, depth + 1, next)).join(', ') + ']';
    }
    const body = Object.keys(value)
      .map((key) => key + ': ' + format(value[key], depth + 1, next))
      .join(', ');
    return body ? '{ ' + body + ' }' : '{}';
  };

  const safeFormat = (value) => {
    try {
      return format(value, 0, []);
    } catch {
      return '[значение нельзя показать]';
    }
  };

  // Порядок ключей не важен: { a, b } и { b, a } считаются одним значением.
  const canonical = (value) => {
    if (Array.isArray(value)) return value.map(canonical);
    if (value === null || typeof value !== 'object') return value;
    const sorted = {};
    for (const key of Object.keys(value).sort()) sorted[key] = canonical(value[key]);
    return sorted;
  };

  const serialize = (value) => {
    if (value === undefined) return 'undefined';
    if (typeof value === 'number' && !Number.isFinite(value)) return String(value);
    if (typeof value === 'function') return '[Function]';
    try {
      return JSON.stringify(canonical(value));
    } catch {
      return '[значение нельзя показать]';
    }
  };
`;
