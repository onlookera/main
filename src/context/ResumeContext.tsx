import React, { createContext, useReducer, useEffect, useCallback } from 'react';
import {
  Resume,
  ResumeState,
  ResumeAction,
  Module,
  GlobalSettings,
  Template,
} from '../types';

const HISTORY_MAX = 50;

const initialState: ResumeState = {
  resume: null,
  selectedModuleId: null,
  history: { past: [], future: [] },
  scale: 1,
  isDirty: false,
};

function pushHistory(state: ResumeState): { past: Resume[]; future: Resume[] } {
  if (!state.resume) return state.history;
  const past = [...state.history.past, state.resume];
  if (past.length > HISTORY_MAX) past.shift();
  return { past, future: [] };
}

function resumeReducer(state: ResumeState, action: ResumeAction): ResumeState {
  switch (action.type) {
    case 'SET_RESUME': {
      // Migrate old modules: ensure section field exists
      const resume = {
        ...action.payload,
        modules: action.payload.modules.map((m) => ({
          ...m,
          section: m.section || 'auto',
        })),
      };
      return { ...state, resume, isDirty: false, selectedModuleId: null, history: { past: [], future: [] } };
    }

    case 'UPDATE_MODULE': {
      if (!state.resume) return state;
      const newHistory = pushHistory(state);
      const payload = action.payload.data;
      const modules = state.resume.modules.map((m) => {
        if (m.id !== action.payload.moduleId) return m;
        // Separate data fields from top-level module fields
        const topFields: Partial<Module> = {};
        const dataFields: Record<string, any> = {};
        for (const [key, val] of Object.entries(payload)) {
          if (key === 'section' || key === 'visible') {
            (topFields as any)[key] = val;
          } else {
            dataFields[key] = val;
          }
        }
        return { ...m, ...topFields, data: { ...m.data, ...dataFields } };
      });
      const newResume = { ...state.resume, modules, updatedAt: new Date().toISOString() };
      return { ...state, resume: newResume, isDirty: true, history: newHistory };
    }

    case 'UPDATE_MODULE_TITLE': {
      if (!state.resume) return state;
      const newHistory = pushHistory(state);
      const modules = state.resume.modules.map((m) =>
        m.id === action.payload.moduleId
          ? { ...m, title: action.payload.title }
          : m
      );
      const newResume = { ...state.resume, modules, updatedAt: new Date().toISOString() };
      return { ...state, resume: newResume, isDirty: true, history: newHistory };
    }

    case 'ADD_MODULE': {
      if (!state.resume) return state;
      const newHistory = pushHistory(state);
      const maxOrder = Math.max(...state.resume.modules.map((m) => m.order), -1);
      const module = { ...action.payload, order: maxOrder + 1 };
      const newResume = {
        ...state.resume,
        modules: [...state.resume.modules, module],
        updatedAt: new Date().toISOString(),
      };
      return { ...state, resume: newResume, isDirty: true, selectedModuleId: module.id, history: newHistory };
    }

    case 'DELETE_MODULE': {
      if (!state.resume) return state;
      const newHistory = pushHistory(state);
      const modules = state.resume.modules
        .filter((m) => m.id !== action.payload.moduleId)
        .map((m, i) => ({ ...m, order: i }));
      const newResume = { ...state.resume, modules, updatedAt: new Date().toISOString() };
      const newSelected = state.selectedModuleId === action.payload.moduleId ? null : state.selectedModuleId;
      return { ...state, resume: newResume, isDirty: true, selectedModuleId: newSelected, history: newHistory };
    }

    case 'TOGGLE_MODULE_VISIBILITY': {
      if (!state.resume) return state;
      const newHistory = pushHistory(state);
      const modules = state.resume.modules.map((m) =>
        m.id === action.payload.moduleId ? { ...m, visible: !m.visible } : m
      );
      const newResume = { ...state.resume, modules, updatedAt: new Date().toISOString() };
      return { ...state, resume: newResume, isDirty: true, history: newHistory };
    }

    case 'REORDER_MODULES': {
      if (!state.resume) return state;
      const newHistory = pushHistory(state);
      const modules = action.payload.modules.map((m, i) => ({ ...m, order: i }));
      const newResume = { ...state.resume, modules, updatedAt: new Date().toISOString() };
      return { ...state, resume: newResume, isDirty: true, history: newHistory };
    }

    case 'UPDATE_GLOBAL_SETTINGS': {
      if (!state.resume) return state;
      const newHistory = pushHistory(state);
      const newResume = {
        ...state.resume,
        globalSettings: { ...state.resume.globalSettings, ...action.payload },
        updatedAt: new Date().toISOString(),
      };
      return { ...state, resume: newResume, isDirty: true, history: newHistory };
    }

    case 'SET_SELECTED_MODULE': {
      return { ...state, selectedModuleId: action.payload.moduleId };
    }

    case 'APPLY_TEMPLATE': {
      if (!state.resume) return state;
      const newHistory = pushHistory(state);
      const { template, keepContent } = action.payload;
      let modules: Module[];
      if (keepContent) {
        // Keep user data but apply new layout order
        const existingMap = new Map(state.resume.modules.map((m) => [m.type, m]));
        modules = template.defaultModules.map((dm, i) => {
          const existing = existingMap.get(dm.type);
          if (existing) {
            return { ...existing, order: i, title: dm.title };
          }
          return { ...dm, id: `${dm.type}_${Math.random().toString(36).substring(2, 10)}`, order: i };
        });
      } else {
        modules = template.defaultModules.map((dm, i) => ({
          ...dm,
          data: { ...dm.data },
          id: `${dm.type}_${Math.random().toString(36).substring(2, 10)}`,
          order: i,
        }));
      }
      const newResume = {
        ...state.resume,
        templateId: template.id,
        globalSettings: { ...template.defaultGlobalSettings },
        modules,
        updatedAt: new Date().toISOString(),
      };
      return { ...state, resume: newResume, isDirty: true, history: newHistory };
    }

    case 'UNDO': {
      if (state.history.past.length === 0) return state;
      const past = [...state.history.past];
      const previous = past.pop()!;
      const future = state.resume ? [state.resume, ...state.history.future] : state.history.future;
      return { ...state, resume: previous, isDirty: true, history: { past, future } };
    }

    case 'REDO': {
      if (state.history.future.length === 0) return state;
      const future = [...state.history.future];
      const next = future.shift()!;
      const past = state.resume ? [...state.history.past, state.resume] : state.history.past;
      return { ...state, resume: next, isDirty: true, history: { past, future } };
    }

    case 'RESET_STYLES': {
      if (!state.resume) return state;
      const newHistory = pushHistory(state);
      const newResume = {
        ...state.resume,
        globalSettings: { ...action.payload.globalSettings },
        updatedAt: new Date().toISOString(),
      };
      return { ...state, resume: newResume, isDirty: true, history: newHistory };
    }

    case 'SET_SCALE': {
      return { ...state, scale: action.payload.scale };
    }

    default:
      return state;
  }
}

