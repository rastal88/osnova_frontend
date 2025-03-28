import { test, expect } from '@playwright/test';

test('Проверка заголовка страницы', async ({ page }) => {
  await page.goto('http://localhost:5173');
  await expect(page).toHaveTitle('Vite + React');
});
