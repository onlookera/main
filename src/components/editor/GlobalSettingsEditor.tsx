import React, { useCallback, useState } from 'react';
import { useResume } from '../../hooks/useResume';
import { FONT_OPTIONS, COLOR_PRESETS, GlobalSettings } from '../../types';
import { getTemplateById } from '../../templates';
import { Settings, Palette, Type, AlignJustify, RotateCcw } from 'lucide-react';

const GlobalSettingsEditor: React.FC = () => {
  const { resume, updateGlobalSettings, resetStyles, applyTemplate } = useResume();
  const [activeTab, setActiveTab] = useState<'style' | 'layout'>('style');

  if (!resume) return null;
  const gs = resume.globalSettings;

  const update = useCallback(
    (field: keyof GlobalSettings, value: any) => {
      updateGlobalSettings({ [field]: value });
    },
    [updateGlobalSettings]
  );

  const handleReset = useCallback(() => {
    const template = getTemplateById(resume.templateId);
    if (template) {
      resetStyles({ ...template.defaultGlobalSettings });
    }
  }, [resume.templateId, resetStyles]);

  const handleColorPreset = useCallback(
    (preset: typeof COLOR_PRESETS[0]) => {
      updateGlobalSettings({ primaryColor: preset.primary, backgroundColor: preset.background });
    },
    [updateGlobalSettings]
  );

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Settings size={18} className="text-gray-500" />
          <h3 className="font-semibold text-gray-800">全局设置</h3>
        </div>
        {/* Tabs */}
        <div className="flex gap-1 mt-3">
          {([
            { key: 'style' as const, label: '样式', icon: <Palette size={14} /> },
            { key: 'layout' as const, label: '版面', icon: <AlignJustify size={14} /> },
          ]).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md transition-colors ${
                activeTab === tab.key ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeTab === 'style' && (
          <>
            {/* Color Presets */}
            <div>
              <label className="label-text flex items-center gap-1 mb-2">
                <Palette size={12} />
                配色方案
              </label>
              <div className="grid grid-cols-4 gap-2">
                {COLOR_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => handleColorPreset(preset)}
                    className="flex flex-col items-center gap-1 p-2 rounded-lg border border-gray-200 hover:border-blue-400 transition-colors"
                  >
                    <div className="flex gap-0.5">
                      <div className="w-3 h-5 rounded-sm" style={{ background: preset.primary }} />
                      <div className="w-3 h-5 rounded-sm border border-gray-200" style={{ background: preset.background }} />
                    </div>
                    <span className="text-[10px] text-gray-500">{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Primary Color */}
            <div>
              <label className="label-text">主色</label>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="color"
                  value={gs.primaryColor}
                  onChange={(e) => update('primaryColor', e.target.value)}
                  className="w-10 h-10 rounded-lg border border-gray-300 cursor-pointer"
                />
                <input
                  className="input-field flex-1"
                  value={gs.primaryColor}
                  onChange={(e) => update('primaryColor', e.target.value)}
                />
              </div>
            </div>

            {/* Background Color */}
            <div>
              <label className="label-text">背景色</label>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="color"
                  value={gs.backgroundColor}
                  onChange={(e) => update('backgroundColor', e.target.value)}
                  className="w-10 h-10 rounded-lg border border-gray-300 cursor-pointer"
                />
                <input
                  className="input-field flex-1"
                  value={gs.backgroundColor}
                  onChange={(e) => update('backgroundColor', e.target.value)}
                />
              </div>
            </div>

            {/* Font Family */}
            <div>
              <label className="label-text flex items-center gap-1 mb-1">
                <Type size={12} />
                字体
              </label>
              <select
                className="input-field"
                value={gs.fontFamily}
                onChange={(e) => update('fontFamily', e.target.value)}
              >
                {FONT_OPTIONS.map((font) => (
                  <option key={font.family} value={font.family}>
                    {font.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Font Size */}
            <div>
              <label className="label-text">字号 ({gs.fontSize}px)</label>
              <input
                type="range"
                min={10}
                max={20}
                value={gs.fontSize}
                onChange={(e) => update('fontSize', Number(e.target.value))}
                className="w-full mt-1"
              />
              <div className="flex justify-between text-[10px] text-gray-400">
                <span>10px</span>
                <span>20px</span>
              </div>
            </div>
          </>
        )}

        {activeTab === 'layout' && (
          <>
            {/* Page Margin */}
            <div>
              <label className="label-text">页边距 ({gs.margin}px)</label>
              <input
                type="range"
                min={24}
                max={80}
                step={4}
                value={gs.margin}
                onChange={(e) => update('margin', Number(e.target.value))}
                className="w-full mt-1"
              />
              <div className="flex justify-between text-[10px] text-gray-400">
                <span>紧凑</span>
                <span>宽松</span>
              </div>
            </div>

            {/* Section Spacing */}
            <div>
              <label className="label-text">段间距 ({gs.sectionSpacing}px)</label>
              <input
                type="range"
                min={8}
                max={40}
                step={2}
                value={gs.sectionSpacing}
                onChange={(e) => update('sectionSpacing', Number(e.target.value))}
                className="w-full mt-1"
              />
              <div className="flex justify-between text-[10px] text-gray-400">
                <span>紧凑</span>
                <span>宽松</span>
              </div>
            </div>

            {/* Page Numbers */}
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={gs.showPageNumbers}
                  onChange={(e) => update('showPageNumbers', e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm text-gray-700">显示页码</span>
              </label>
            </div>
          </>
        )}

        {/* Reset Button */}
        <button
          onClick={handleReset}
          className="w-full py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
        >
          <RotateCcw size={14} />
          重置模板样式（保留内容）
        </button>
      </div>
    </div>
  );
};

export default GlobalSettingsEditor;