// Context
interface ResumeContextValue {
  state: ResumeState;
  dispatch: React.Dispatch<ResumeAction>;
  saveResume: (resume: Resume) => void;
  loadResumes: () => Resume[];
  deleteResume: (id: string) => void;
  duplicateResume: (id: string) => Resume | null;
}

export const ResumeContext = createContext<ResumeContextValue | null>(null);

// LocalStorage keys
const RESUMES_KEY = 'jianli_resumes';
const CURRENT_RESUME_KEY = 'jianli_current_resume';

export const saveResumeToStorage = (resume: Resume): void => {
  try {
    const all = loadResumesFromStorage();
    const idx = all.findIndex((r) => r.id === resume.id);
    if (idx >= 0) {
      all[idx] = resume;
    } else {
      all.push(resume);
    }
    localStorage.setItem(RESUMES_KEY, JSON.stringify(all));
  } catch (e) {
    console.error('Failed to save resume:', e);
  }
};

export const loadResumesFromStorage = (): Resume[] => {
  try {
    const raw = localStorage.getItem(RESUMES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const deleteResumeFromStorage = (id: string): void => {
  const all = loadResumesFromStorage().filter((r) => r.id !== id);
  localStorage.setItem(RESUMES_KEY, JSON.stringify(all));
};

export const duplicateResumeInStorage = (id: string): Resume | null => {
  const all = loadResumesFromStorage();
  const target = all.find((r) => r.id === id);
  if (!target) return null;
  const newResume: Resume = {
    ...target,
    id: `resume_${Math.random().toString(36).substring(2, 10)}`,
    name: `${target.name} (副本)`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  all.push(newResume);
  localStorage.setItem(RESUMES_KEY, JSON.stringify(all));
  return newResume;
};

// Provider
export function ResumeProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(resumeReducer, initialState);

  const saveResume = useCallback((resume: Resume) => {
    saveResumeToStorage(resume);
  }, []);

  const loadResumes = useCallback((): Resume[] => {
    return loadResumesFromStorage();
  }, []);

  const deleteResume = useCallback((id: string) => {
    deleteResumeFromStorage(id);
  }, []);

  const duplicateResume = useCallback((id: string): Resume | null => {
    return duplicateResumeInStorage(id);
  }, []);

  // Auto-save with debounce
  useEffect(() => {
    if (!state.resume || !state.isDirty) return;
    const timer = setTimeout(() => {
      saveResumeToStorage(state.resume!);
    }, 800);
    return () => clearTimeout(timer);
  }, [state.resume, state.isDirty]);

  return (
    <ResumeContext.Provider value={{ state, dispatch, saveResume, loadResumes, deleteResume, duplicateResume }}>
      {children}
    </ResumeContext.Provider>
  );
}
