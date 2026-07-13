import { useContext, useCallback } from 'react';
import { ResumeContext } from '../context/ResumeContext';
import { Module, GlobalSettings, Template } from '../types';

export function useResume() {
  const ctx = useContext(ResumeContext);
  if (!ctx) throw new Error('useResume must be used within ResumeProvider');

  const { state, dispatch, saveResume, loadResumes, deleteResume, duplicateResume } = ctx;

  const updateModule = useCallback(
    (moduleId: string, data: Record<string, any>) =>
      dispatch({ type: 'UPDATE_MODULE', payload: { moduleId, data } }),
    [dispatch]
  );

  const updateModuleTitle = useCallback(
    (moduleId: string, title: string) =>
      dispatch({ type: 'UPDATE_MODULE_TITLE', payload: { moduleId, title } }),
    [dispatch]
  );

  const addModule = useCallback(
    (module: Module) => dispatch({ type: 'ADD_MODULE', payload: module }),
    [dispatch]
  );

  const deleteModule = useCallback(
    (moduleId: string) => dispatch({ type: 'DELETE_MODULE', payload: { moduleId } }),
    [dispatch]
  );

  const toggleModuleVisibility = useCallback(
    (moduleId: string) => dispatch({ type: 'TOGGLE_MODULE_VISIBILITY', payload: { moduleId } }),
    [dispatch]
  );

  const reorderModules = useCallback(
    (modules: Module[]) => dispatch({ type: 'REORDER_MODULES', payload: { modules } }),
    [dispatch]
  );

  const updateGlobalSettings = useCallback(
    (settings: Partial<GlobalSettings>) =>
      dispatch({ type: 'UPDATE_GLOBAL_SETTINGS', payload: settings }),
    [dispatch]
  );

  const selectModule = useCallback(
    (moduleId: string | null) =>
      dispatch({ type: 'SET_SELECTED_MODULE', payload: { moduleId } }),
    [dispatch]
  );

  const applyTemplate = useCallback(
    (template: Template, keepContent: boolean = true) =>
      dispatch({ type: 'APPLY_TEMPLATE', payload: { template, keepContent } }),
    [dispatch]
  );

  const undo = useCallback(() => dispatch({ type: 'UNDO' }), [dispatch]);
  const redo = useCallback(() => dispatch({ type: 'REDO' }), [dispatch]);

  const resetStyles = useCallback(
    (globalSettings: GlobalSettings) =>
      dispatch({ type: 'RESET_STYLES', payload: { globalSettings } }),
    [dispatch]
  );

  const setScale = useCallback(
    (scale: number) => dispatch({ type: 'SET_SCALE', payload: { scale } }),
    [dispatch]
  );

  const setResume = useCallback(
    (resume: any) => dispatch({ type: 'SET_RESUME', payload: resume }),
    [dispatch]
  );

  return {
    ...state,
    updateModule,
    updateModuleTitle,
    addModule,
    deleteModule,
    toggleModuleVisibility,
    reorderModules,
    updateGlobalSettings,
    selectModule,
    applyTemplate,
    undo,
    redo,
    resetStyles,
    setScale,
    setResume,
    saveResume,
    loadResumes,
    deleteResume,
    duplicateResume,
  };
}
