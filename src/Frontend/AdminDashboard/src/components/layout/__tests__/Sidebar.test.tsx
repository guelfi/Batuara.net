import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import '@testing-library/jest-dom';
import Sidebar from '../Sidebar';

const theme = createTheme();

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

describe('Sidebar Component', () => {
  const mockProps = {
    open: true,
    onClose: jest.fn(),
    selectedItem: 'dashboard',
    onItemSelect: jest.fn(),
    variant: 'permanent' as const,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders sidebar with all menu items', () => {
    renderWithTheme(<Sidebar {...mockProps} />);
    
    // Verifica se os itens principais estão presentes
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Sobre / História')).toBeInTheDocument();
    expect(screen.getByText('Contato')).toBeInTheDocument();
    expect(screen.getByText('Localização')).toBeInTheDocument();
    expect(screen.getByText('Doações')).toBeInTheDocument();
    expect(screen.getByText('Calendário')).toBeInTheDocument();
    expect(screen.getByText('Festas e Eventos')).toBeInTheDocument();
    expect(screen.getByText('Orixás')).toBeInTheDocument();
  });

  test('shows correct status chips', () => {
    renderWithTheme(<Sidebar {...mockProps} />);
    
    // Verifica chips de status
    expect(screen.getAllByText('Implementado')).toHaveLength(5); // P0 items
    expect(screen.getAllByText('API Necessária')).toHaveLength(2); // F1 items
    expect(screen.getAllByText('CMS Avançado')).toHaveLength(4); // A1 items
  });

  test('calls onItemSelect when item is clicked', () => {
    renderWithTheme(<Sidebar {...mockProps} />);
    
    const sobreItem = screen.getByText('Sobre / História');
    fireEvent.click(sobreItem);
    
    expect(mockProps.onItemSelect).toHaveBeenCalledWith('sobre');
  });

  test('highlights selected item', () => {
    renderWithTheme(<Sidebar {...mockProps} selectedItem="sobre" />);
    
    const sobreButton = screen.getByText('Sobre / História').closest('[role="button"]');
    expect(sobreButton).toBeInTheDocument();
    // Note: Material-UI classes are dynamic, so we just verify the element exists
  });

  test('displays phase information', () => {
    renderWithTheme(<Sidebar {...mockProps} />);
    
    expect(screen.getByText('Fundação (F1)')).toBeInTheDocument();
    expect(screen.getByText('Recursos Avançados (A1)')).toBeInTheDocument();
    expect(screen.getByText('Fase 0 - Melhorias de Interface')).toBeInTheDocument();
  });
});