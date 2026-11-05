import { advancedLessons } from './advanced';
import { asyncLesson } from './asyncLesson';
import { basicLessons } from './basics';
import { domLesson, projectsLesson } from './browserLessons';
import { coreLessons } from './core';
import { masteryLessons } from './masteryLessons';
import type { Lesson } from './types';

/** Все уроки в порядке прохождения: по одному на модуль курса. */
export const LESSONS: Lesson[] = [...basicLessons, ...coreLessons, ...advancedLessons, asyncLesson, domLesson, projectsLesson, ...masteryLessons];

export function findLesson(slug: string | undefined): Lesson | undefined {
  return LESSONS.find((lesson) => lesson.slug === slug);
}

export function lessonForModule(moduleId: number): Lesson | undefined {
  return LESSONS.find((lesson) => lesson.moduleId === moduleId);
}

export function nextLesson(lesson: Lesson): Lesson | undefined {
  return LESSONS[LESSONS.indexOf(lesson) + 1];
}
