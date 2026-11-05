import { LIMITS } from './limits';

const PREFIX = '#code=';

/** Кодирует программу для адреса страницы. Части после # браузер не отправляет на сервер. */
export function encodeCode(code: string): string {
  const binary = Array.from(new TextEncoder().encode(code), (byte) => String.fromCharCode(byte)).join('');
  return PREFIX + btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * Читает программу из адреса. Ссылка могла прийти от кого угодно, поэтому код
 * здесь только подставляется в редактор: запускает его сам ученик и в песочнице.
 */
export function decodeCode(hash: string): string | null {
  if (!hash.startsWith(PREFIX)) return null;
  try {
    const value = hash.slice(PREFIX.length).replace(/-/g, '+').replace(/_/g, '/');
    const bytes = Uint8Array.from(atob(value), (char) => char.charCodeAt(0));
    const code = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
    return code.length <= LIMITS.maxCodeChars ? code : null;
  } catch {
    return null;
  }
}
