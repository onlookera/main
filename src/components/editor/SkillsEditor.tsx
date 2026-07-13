import React, { useCallback } from 'react';
import { Module, SkillsData, SkillItem } from '../../types';
import { Plus, Trash2, GripVertical } from 'lucide-react';

interface Props {
  module: Module;
  onChange: (data: Record<string, any>) => void;
}

const uid = (): string => Math.random().toString(36).substring(2, 10);

const SkillsEditor: React.FC<Props> = ({ module, onChange }) => {
  const data = module.data as SkillsData;
  const skills = data.skills || [];
  const displayMode = data.displayMode || 'bars';

  const updateSkill = useCallback(
    (skillId: string, field: keyof SkillItem, value: any) => {
      const newSkills = skills.map((s) =>
        s.id === skillId ? { ...s, [field]: value } : s
      );
      onChange({ skills: newSkills });
    },
    [skills, onChange]
  );

  const addSkill = useCallback(() => {
    onChange({ skills: [...skills, { id: uid(), name: '', level: 3 }] });
  }, [skills, onChange]);

  const removeSkill = useCallback(
    (skillId: string) => {
      onChange({ skills: skills.filter((s) => s.id !== skillId) });
    },
    [skills, onChange]
  );

  const setDisplayMode = useCallback(
    (mode: 'tags' | 'bars' | 'dots') => {
      onChange({ displayMode: mode });
    },
    [onChange]
  );

  return (
    <div className="space-y-3">
      {/* Display Mode Toggle */}
      <div>
        <label className="label-text">显示样式</label>
        <div className="flex gap-1 mt-1">
          {(['bars', 'dots', 'tags'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setDisplayMode(mode)}
              className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                displayMode === mode
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {mode === 'bars' ? '进度条' : mode === 'dots' ? '等级点' : '标签云'}
            </button>
          ))}
        </div>
      </div>

      {/* Skills List */}
      {skills.map((skill) => (
        <div key={skill.id} className="flex items-center gap-2 bg-gray-50 rounded-lg p-2 border border-gray-200">
          <GripVertical size={14} className="text-gray-400 flex-shrink-0" />
          <input
            className="input-field flex-1"
            value={skill.name}
            onChange={(e) => updateSkill(skill.id, 'name', e.target.value)}
            placeholder="技能名称"
          />
          {displayMode !== 'tags' && (
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((level) => (
                <button
                  key={level}
                  onClick={() => updateSkill(skill.id, 'level', level)}
                  className={`w-5 h-5 rounded-full text-[10px] font-medium transition-colors ${
                    level <= skill.level
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-400 hover:bg-gray-300'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          )}
          <button
            onClick={() => removeSkill(skill.id)}
            className="p-1 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ))}

      <button
        onClick={addSkill}
        className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors flex items-center justify-center gap-1"
      >
        <Plus size={16} />
        添加技能
      </button>
    </div>
  );
};

export default SkillsEditor;
