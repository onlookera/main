import React, { useCallback, useState, useRef } from 'react';
import { useResume } from '../../hooks/useResume';
import { Module, ModuleType } from '../../types';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import {
  GripVertical,
  Eye,
  EyeOff,
  Plus,
  User,
  FileText,
  Briefcase,
  GraduationCap,
  Code,
  FolderGit2,
  Award,
  Globe,
  Puzzle,
  LayoutPanelLeft,
  Columns2,
} from 'lucide-react';

const MODULE_TYPE_OPTIONS: { type: ModuleType; label: string; icon: React.ReactNode; defaultSection: 'sidebar' | 'main' }[] = [
  { type: 'personal-info', label: '个人信息', icon: <User size={16} />, defaultSection: 'main' },
  { type: 'summary', label: '个人简介', icon: <FileText size={16} />, defaultSection: 'main' },
  { type: 'experience', label: '工作经历', icon: <Briefcase size={16} />, defaultSection: 'main' },
  { type: 'education', label: '教育经历', icon: <GraduationCap size={16} />, defaultSection: 'main' },
  { type: 'skills', label: '技能特长', icon: <Code size={16} />, defaultSection: 'sidebar' },
  { type: 'projects', label: '项目经验', icon: <FolderGit2 size={16} />, defaultSection: 'main' },
  { type: 'certifications', label: '证书荣誉', icon: <Award size={16} />, defaultSection: 'sidebar' },
  { type: 'languages', label: '语言能力', icon: <Globe size={16} />, defaultSection: 'sidebar' },
  { type: 'custom', label: '自定义模块', icon: <Puzzle size={16} />, defaultSection: 'main' },
];

const ICON_MAP: Record<string, React.ReactNode> = {
  'personal-info': <User size={14} />,
  'summary': <FileText size={14} />,
  'experience': <Briefcase size={14} />,
  'education': <GraduationCap size={14} />,
  'skills': <Code size={14} />,
  'projects': <FolderGit2 size={14} />,
  'certifications': <Award size={14} />,
  'languages': <Globe size={14} />,
  'custom': <Puzzle size={14} />,
};

const uid = (): string => Math.random().toString(36).substring(2, 10);

const newModuleData = (type: ModuleType): Record<string, any> => {
  switch (type) {
    case 'personal-info':
      return { fullName: '', title: '', email: '', phone: '', location: '', website: '', linkedin: '', github: '', avatar: '', photoSize: 'medium', photoShape: 'rounded', showPhoto: true };
    case 'summary':
    case 'custom':
      return { content: '' };
    case 'experience':
    case 'education':
    case 'projects':
    case 'certifications':
      return { entries: [] };
    case 'skills':
      return { skills: [], displayMode: 'bars' };
    case 'languages':
      return { languages: [] };
    default:
      return {};
  }
};

// ==================== Sortable Module Item ====================
const SortableModuleItem: React.FC<{
  module: Module;
  isSelected: boolean;
  onSelect: () => void;
  onToggle: () => void;
  isDragOverlay?: boolean;
}> = ({ module, isSelected, onSelect, onToggle, isDragOverlay }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: module.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
    zIndex: isDragging ? 999 : 'auto',
  };

  // Drag overlay style
  if (isDragOverlay) {
    return (
      <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-white border-2 border-blue-400 shadow-xl">
        <GripVertical size={14} className="text-blue-400" />
        <span className="text-gray-500">{ICON_MAP[module.type] || <Puzzle size={14} />}</span>
        <span className="flex-1 text-sm font-medium text-gray-700 truncate">{module.title}</span>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 px-3 py-2.5 rounded-lg transition-all duration-150 group ${
        isSelected
          ? 'bg-blue-50 border border-blue-300 shadow-sm'
          : 'bg-white border border-gray-200 hover:border-gray-300 hover:shadow-sm'
      }`}
      onClick={(e) => {
        // Only select if we didn't just finish dragging
        e.stopPropagation();
        onSelect();
      }}
    >
      {/* Drag Handle — separated from click target */}
      <button
        {...attributes}
        {...listeners}
        className="text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing active:text-blue-500 p-0.5 -ml-0.5 rounded transition-colors flex-shrink-0"
        onClick={(e) => e.stopPropagation()}
        aria-label="拖拽排序"
      >
        <GripVertical size={15} />
      </button>

      {/* Module Icon */}
      <span className="text-gray-400 flex-shrink-0">{ICON_MAP[module.type] || <Puzzle size={14} />}</span>

      {/* Module Title */}
      <span className={`flex-1 text-sm truncate select-none ${module.visible ? 'text-gray-700 font-medium' : 'text-gray-400 line-through'}`}>
        {module.title}
      </span>

      {/* Section Badge */}
      <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium flex-shrink-0 ${
        module.section === 'sidebar'
          ? 'bg-purple-50 text-purple-600 border border-purple-200'
          : module.section === 'main'
          ? 'bg-blue-50 text-blue-600 border border-blue-200'
          : 'bg-gray-100 text-gray-500 border border-gray-200'
      }`}>
        {module.section === 'sidebar' ? '侧面' : module.section === 'main' ? '正文' : '自动'}
      </span>

      {/* Visibility Toggle */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          onToggle();
        }}
        className={`p-1 rounded transition-all flex-shrink-0 ${
          isSelected || module.visible
            ? 'opacity-100 text-gray-400 hover:text-gray-600 hover:bg-gray-100'
            : 'opacity-0 group-hover:opacity-100 text-gray-300 hover:text-gray-500'
        }`}
        title={module.visible ? '隐藏模块' : '显示模块'}
      >
        {module.visible ? <Eye size={15} /> : <EyeOff size={15} />}
      </button>
    </div>
  );
};

