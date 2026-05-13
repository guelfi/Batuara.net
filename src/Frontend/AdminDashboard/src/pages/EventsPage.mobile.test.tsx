import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import EventsPage from './EventsPage';
import adminTheme from '../theme/theme';
import apiService from '../services/api';
import { EventType } from '../types';

jest.mock('../services/api', () => ({
  __esModule: true,
  default: {
    getEvents: jest.fn(),
  },
}));

const mockGetEvents = apiService.getEvents as unknown as {
  mockResolvedValue: (value: any) => void;
};

describe('EventsPage (mobile)', () => {
  beforeEach(() => {
    mockGetEvents.mockResolvedValue({
      data: [
        {
          id: 1,
          title: 'Festa de Ogum',
          description: '',
          date: '2026-01-16T00:00:00.000Z',
          startTime: '19:00:00',
          endTime: '21:00:00',
          location: 'Casa Batuara',
          type: EventType.Festa,
          imageUrl: '',
          isActive: true,
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z',
        },
      ],
      totalCount: 1,
    });

    (window as any).matchMedia = (query: string) => ({
      matches: true,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    });
  });

  it('remove completamente o botão Filtrar no mobile', async () => {
    render(
      <ThemeProvider theme={adminTheme}>
        <CssBaseline />
        <EventsPage />
      </ThemeProvider>,
    );

    await waitFor(() => expect(mockGetEvents).toHaveBeenCalled());
    expect(screen.queryByRole('button', { name: /filtrar/i })).toBeNull();
  });

  it('exibe o bullet de tipo ao lado da data', async () => {
    render(
      <ThemeProvider theme={adminTheme}>
        <CssBaseline />
        <EventsPage />
      </ThemeProvider>,
    );

    await waitFor(() => expect(mockGetEvents).toHaveBeenCalled());
    expect(screen.getByText('Festa de Ogum')).toBeInTheDocument();
  });
});
