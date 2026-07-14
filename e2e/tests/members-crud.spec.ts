import { expect, test, type Page } from '@playwright/test';

// ──────────────────────────────────────────────
// Configuração
// ──────────────────────────────────────────────
const BASE_URL    = 'http://localhost';
const LOGIN_URL   = `${BASE_URL}/batuara-admin/login`;
const MEMBERS_URL = `${BASE_URL}/batuara-admin/members`;

const ADMIN_EMAIL    = 'admin@batuara.org.br';
const ADMIN_PASSWORD = 'Admin123!';

// Dados do membro de teste
const MEMBER_NAME         = `Teste Playwright ${Date.now()}`;
const MEMBER_NAME_UPDATED = `${MEMBER_NAME} - Atualizado`;
const MEMBER_EMAIL        = `pw.test.${Date.now()}@batuara.test`;
const MEMBER_PHONE        = '(11) 99999-9999';

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────
async function login(page: Page) {
  await page.goto(LOGIN_URL);
  await expect(page.getByLabel('E-mail')).toBeVisible({ timeout: 15_000 });
  await page.getByLabel('E-mail').fill(ADMIN_EMAIL);
  await page.getByLabel('Senha').fill(ADMIN_PASSWORD);
  await page.getByRole('button', { name: 'Entrar' }).click();
  // Aguarda sair da página de login (SPA redireciona para / ou /dashboard)
  await page.waitForURL(url => !url.href.includes('/login'), { timeout: 20_000 });
}

async function goToMembers(page: Page) {
  await page.goto(MEMBERS_URL);
  await expect(
    page.getByRole('heading', { name: /filhos da casa/i })
  ).toBeVisible({ timeout: 15_000 });
}

async function openNewMemberDialog(page: Page) {
  await page.getByRole('button', { name: 'Novo cadastro' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByText('Novo filho da casa')).toBeVisible();
}

async function fillPersonalData(page: Page, name: string, email: string, phone: string) {
  const dialog = page.getByRole('dialog');
  await dialog.getByLabel('Nome completo').fill(name);
  await dialog.getByLabel('Data de nascimento').fill('1980-01-01');
  await dialog.getByLabel('E-mail').fill(email);
  await dialog.getByLabel('Celular').fill(phone);

  // Switch to Orixás tab and fill the required field
  await dialog.getByRole('tab', { name: 'Orixás' }).click();
  await dialog.getByLabel('Orixá de frente').fill('Oxalá');
}

async function saveAndExpectSuccess(page: Page) {
  await page.getByRole('dialog').getByRole('button', { name: /salvar alterações|criar cadastro/i }).click();
  // Aguarda o dialog fechar (indica sucesso)
  await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 15_000 });
}

// ──────────────────────────────────────────────
// Testes
// ──────────────────────────────────────────────
test.describe('Filhos da Casa — CRUD', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await goToMembers(page);
  });

  // ── CRIAR ──────────────────────────────────
  test('deve criar um novo membro com sucesso', async ({ page }) => {
    await openNewMemberDialog(page);
    await fillPersonalData(page, MEMBER_NAME, MEMBER_EMAIL, MEMBER_PHONE);
    await saveAndExpectSuccess(page);

    // Busca o membro criado para confirmar persistência
    await page.getByLabel('Buscar').fill(MEMBER_NAME);
    await page.waitForTimeout(1000);
    await expect(page.getByText(MEMBER_NAME)).toBeVisible({ timeout: 10_000 });
  });

  // ── VALIDAÇÃO — campo obrigatório ──────────
  test('deve exibir erro de validação ao tentar salvar sem nome', async ({ page }) => {
    await openNewMemberDialog(page);
    // Não preenche nome — clica direto em salvar
    await page.getByRole('dialog').getByRole('button', { name: /criar cadastro/i }).click();

    // Deve exibir helperText de erro no campo Nome
    await expect(
      page.getByRole('dialog').getByText(/nome completo é obrigatório/i)
    ).toBeVisible();

    // Campo Nome deve ter borda vermelha (aria-invalid)
    const nomeInput = page.getByRole('dialog').getByLabel('Nome completo');
    await expect(nomeInput).toHaveAttribute('aria-invalid', 'true');
  });

  // ── EDITAR ─────────────────────────────────
  test('deve editar um membro existente', async ({ page }) => {
    // Localiza o membro criado no teste anterior via busca
    await page.getByLabel('Buscar').fill(MEMBER_NAME);
    await page.waitForTimeout(800); // debounce do filtro

    // Clica no ícone de edição da primeira linha
    // Clica no botão de edição (aria-label="Editar")
    await page.locator('button[aria-label="Editar"]').first().click();

    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText(/editar filho da casa/i)).toBeVisible();

    // Altera o nome
    const nomeField = page.getByRole('dialog').getByLabel('Nome completo');
    await nomeField.click({ clickCount: 3 });
    await nomeField.fill(MEMBER_NAME_UPDATED);

    await saveAndExpectSuccess(page);

    // Confirma nome atualizado no grid
    await page.getByLabel('Buscar').fill(MEMBER_NAME_UPDATED);
    await page.waitForTimeout(800);
    await expect(page.getByText(MEMBER_NAME_UPDATED)).toBeVisible({ timeout: 10_000 });
  });

  // ── EXCLUIR ────────────────────────────────
  test('deve excluir o membro com confirmação', async ({ page }) => {
    // Localiza o membro atualizado
    await page.getByLabel('Buscar').fill(MEMBER_NAME_UPDATED);
    await page.waitForTimeout(800);

    // Abre o dialog de edição
    await page.locator('button[aria-label="Editar"]').first().click();
    await expect(page.getByRole('dialog')).toBeVisible();

    // Clica no botão Excluir dentro do dialog
    await page.getByRole('dialog').getByRole('button', { name: /excluir/i }).click();

    // Dialog de confirmação deve aparecer
    await expect(
      page.getByRole('dialog').filter({ hasText: /excluir cadastro/i })
    ).toBeVisible();

    // Confirma a exclusão
    await page.getByRole('button', { name: /excluir definitivamente/i }).click();

    // Aguarda o dialog de confirmação fechar
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 15_000 });

    // Verifica que sumiu do grid após busca
    await page.getByLabel('Buscar').fill(MEMBER_NAME_UPDATED);
    await page.waitForTimeout(1000);
    await expect(page.locator('.MuiDataGrid-row')).toHaveCount(0, { timeout: 10_000 });
  });
});