// ==================== Main LeftPanel ====================
const LeftPanel: React.FC = () => {
  const {
    resume,
    selectedModuleId,
    selectModule,
    toggleModuleVisibility,
    addModule,
    reorderModules,
  } = useResume();

  const [showAddMenu, setShowAddMenu] = useState(false);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const addButtonRef = useRef<HTMLButtonElement>(null);

  // Close menu when clicking outside
  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node) &&
          addButtonRef.current && !addButtonRef.current.contains(e.target as Node)) {
        setShowAddMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Sensors with proper activation constraint
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 4,  // 4px movement required before drag activates
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveDragId(event.active.id as string);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveDragId(null);

      if (!over || active.id === over.id) return;
      if (!resume) return;

      const sortedModules = [...resume.modules].sort((a, b) => a.order - b.order);
      const oldIndex = sortedModules.findIndex((m) => m.id === active.id);
      const newIndex = sortedModules.findIndex((m) => m.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const reordered = arrayMove(sortedModules, oldIndex, newIndex);
        reorderModules(reordered);
      }
    },
    [resume, reorderModules]
  );

  const handleAddModule = useCallback(
    (type: ModuleType) => {
      const opt = MODULE_TYPE_OPTIONS.find((o) => o.type === type);
      const label = opt?.label || type;
      const defaultSection = opt?.defaultSection || 'main';

      addModule({
        id: `${type}_${uid()}`,
        type,
        title: label,
        visible: true,
        order: resume?.modules.length || 0,
        section: defaultSection,
        data: newModuleData(type),
      });
      setShowAddMenu(false);
    },
    [resume, addModule]
  );

  if (!resume) return null;

  const sortedModules = [...resume.modules].sort((a, b) => a.order - b.order);
  const activeDragModule = activeDragId ? resume.modules.find((m) => m.id === activeDragId) : null;

  return (
    <div className="h-full flex flex-col bg-gray-50 select-none">
      {/* Header */}
      <div className="px-4 py-3.5 border-b border-gray-200 bg-white">
        <h3 className="font-semibold text-gray-800 text-sm flex items-center gap-1.5">
          <GripVertical size={15} className="text-gray-400" />
          简历模块
        </h3>
        <p className="text-[11px] text-gray-400 mt-0.5">拖拽 ≡ 图标调整顺序，点击模块编辑</p>
      </div>

      {/* Draggable Module List */}
      <div className="flex-1 overflow-y-auto p-3">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToVerticalAxis]}
        >
          <SortableContext
            items={sortedModules.map((m) => m.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-1.5">
              {sortedModules.map((module) => (
                <SortableModuleItem
                  key={module.id}
                  module={module}
                  isSelected={selectedModuleId === module.id}
                  onSelect={() => selectModule(module.id)}
                  onToggle={() => toggleModuleVisibility(module.id)}
                />
              ))}
            </div>
          </SortableContext>

          {/* Drag Overlay — floating item that follows cursor */}
          <DragOverlay dropAnimation={{ duration: 200, easing: 'cubic-bezier(0.18, 0.89, 0.32, 1.28)' }}>
            {activeDragModule ? (
              <SortableModuleItem
                module={activeDragModule}
                isSelected={false}
                onSelect={() => {}}
                onToggle={() => {}}
                isDragOverlay
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Add Module */}
      <div className="p-3 border-t border-gray-200 bg-white relative">
        <button
          ref={addButtonRef}
          onClick={() => setShowAddMenu((v) => !v)}
          className="w-full py-2.5 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/30 transition-all flex items-center justify-center gap-1.5 font-medium"
        >
          <Plus size={16} />
          添加模块
        </button>

        {/* Dropdown Menu */}
        {showAddMenu && (
          <div
            ref={menuRef}
            className="absolute bottom-full left-3 right-3 mb-2 bg-white rounded-xl border border-gray-200 shadow-2xl z-50 overflow-hidden animate-in"
            style={{ animation: 'slideUp 0.15s ease-out' }}
          >
            <div className="p-1.5 max-h-64 overflow-y-auto">
              {MODULE_TYPE_OPTIONS.map((opt) => (
                <button
                  key={opt.type}
                  onClick={() => handleAddModule(opt.type)}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors text-left"
                >
                  <span className="text-gray-400 flex-shrink-0">{opt.icon}</span>
                  <span className="flex-1">{opt.label}</span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium flex-shrink-0 ${
                    opt.defaultSection === 'sidebar'
                      ? 'bg-purple-50 text-purple-500'
                      : 'bg-blue-50 text-blue-500'
                  }`}>
                    {opt.defaultSection === 'sidebar' ? '侧面' : '正文'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* CSS for menu animation */}
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default LeftPanel;
