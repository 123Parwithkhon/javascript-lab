import type { Task } from '../types';
import { module0Tasks } from './module0';
import { module1Tasks } from './module1';
import { module10Tasks } from './module10';
import { module11Tasks } from './module11';
import { module12Tasks } from './module12';
import { module13Tasks } from './module13';
import { module14Tasks } from './module14';
import { module15Tasks } from './module15';
import { module16Tasks } from './module16';
import { module17Tasks } from './module17';
import { module18Tasks } from './module18';
import { module2Tasks } from './module2';
import { module3Tasks } from './module3';
import { module4Tasks } from './module4';
import { module5Tasks } from './module5';
import { module6Tasks } from './module6';
import { module7Tasks } from './module7';
import { module8Tasks } from './module8';
import { module9Tasks } from './module9';

/** Все задания в порядке прохождения. */
export const TASKS: Task[] = [
  ...module0Tasks,
  ...module1Tasks,
  ...module2Tasks,
  ...module3Tasks,
  ...module4Tasks,
  ...module5Tasks,
  ...module6Tasks,
  ...module7Tasks,
  ...module8Tasks,
  ...module9Tasks,
  ...module10Tasks,
  ...module11Tasks,
  ...module12Tasks,
  ...module13Tasks,
  ...module14Tasks,
  ...module15Tasks,
  ...module16Tasks,
  ...module17Tasks,
  ...module18Tasks,
];

export function findTask(id: string | undefined): Task | undefined {
  return TASKS.find((task) => task.id === id);
}

/** Следующее задание в общем порядке курса. */
export function nextTask(task: Task): Task | undefined {
  return TASKS[TASKS.indexOf(task) + 1];
}
