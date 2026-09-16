import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from 'react';
import apiService from '../services/api';
import {
  ContentVisibility,
  ContentVisibilityModule,
  SiteSettingsDto,
} from '../types';
import { useAuth } from './AuthContext';
import { isEditorOrAdmin } from '../utils/roles';

const MODULE_FIELD: Record<ContentVisibilityModule, keyof SiteSettingsDto> = {
  orixas: 'orixasVisibility',
  guides: 'guidesVisibility',
  umbandaLines: 'umbandaLinesVisibility',
  prayers: 'prayersVisibility',
};

interface ContentVisibilityState {
  orixas: ContentVisibility;
  guides: ContentVisibility;
  umbandaLines: ContentVisibility;
  prayers: ContentVisibility;
}

interface ContentVisibilityContextType {
  visibility: ContentVisibilityState;
  loading: boolean;
  savingModule: ContentVisibilityModule | null;
  error: string | null;
  successMessage: string | null;
  clearFeedback: () => void;
  getVisibility: (module: ContentVisibilityModule) => ContentVisibility;
  setVisibility: (module: ContentVisibilityModule, value: ContentVisibility) => Promise<void>;
}

const defaultVisibility: ContentVisibilityState = {
  orixas: ContentVisibility.Hidden,
  guides: ContentVisibility.Hidden,
  umbandaLines: ContentVisibility.Hidden,
  prayers: ContentVisibility.Hidden,
};

const ContentVisibilityContext = createContext<ContentVisibilityContextType | undefined>(undefined);

const mapFromSettings = (data: SiteSettingsDto): ContentVisibilityState => ({
  orixas: data.orixasVisibility ?? ContentVisibility.Hidden,
  guides: data.guidesVisibility ?? ContentVisibility.Hidden,
  umbandaLines: data.umbandaLinesVisibility ?? ContentVisibility.Hidden,
  prayers: data.prayersVisibility ?? ContentVisibility.Hidden,
});

interface ContentVisibilityProviderProps {
  children: ReactNode;
}

export const ContentVisibilityProvider: React.FC<ContentVisibilityProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const canManage = isEditorOrAdmin(user?.role);
  const [visibility, setVisibilityState] = useState<ContentVisibilityState>(defaultVisibility);
  const [loading, setLoading] = useState(canManage);
  const [savingModule, setSavingModule] = useState<ContentVisibilityModule | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!canManage) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const response = await apiService.getSiteSettings();
        if (!cancelled && response.success && response.data) {
          setVisibilityState(mapFromSettings(response.data));
        }
      } catch (_) {
        if (!cancelled) {
          setError('Não foi possível carregar a visibilidade do conteúdo.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [canManage]);

  const clearFeedback = useCallback(() => {
    setError(null);
    setSuccessMessage(null);
  }, []);

  const getVisibility = useCallback(
    (module: ContentVisibilityModule) => visibility[module],
    [visibility]
  );

  const setVisibility = useCallback(
    async (module: ContentVisibilityModule, value: ContentVisibility) => {
      if (!canManage) return;

      const previous = visibility[module];
      if (previous === value) return;

      setVisibilityState((current) => ({ ...current, [module]: value }));
      setSavingModule(module);
      setError(null);
      setSuccessMessage(null);

      try {
        const field = MODULE_FIELD[module];
        const response = await apiService.updateSiteSettings({ [field]: value });
        if (response.success && response.data) {
          setVisibilityState(mapFromSettings(response.data));
          setSuccessMessage('Visibilidade atualizada.');
        } else {
          setVisibilityState((current) => ({ ...current, [module]: previous }));
          setError(response.message || 'Não foi possível atualizar a visibilidade.');
        }
      } catch (_) {
        setVisibilityState((current) => ({ ...current, [module]: previous }));
        setError('Não foi possível atualizar a visibilidade.');
      } finally {
        setSavingModule(null);
      }
    },
    [canManage, visibility]
  );

  const value = useMemo(
    () => ({
      visibility,
      loading,
      savingModule,
      error,
      successMessage,
      clearFeedback,
      getVisibility,
      setVisibility,
    }),
    [
      visibility,
      loading,
      savingModule,
      error,
      successMessage,
      clearFeedback,
      getVisibility,
      setVisibility,
    ]
  );

  return (
    <ContentVisibilityContext.Provider value={value}>
      {children}
    </ContentVisibilityContext.Provider>
  );
};

export const useContentVisibility = (): ContentVisibilityContextType => {
  const context = useContext(ContentVisibilityContext);
  if (!context) {
    throw new Error('useContentVisibility must be used within ContentVisibilityProvider');
  }
  return context;
};
