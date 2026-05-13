import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AboutSection from './AboutSection';

jest.mock('../../services/api', () => ({
  __esModule: true,
  default: {
    getSiteSettings: jest.fn(),
  },
}));

const mockedPublicApi = jest.requireMock('../../services/api').default as { getSiteSettings: jest.Mock };

const renderWithQuery = (ui: React.ReactElement) => {
  const client = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
};

describe('AboutSection', () => {
  it('renderiza a história vinda da API', async () => {
    mockedPublicApi.getSiteSettings.mockResolvedValueOnce({
      historyTitle: 'História da Casa',
      historySubtitle: 'Subtítulo vindo da API',
      historyHtml: '<p>Conteúdo HTML vindo da API</p>',
      historyMissionText: 'Texto de missão vindo da API',
    });

    renderWithQuery(<AboutSection />);

    expect(await screen.findByText('História da Casa')).toBeInTheDocument();
    expect(screen.getByText('Subtítulo vindo da API')).toBeInTheDocument();
    expect(screen.getByText('Conteúdo HTML vindo da API')).toBeInTheDocument();
    expect(screen.getByText('Texto de missão vindo da API')).toBeInTheDocument();
  });

  it('não exibe conteúdo estático quando historyHtml não existe', async () => {
    mockedPublicApi.getSiteSettings.mockResolvedValueOnce({
      historyTitle: 'História da Casa',
      historySubtitle: 'Subtítulo vindo da API',
      historyHtml: '',
      historyMissionText: 'Texto de missão vindo da API',
    });

    renderWithQuery(<AboutSection />);

    expect(await screen.findByText('História da Casa')).toBeInTheDocument();
    expect(await screen.findByText('Conteúdo indisponível no momento.')).toBeInTheDocument();
  });
});

