import { expect, test, type Page } from '@playwright/test';

const FIXED_NOW_ISO = '2026-04-27T12:00:00.000Z';

const navigationItems = [
  { label: 'Início', href: '#home' },
  { label: 'Nossa História', href: '#nossa-historia' },
  { label: 'Nossa Missão', href: '#nossa-missao' },
  { label: 'Calendário Atendimento', href: '#calendario-atendimento' },
  { label: 'Eventos e Festas', href: '#eventos-e-festas' },
  { label: 'Orixás', href: '#orixas' },
  { label: 'Guias e Entidades', href: '#guias-entidades' },
  { label: 'Linhas da Umbanda', href: '#linhas-da-umbanda' },
  { label: 'Orações', href: '#oracoes' },
  { label: 'Doações', href: '#doacoes' },
  { label: 'Entre em Contato', href: '#entre-em-contato' },
  { label: 'Nossa Localização', href: '#nossa-localizacao' },
  { label: 'Redes Sociais', href: '#redes-sociais' },
];

const mockApiResponse = <T,>(data: T) => ({
  success: true,
  message: '',
  data,
});

const mockPaginated = <T,>(items: T[]) => ({
  data: items,
  pageNumber: 1,
  pageSize: items.length,
  totalCount: items.length,
  totalPages: 1,
});

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });

  await page.addInitScript((fixedNowIso) => {
    const fixedNow = new Date(String(fixedNowIso)).valueOf();

    const OriginalDate = Date;
    class MockDate extends OriginalDate {
      constructor(...args: any[]) {
        if (args.length === 0) {
          super(fixedNow);
        } else {
          super(...(args as [any]));
        }
      }
      static now() {
        return fixedNow;
      }
    }

    // @ts-expect-error - overriding Date for deterministic screenshots
    window.Date = MockDate;

    const originalScrollIntoView = Element.prototype.scrollIntoView;
    Element.prototype.scrollIntoView = function (arg?: boolean | ScrollIntoViewOptions) {
      if (arg && typeof arg === 'object') {
        return originalScrollIntoView.call(this, { ...arg, behavior: 'auto' });
      }

      return originalScrollIntoView.call(this);
    };

    const applyDeterministicStyles = () => {
      const style = document.createElement('style');
      style.setAttribute('data-test', 'playwright-deterministic');
      style.textContent = `
        * {
          animation-duration: 0s !important;
          animation-delay: 0s !important;
          transition-duration: 0s !important;
          transition-delay: 0s !important;
          caret-color: transparent !important;
          scroll-behavior: auto !important;
        }

        *:focus,
        *:focus-visible {
          outline: none !important;
        }

        #nossa-localizacao iframe {
          visibility: hidden !important;
          background: #e0e0e0 !important;
        }
      `;
      document.head.appendChild(style);
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', applyDeterministicStyles, { once: true });
    } else {
      applyDeterministicStyles();
    }
  }, FIXED_NOW_ISO);

  await page.route('**/batuara-api/api/**', async (route) => {
    const url = new URL(route.request().url());
    const path = url.pathname;

    if (path.endsWith('/site-settings/public')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(
          mockApiResponse({
            mapEmbedUrl: 'about:blank',
            instagramUrl: 'https://instagram.com/casadecaridadebatuara',
            facebookUrl: 'https://facebook.com/casadecaridadebatuara',
            youtubeUrl: 'https://youtube.com/@casadecaridadebatuara',
            address: 'Rua Exemplo, 123 - Bairro - Cidade/UF',
            email: 'contato@batuara.net',
            phone: '(11) 99999-9999',
            instagram: '@casadecaridadebatuara',
            historyTitle: 'Nossa História',
            historySubtitle: 'Uma casa de fé, caridade e acolhimento',
            historyHtml: '<p>Conteúdo simulado</p>',
            historyMissionText: 'Texto simulado de missão',
            institutionalEmail: 'institucional@batuara.net',
            primaryPhone: '(11) 99999-9999',
            secondaryPhone: '(11) 98888-8888',
            whatsappNumber: '(11) 97777-7777',
            serviceHours: 'Segunda a sábado',
            street: 'Rua Exemplo',
            number: '123',
            complement: 'Sala 1',
            district: 'Bairro',
            city: 'Cidade',
            state: 'UF',
            zipCode: '00000-000',
            referenceNotes: 'Próximo ao ponto X',
            pixKey: '00.000.000/0000-00',
            pixPayload: '00020126580014BR.GOV.BCB.PIX0136payload-simulado5204000053039865802BR5920Casa Batuara Mock6009SAO PAULO62070503***6304ABCD',
            pixRecipientName: 'CASA BATUARA MOCK',
            pixCity: 'SAO PAULO',
            bankName: 'Banco Mock',
            aboutText: 'Texto institucional simulado para testes visuais.',
          })
        ),
      });
    }

    if (path.endsWith('/public/events')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(
          mockApiResponse(
            mockPaginated([
              {
                id: 1,
                title: 'Gira de Atendimento',
                description: 'Evento simulado para validação visual',
                date: '2026-04-10T19:30:00.000Z',
                location: 'Casa Batuara',
                time: '19:30',
                type: 'Giras',
                isActive: true,
              },
              {
                id: 2,
                title: 'Festa de Orixá',
                description: 'Celebração simulado para validação visual',
                date: '2026-04-24T19:30:00.000Z',
                location: 'Casa Batuara',
                time: '19:30',
                type: 'Festas',
                isActive: true,
              },
            ])
          )
        ),
      });
    }

    if (path.endsWith('/public/calendar/attendances')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(
          mockApiResponse(
            mockPaginated([
              {
                id: 100,
                date: '2026-04-07T00:00:00.000Z',
                startTime: '19:30',
                endTime: '21:00',
                type: 'Umbanda',
                description: 'Gira de atendimento',
                observations: '',
                requiresRegistration: false,
                maxCapacity: null,
                isActive: true,
              },
              {
                id: 101,
                date: '2026-04-21T00:00:00.000Z',
                startTime: '19:30',
                endTime: '21:00',
                type: 'Kardecismo',
                description: 'Reunião de Kardec',
                observations: '',
                requiresRegistration: false,
                maxCapacity: null,
                isActive: true,
              },
            ])
          )
        ),
      });
    }

    if (path.endsWith('/public/orixas')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(
          mockApiResponse([
            {
              id: 201,
              name: 'Oxóssi',
              description: 'Orixá das matas e da fartura',
              origin: 'Tradição afro-brasileira (mock)',
              batuaraTeaching: 'Ensinamento simulado',
              characteristics: ['Caça', 'Fartura'],
              colors: ['verde'],
              elements: ['matas'],
              isActive: true,
              displayOrder: 1,
            },
            {
              id: 202,
              name: 'Iemanjá',
              description: 'Orixá das águas e da maternidade',
              origin: 'Tradição afro-brasileira (mock)',
              batuaraTeaching: 'Ensinamento simulado',
              characteristics: ['Maternidade', 'Águas'],
              colors: ['azul claro', 'branco'],
              elements: ['mar'],
              isActive: true,
              displayOrder: 2,
            },
            {
              id: 203,
              name: 'Ogum',
              description: 'Orixá guerreiro e protetor',
              origin: 'Tradição afro-brasileira (mock)',
              batuaraTeaching: 'Ensinamento simulado',
              characteristics: ['Guerra', 'Proteção'],
              colors: ['azul', 'vermelho'],
              elements: ['ferro'],
              isActive: true,
              displayOrder: 3,
            },
          ])
        ),
      });
    }

    if (path.endsWith('/public/guides')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(
          mockApiResponse([
            {
              id: 301,
              name: 'Caboclo Batuara',
              description: 'Guia chefe da casa (mock)',
              specialties: ['Cura', 'Proteção'],
              whatsapp: '(11) 98888-8888',
              email: 'guia@batuara.net',
              phone: '(11) 97777-7777',
              photoUrl: null,
              isActive: true,
              displayOrder: 1,
              entryDate: '2020-01-01T00:00:00.000Z',
              createdAt: '2020-01-01T00:00:00.000Z',
              updatedAt: '2026-04-27T00:00:00.000Z',
            },
            {
              id: 302,
              name: 'Preta Velha Maria',
              description: 'Sabedoria e acolhimento (mock)',
              specialties: ['Aconselhamento'],
              whatsapp: null,
              email: null,
              phone: null,
              photoUrl: null,
              isActive: true,
              displayOrder: 2,
              entryDate: '2021-01-01T00:00:00.000Z',
              createdAt: '2021-01-01T00:00:00.000Z',
              updatedAt: '2026-04-27T00:00:00.000Z',
            },
          ])
        ),
      });
    }

    if (path.endsWith('/public/umbanda-lines')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(
          mockApiResponse(
            mockPaginated([
              {
                id: 401,
                name: 'Linha de Oxalá',
                description: 'Paz, fé e espiritualidade',
                characteristics: 'Paz, fé e espiritualidade',
                batuaraInterpretation: 'Interpretação simulado (mock)',
                isActive: true,
                displayOrder: 1,
                entities: ['Caboclos', 'Pretos Velhos', 'Crianças'],
                workingDays: ['Domingo'],
              },
              {
                id: 402,
                name: 'Linha de Ogum',
                description: 'Força e proteção',
                characteristics: 'Força e proteção',
                batuaraInterpretation: 'Interpretação simulado (mock)',
                isActive: true,
                displayOrder: 2,
                entities: ['Baianos', 'Boiadeiros'],
                workingDays: ['Quinta-feira'],
              },
            ])
          )
        ),
      });
    }

    if (path.endsWith('/public/spiritual-contents')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(
          mockApiResponse(
            mockPaginated([
              {
                id: 501,
                title: 'Oração de Cáritas',
                content: 'Deus, nosso Pai...',
                type: 'Prayer',
                category: 'General',
                source: 'Mock',
                displayOrder: 1,
                isFeatured: true,
                isActive: true,
              },
              {
                id: 502,
                title: 'Prece de Agradecimento',
                content: 'Agradecemos, Senhor...',
                type: 'Prayer',
                category: 'General',
                source: 'Mock',
                displayOrder: 2,
                isFeatured: false,
                isActive: true,
              },
            ])
          )
        ),
      });
    }

    return route.fulfill({
      status: 404,
      contentType: 'application/json',
      body: JSON.stringify({ success: false, message: 'Not mocked', data: null }),
    });
  });
});

