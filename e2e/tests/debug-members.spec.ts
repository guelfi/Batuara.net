import { expect, test, type Page } from '@playwright/test';

const BASE_URL    = 'http://localhost';
const LOGIN_URL   = `${BASE_URL}/batuara-admin/login`;
const MEMBERS_URL = `${BASE_URL}/batuara-admin/members`;
const ADMIN_EMAIL    = 'admin@batuara.org.br';
const ADMIN_PASSWORD = 'Admin123!';

async function login(page: Page) {
  await page.goto(LOGIN_URL);
  await expect(page.getByLabel('E-mail')).toBeVisible({ timeout: 15_000 });
  await page.getByLabel('E-mail').fill(ADMIN_EMAIL);
  await page.getByLabel('Senha').fill(ADMIN_PASSWORD);
  await page.getByRole('button', { name: 'Entrar' }).click();
  await page.waitForFunction(
    () => !window.location.pathname.includes('/login'),
    { timeout: 20_000 }
  );
}

test('debug — inspecionar estrutura da página de membros', async ({ page }) => {
  await login(page);
  await page.goto(MEMBERS_URL);
  await page.waitForTimeout(3000);

  // Captura botões visíveis
  const buttons = await page.getByRole('button').all();
  console.log('=== BOTÕES ===');
  for (const btn of buttons) {
    const txt = await btn.textContent();
    const aria = await btn.getAttribute('aria-label');
    console.log(`  texto="${txt?.trim()}" aria-label="${aria}"`);
  }

  // Captura headings
  const headings = await page.getByRole('heading').all();
  console.log('=== HEADINGS ===');
  for (const h of headings) {
    console.log(`  "${await h.textContent()}"`);
  }

  // Verifica seletores do DataGrid
  const gridCells = await page.locator('[data-field]').count();
  console.log(`=== DATA-FIELD cells: ${gridCells} ===`);

  const actionCells = await page.locator('[data-field="actions"]').count();
  console.log(`=== DATA-FIELD=actions cells: ${actionCells} ===`);

  // Tenta localizar ícone de edição por diferentes formas
  const editIcons = await page.locator('button[aria-label="Editar"]').count();
  console.log(`=== Botões aria-label=Editar: ${editIcons} ===`);

  await page.screenshot({ path: 'debug-members.png', fullPage: true });
  console.log('Screenshot salvo em debug-members.png');

  expect(true).toBe(true);
});
