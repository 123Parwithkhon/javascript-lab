/** Минимальное описание парсера: так функцию можно проверить отдельно от загрузки редактора. */
interface SyntaxNodeLike {
  name: string;
  from: number;
  to: number;
  firstChild: SyntaxNodeLike | null;
  lastChild: SyntaxNodeLike | null;
  nextSibling: SyntaxNodeLike | null;
}

interface ParserLike {
  parse(code: string): {
    iterate(spec: { enter(node: { name: string; node: SyntaxNodeLike }): void }): void;
  };
}

const GUARD = '__jslabGuard();';
const LOOPS = new Set(['ForStatement', 'WhileStatement', 'DoStatement']);

/**
 * Страница работает в основном потоке браузера, и Worker здесь не остановит
 * бесконечный цикл. Поэтому в начало каждого цикла добавляется проверка времени.
 * Это защита от случайного зависания, а не граница безопасности: от чужих данных
 * защищают sandbox и CSP. Правки не добавляют строк, поэтому номера ошибок верны.
 */
export function guardLoops(code: string, parser: ParserLike): string {
  const inserts: { at: number; text: string }[] = [];

  parser.parse(code).iterate({
    enter({ name, node }) {
      if (!LOOPS.has(name)) return;
      // В do...while тело идёт сразу за ключевым словом, а в остальных циклах оно последнее.
      const body = name === 'DoStatement' ? node.firstChild?.nextSibling : node.lastChild;
      if (!body) return;
      if (body.name === 'Block') {
        inserts.push({ at: body.from + 1, text: GUARD });
      } else {
        inserts.push({ at: body.from, text: `{${GUARD}` }, { at: body.to, text: '}' });
      }
    },
  });

  // С конца к началу, чтобы вставки не сдвигали ещё не обработанные позиции.
  return inserts
    .sort((a, b) => b.at - a.at)
    .reduce((result, { at, text }) => result.slice(0, at) + text + result.slice(at), code);
}

/** Номер строки с первой синтаксической ошибкой или null, если парсер ошибок не нашёл. */
export function findSyntaxLine(code: string, parser: ParserLike): number | null {
  let position: number | null = null;
  parser.parse(code).iterate({
    enter({ name, node }) {
      if (name === '⚠' && position === null) position = node.from;
    },
  });
  return position === null ? null : code.slice(0, position).split('\n').length;
}

export interface PreparedCode {
  guarded: string;
  syntaxLine: number | null;
}

/** Загружает парсер редактора только тогда, когда он нужен. */
export async function prepareCode(code: string): Promise<PreparedCode> {
  const { javascriptLanguage } = await import('@codemirror/lang-javascript');
  const parser = javascriptLanguage.parser as unknown as ParserLike;
  return { guarded: guardLoops(code, parser), syntaxLine: findSyntaxLine(code, parser) };
}
