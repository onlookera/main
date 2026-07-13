import React, { useCallback, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useResume } from '../../hooks/useResume';
import { exportToPDF } from '../../utils/pdf';
import {
  ArrowLeft,
  Download,
  Undo,
  Redo,
  Save,
  FileText,
  Check,
  Loader2,
} from 'lucide-react';

const TopBar: React.FC = () => {
  const navigate = useNavigate();
  const { resume, isDirty, undo, redo, history, saveResume } = useResume();
  const [exporting, setExporting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [nameValue, setNameValue] = useState(resume?.name || '');

  // Sync local name when resume changes
  useEffect(() => {
    if (resume) setNameValue(resume.name);
  }, [resume?.name, resume?.id]);

  // Saved indicator
  useEffect(() => {
    if (isDirty) setSaved(false);
    const timer = setTimeout(() => { if (isDirty) setSaved(true); }, 1000);
    return () => clearTimeout(timer);
  }, [isDirty]);

  const handleNameSave = useCallback(() => {
    if (resume && nameValue.trim()) {
      resume.name = nameValue.trim();
      saveResume(resume);
    }
  }, [resume, nameValue, saveResume]);

  const handleExport = useCallback(async () => {
    setExporting(true);
    try {
      const centerPanel = document.querySelector('.a4-paper')?.parentElement as HTMLElement;
      if (!centerPanel) {
        alert('找不到简历预览内容，请确保预览区已加载');
        return;
      }
      const name = resume?.modules.find((m) => m.type === 'personal-info')?.data?.fullName || '简历';
      await exportToPDF(centerPanel, `${name}-简历.pdf`);
    } catch (e) {
      console.error('Export failed:', e);
      alert('导出失败，请重试');
    } finally {
      setExporting(false);
    }
  }, [resume]);

  const handleSave = useCallback(() => {
    if (resume) {
      saveResume(resume);
      setSaved(true);
    }
  }, [resume, saveResume]);

  if (!resume) return null;

  return (
    <div className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 flex-shrink-0 z-10 shadow-sm">
      {/* Left */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate('/')}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
          title="返回首页"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex items-center gap-2 ml-1">
          <FileText size={18} className="text-blue-600" />
          <span className="font-semibold text-gray-800 text-sm hidden sm:inline">简历编辑器</span>
        </div>
        {isDirty && !saved && (
          <span className="text-xs text-amber-500 flex items-center gap-1">
            <Loader2 size={10} className="animate-spin" />
            未保存
          </span>
        )}
        {saved && (
          <span className="text-xs text-green-600 flex items-center gap-1">
            <Check size={10} />
            已保存
          </span>
        )}
      </div>

      {/* Center - Resume name */}
      <div className="hidden md:block">
        <input
          className="text-sm font-medium text-gray-700 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none text-center px-2 py-1"
          value={nameValue}
          onChange={(e) => setNameValue(e.target.value)}
          onBlur={handleNameSave}
          onKeyDown={(e) => { if (e.key === 'Enter') handleNameSave(); }}
        />
      </div>

      {/* Right */}
      <div className="flex items-center gap-1">
        <button
          onClick={undo}
          disabled={history.past.length === 0}
          className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-gray-500"
          title={`撤销 (${history.past.length})`}
        >
          <Undo size={16} />
        </button>
        <button
          onClick={redo}
          disabled={history.future.length === 0}
          className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-gray-500"
          title={`重做 (${history.future.length})`}
        >
          <Redo size={16} />
        </button>

        <div className="w-px h-6 bg-gray-200 mx-1" />

        <button
          onClick={handleSave}
          className="px-3 py-1.5 text-sm rounded-lg hover:bg-gray-100 transition-colors text-gray-600 flex items-center gap-1.5"
        >
          <Save size={14} />
          <span className="hidden sm:inline">保存</span>
        </button>

        <button
          onClick={handleExport}
          disabled={exporting}
          className="btn-primary flex items-center gap-1.5 text-sm py-1.5"
        >
          {exporting ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              导出中...
            </>
          ) : (
            <>
              <Download size={14} />
              <span className="hidden sm:inline">导出PDF</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default TopBar;
