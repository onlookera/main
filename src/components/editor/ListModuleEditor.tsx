import React, { useCallback } from 'react';
import { Module, ListEntry, ListModuleData } from '../../types';
import { Plus, Trash2, GripVertical, ChevronDown, ChevronUp } from 'lucide-react';
import RichTextEditor from './RichTextEditor';

interface Props {
  module: Module;
  onChange: (data: Record<string, any>) => void;
}

const uid = (): string => Math.random().toString(36).substring(2, 10);

const emptyEntry = (): ListEntry => ({
  id: uid(),
  title: '',
  subtitle: '',
  startDate: '',
  endDate: '',
  current: false,
  location: '',
  description: '',
});

const ListModuleEditor: React.FC<Props> = ({ module, onChange }) => {
  const data = module.data as ListModuleData;
  const entries = data.entries || [];
  const [expandedEntry, setExpandedEntry] = React.useState<string | null>(entries[0]?.id || null);

  const updateEntry = useCallback(
    (entryId: string, field: keyof ListEntry, value: any) => {
      const newEntries = entries.map((e) =>
        e.id === entryId ? { ...e, [field]: value } : e
      );
      onChange({ entries: newEntries });
    },
    [entries, onChange]
  );

  const addEntry = useCallback(() => {
    const newEntry = emptyEntry();
    onChange({ entries: [...entries, newEntry] });
    setExpandedEntry(newEntry.id);
  }, [entries, onChange]);

  const removeEntry = useCallback(
    (entryId: string) => {
      onChange({ entries: entries.filter((e) => e.id !== entryId) });
    },
    [entries, onChange]
  );

  const moveEntry = useCallback(
    (entryId: string, direction: 'up' | 'down') => {
      const idx = entries.findIndex((e) => e.id === entryId);
      if (idx === -1) return;
      const newEntries = [...entries];
      const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= newEntries.length) return;
      [newEntries[idx], newEntries[targetIdx]] = [newEntries[targetIdx], newEntries[idx]];
      onChange({ entries: newEntries });
    },
    [entries, onChange]
  );

  return (
    <div className="space-y-3">
      {entries.map((entry, idx) => {
        const isExpanded = expandedEntry === entry.id;
        return (
          <div key={entry.id} className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
            {/* Entry Header */}
            <div
              className="flex items-center gap-2 p-3 cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => setExpandedEntry(isExpanded ? null : entry.id)}
            >
              <GripVertical size={14} className="text-gray-400 flex-shrink-0" />
              <span className="flex-1 text-sm font-medium text-gray-700 truncate">
                {entry.title || entry.subtitle || `条目 ${idx + 1}`}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => { e.stopPropagation(); moveEntry(entry.id, 'up'); }}
                  disabled={idx === 0}
                  className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                >
                  <ChevronUp size={14} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); moveEntry(entry.id, 'down'); }}
                  disabled={idx === entries.length - 1}
                  className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                >
                  <ChevronDown size={14} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); removeEntry(entry.id); }}
                  className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
                {isExpanded ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
              </div>
            </div>

            {/* Entry Fields */}
            {isExpanded && (
              <div className="p-3 pt-0 space-y-3 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label-text">标题</label>
                    <input
                      className="input-field mt-1"
                      value={entry.title}
                      onChange={(e) => updateEntry(entry.id, 'title', e.target.value)}
                      placeholder="公司/学校/项目名称"
                    />
                  </div>
                  <div>
                    <label className="label-text">副标题</label>
                    <input
                      className="input-field mt-1"
                      value={entry.subtitle}
                      onChange={(e) => updateEntry(entry.id, 'subtitle', e.target.value)}
                      placeholder="职位/专业/角色"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="label-text">开始日期</label>
                    <input
                      type="month"
                      className="input-field mt-1"
                      value={entry.startDate}
                      onChange={(e) => updateEntry(entry.id, 'startDate', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="label-text">结束日期</label>
                    <input
                      type="month"
                      className="input-field mt-1"
                      value={entry.endDate}
                      onChange={(e) => updateEntry(entry.id, 'endDate', e.target.value)}
                      disabled={entry.current}
                    />
                  </div>
                  <div className="flex items-end pb-2">
                    <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                      <input
                        type="checkbox"
                        checked={entry.current}
                        onChange={(e) => updateEntry(entry.id, 'current', e.target.checked)}
                        className="rounded"
                      />
                      至今
                    </label>
                  </div>
                </div>
                <div>
                  <label className="label-text">地点</label>
                  <input
                    className="input-field mt-1"
                    value={entry.location}
                    onChange={(e) => updateEntry(entry.id, 'location', e.target.value)}
                    placeholder="城市"
                  />
                </div>
                <div>
                  <label className="label-text">描述</label>
                  <div className="mt-1">
                    <RichTextEditor
                      value={entry.description}
                      onChange={(val) => updateEntry(entry.id, 'description', val)}
                      placeholder="描述工作内容、成就等... 支持 **加粗** *斜体* • 列表"
                      minHeight={90}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}

      <button onClick={addEntry} className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors flex items-center justify-center gap-1">
        <Plus size={16} />
        添加条目
      </button>
    </div>
  );
};

export default ListModuleEditor;
