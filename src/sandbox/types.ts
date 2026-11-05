export type LogLevel = 'log' | 'info' | 'warn' | 'error';

export interface OutputLine {
  level: LogLevel;
  text: string;
}

export interface RunError {
  name: string;
  message: string;
  /** Номер строки в коде ученика. Браузер сообщает его не всегда. */
  line: number | null;
}

export type RunResult =
  | { status: 'success' }
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
