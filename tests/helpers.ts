import { expect, type Page } from '@playwright/test';

/**
 * Заменяет код в редакторе. Сначала очищаем поле клавишами: при имитации Android
 * вызов fill в CodeMirror дописывает текст к старому коду, а не заменяет его.
 */
export async function setCode(page: Page, code: string) {
  const editor = page.locator('.cm-content');
  await expect(editor).toBeVisible();
  await editor.click();
  await page.keyboard.press('ControlOrMeta+A');
  await page.keyboard.press('Delete');
  await expect(editor).toHaveText('');
  await editor.fill(code);
}