async function navigateByMenu(page: Page, label: string, href: string) {
  const hamburger = page.getByLabel('open drawer');
  const isHamburgerVisible = await hamburger.isVisible().catch(() => false);

  if (isHamburgerVisible) {
    await hamburger.click();
    await page.locator('.MuiDrawer-paper').getByText(label, { exact: true }).click();
  } else {
    await page.locator('header').getByRole('button', { name: label, exact: true }).click();
  }

  await expect(page).toHaveURL(new RegExp(`${href}$`));
  await expect(page.locator(href)).toBeInViewport();
}

function collectPageErrors(page: Page) {
  const errors: string[] = [];

  page.on('pageerror', (err) => {
    errors.push(`pageerror: ${err.stack || err.message}`);
  });

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      void (async () => {
        const base = `console.${msg.type()}: ${msg.text()}`;

        try {
          const args = await Promise.all(
            msg.args().map(async (arg) => {
              try {
                return await arg.jsonValue();
              } catch {
                return undefined;
              }
            })
          );

          const extra = args
            .filter((v): v is string => typeof v === 'string' && v.trim().length > 0)
            .join('\n');

          errors.push(extra ? `${base}\n${extra}` : base);
        } catch {
          errors.push(base);
        }
      })();
    }
  });

  return errors;
}

test('UI/UX: navegação por menu + screenshots por seção (3 breakpoints)', async ({ page }) => {
  test.setTimeout(180_000);
  const errors = collectPageErrors(page);

  await page.goto('/');
  await expect(page.locator('#home')).toBeVisible();

  await expect(page.locator('#home')).toHaveScreenshot('uiux-00-home.png', { timeout: 30_000 });

  for (const [index, item] of navigationItems.slice(1).entries()) {
    await navigateByMenu(page, item.label, item.href);
    if (item.href === '#linhas-da-umbanda') {
      await page.evaluate(() => {
        const carousel = document.getElementById('umbanda-carousel');
        if (carousel) carousel.scrollLeft = 0;
      });
      await page.waitForTimeout(150);
    }
    const order = String(index + 1).padStart(2, '0');
    const id = item.href.replace('#', '');
    await expect(page.locator(item.href)).toHaveScreenshot(`uiux-${order}-${id}.png`, { timeout: 30_000 });
  }

  expect(errors.join('\n')).toBe('');
});

