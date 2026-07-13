import React, { useCallback } from 'react';
import { Module, ModuleType } from '../../types';
import { useResume } from '../../hooks/useResume';
import PersonalInfoEditor from './PersonalInfoEditor';
import ListModuleEditor from './ListModuleEditor';
import SkillsEditor from './SkillsEditor';
import { X, Eye, EyeOff, Type, LayoutPanelLeft, Columns2 } from 'lucide-react';
import RichTextEditor from './RichTextEditor';

const LIST_MODULE_TYPES: ModuleType[] = ['experience', 'education', 'projects', 'certifications'];
const CUSTOM_EDITOR_TYPES: ModuleType[] = ['summary', 'custom', 'languages'];

const ModuleEditor: React.FC = () => {
  const { resume, selectedModuleId, selectModule, updateModule, updateModuleTitle, toggleModuleVisibility, deleteModule } = useResume();
  if (!resume || !selectedModuleId) return null;

  const module = resume.modules.find((m) => m.id === selectedModuleId);
  if (!module) return null;

  const handleChange = useCallback(
    (data: Record<string, any>) => {
      updateModule(module.id, data);
    },
    [module.id, updateModule]
  );

  const renderEditor = () => {
    if (module.type === 'personal-info') {
      return <PersonalInfoEditor module={module} onChange={handleChange} />;
    }
    if (LIST_MODULE_TYPES.includes(module.type)) {
      return <ListModuleEditor module={module} onChange={handleChange} />;
    }
    if (module.type === 'skills') {
      return <SkillsEditor module={module} onChange={handleChange} />;
    }
    // summary, custom, languages - use simple textarea or custom editors
    if (module.type === 'languages') {
      return (
        <div className="space-y-2">
          {(module.data.languages || []).map((lang: any, idx: number) => (
            <div key={lang.id || idx} className="flex gap-2">
              <input
                className="input-field flex-1"
                value={lang.name}
                onChange={(e) => {
                  const newLangs = [...(module.data.languages || [])];
                  newLangs[idx] = { ...newLangs[idx], name: e.target.value };
                  handleChange({ languages: newLangs });
                }}
                placeholder="语言名称"
              />
              <select
                className="input-field w-24"
                value={lang.proficiency}
                onChange={(e) => {
                  const newLangs = [...(module.data.languages || [])];
                  newLangs[idx] = { ...newLangs[idx], proficiency: e.target.value };
                  handleChange({ languages: newLangs });
                }}
              >
                <option value="">水平</option>
                <option value="母语">母语</option>
                <option value="流利">流利</option>
                <option value="熟练">熟练</option>
                <option value="基础">基础</option>
              </select>
            </div>
          ))}
          <button
            onClick={() => {
              const newLangs = [...(module.data.languages || []), { id: Math.random().toString(36).substring(2, 10), name: '', proficiency: '' }];
              handleChange({ languages: newLangs });
            }}
            className="text-xs text-blue-600 hover:text-blue-700"
          >
            + 添加语言
          </button>
        </div>
      );
    }
    if (module.type === 'summary' || module.type === 'custom') {
      return (
        <div>
          <label className="label-text mb-1 block">内容</label>
          <RichTextEditor
            value={module.data.content || ''}
            onChange={(val) => handleChange({ content: val })}
            placeholder={module.type === 'summary' ? '介绍自己... 支持 **加粗** *斜体* • 列表' : '输入自定义内容...'}
            minHeight={120}
          />
        </div>
      );
    }
    return <p className="text-sm text-gray-400">此模块暂无可编辑选项</p>;
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <Type size={16} className="text-gray-400" />
            <input
              className="text-sm font-semibold text-gray-800 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none px-1 py-0.5"
              value={module.title}
              onChange={(e) => updateModuleTitle(module.id, e.target.value)}
            />
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => toggleModuleVisibility(module.id)}
            className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
            title={module.visible ? '隐藏模块' : '显示模块'}
          >
            {module.visible ? <Eye size={16} className="text-gray-500" /> : <EyeOff size={16} className="text-gray-400" />}
          </button>
          {/* Section toggle */}
          <button
            onClick={() => updateModule(module.id, { section: module.section === 'sidebar' ? 'main' : 'sidebar' })}
            className={`p-1.5 rounded-md transition-colors ${
              module.section === 'sidebar'
                ? 'bg-purple-50 text-purple-600 hover:bg-purple-100'
                : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
            }`}
            title={module.section === 'sidebar' ? '当前：侧面模块 — 点击切换为正文模块' : '当前：正文模块 — 点击切换为侧面模块'}
          >
            {module.section === 'sidebar' ? <LayoutPanelLeft size={15} /> : <Columns2 size={15} />}
          </button>
          <button
            onClick={() => { deleteModule(module.id); }}
            className="p-1.5 rounded-md hover:bg-red-50 transition-colors"
            title="删除模块"
          >
            <TrashIcon size={16} className="text-gray-500 hover:text-red-500" />
          </button>
          <button
            onClick={() => selectModule(null)}
            className="p-1.5 rounded-md hover:bg-gray-100 transition-colors ml-1"
          >
            <X size={16} className="text-gray-500" />
          </button>
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {renderEditor()}
      </div>
    </div>
  );
};

// Inline trash icon
const TrashIcon: React.FC<{ size: number; className: string }> = ({ size, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

export default ModuleEditor;
