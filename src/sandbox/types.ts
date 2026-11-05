export type LogLevel = 'log' | 'info' | 'warn' | 'error';

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

export interface OutputLine {
  level: LogLevel;
  text: string;
}

export interface Pixel {
  x: number;
  y: number;
  color: string;
}

export interface RunError {
  name: string;
  message: string;
  /** Номер строки в коде ученика. Браузер сообщает его не всегда. */
  line: number | null;
}

export interface RunOptions {
  /** Служебный код, который выполняется перед программой. Его пишет автор задания. */
  setup?: string;
  /** Получает нарисованные точки. */
  onPixels?: (pixels: Pixel[]) => void;
  /** Значения, которые платформа передаёт программе, например age = 17. */
  globals?: Record<string, JsonValue>;
  /** Имена переменных, значения которых нужно прочитать после выполнения. */
  probe?: string[];
  /** Функции, которые нужно вызвать после выполнения кода. */
  calls?: ProbeCall[];
  /** Выражения, которые нужно вычислить после выполнения кода. */
  expressions?: string[];
}

export interface ProbeCall {
  name: string;
  args: JsonValue[];
}

/** Значение переменной в текстовом виде; null означает, что переменной нет. */
export type ProbeValues = Record<string, string | null>;

export type RunResult =
  | { status: 'success'; probe: ProbeValues }
  | { status: 'error'; error: RunError }
  | { status: 'timeout' }
  | { status: 'output-limit' }
  | { status: 'code-too-large' }
  | { status: 'stopped' }
  | { status: 'sandbox-failed' };

export interface RunHandle {
  /** Завершается, когда запуск окончен по любой причине. */
  result: Promise<RunResult>;
  /** Немедленно останавливает код. */
  stop: () => void;
}
