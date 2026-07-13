import React, { useState } from 'react';
import { useResume } from '../../hooks/useResume';
import ModuleEditor from '../editor/ModuleEditor';
import GlobalSettingsEditor from '../editor/GlobalSettingsEditor';
import { Settings, Pencil } from 'lucide-react';

const RightPanel: React.FC = () => {
  const { selectedModuleId } = useResume();
  const [mode, setMode] = useState<'editor' | 'settings'>('editor');

  // If a module is selected, force editor mode
  React.useEffect(() => {
    if (selectedModuleId) setMode('editor');
  }, [selectedModuleId]);

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Mode Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setMode('editor')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-medium transition-colors ${
            mode === 'editor'
              ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Pencil size={14} />
          编辑
        </button>
        <button
          onClick={() => { setMode('settings'); }}
          className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-medium transition-colors ${
            mode === 'settings'
              ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Settings size={14} />
          设置
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {mode === 'editor' ? (
          selectedModuleId ? (
            <ModuleEditor />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 p-6">
              <Pencil size={40} className="mb-3 text-gray-300" />
              <p className="text-sm text-center">选择一个模块开始编辑</p>
              <p className="text-xs text-center mt-1 text-gray-300">
                点击左侧模块列表或预览中的模块
              </p>
            </div>
          )
        ) : (
          <GlobalSettingsEditor />
        )}
      </div>
    </div>
  );
};

export default RightPanel;
