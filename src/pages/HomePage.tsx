import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useResume } from '../hooks/useResume';
import { TEMPLATES, createNewResume } from '../templates';
import { Resume } from '../types';
import TemplateCard from '../components/home/TemplateCard';
import ResumeList from '../components/home/ResumeList';
import { FileText, Sparkles, ArrowRight, Plus } from 'lucide-react';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { setResume, loadResumes, deleteResume, duplicateResume } = useResume();
  const [savedResumes, setSavedResumes] = useState<Resume[]>([]);

  useEffect(() => {
    setSavedResumes(loadResumes());
  }, [loadResumes]);

  const handleCreateNew = useCallback(
    (templateId: string) => {
      const newResume = createNewResume(templateId);
      setResume(newResume);
      navigate(`/editor?template=${templateId}&resume=${newResume.id}`);
    },
    [setResume, navigate]
  );

  const handleEdit = useCallback(
    (resumeId: string) => {
      const resumes = loadResumes();
      const resume = resumes.find((r) => r.id === resumeId);
      if (resume) {
        setResume(resume);
        navigate(`/editor?resume=${resumeId}`);
      }
    },
    [loadResumes, setResume, navigate]
  );

  const handleDelete = useCallback(
    (resumeId: string) => {
      deleteResume(resumeId);
      setSavedResumes(loadResumes());
    },
    [deleteResume, loadResumes]
  );

  const handleDuplicate = useCallback(
    (resumeId: string) => {
      duplicateResume(resumeId);
      setSavedResumes(loadResumes());
    },
    [duplicateResume, loadResumes]
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="max-w-6xl mx-auto px-6 py-16 md:py-24">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <FileText size={24} className="text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold">简历制作</h1>
          </div>
          <p className="text-center text-blue-100 text-lg md:text-xl max-w-2xl mx-auto">
            选择精美模板，快速创建专业简历。实时预览，一键导出PDF，完全免费。
          </p>
          <div className="flex items-center justify-center gap-3 mt-6 text-sm text-blue-200">
            <span className="flex items-center gap-1"><Sparkles size={14} /> 8套专业模板</span>
            <span className="w-1 h-1 bg-blue-400 rounded-full" />
            <span className="flex items-center gap-1"><Sparkles size={14} /> 实时预览</span>
            <span className="w-1 h-1 bg-blue-400 rounded-full" />
            <span className="flex items-center gap-1"><Sparkles size={14} /> 一键导出PDF</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 -mt-8 pb-16">
        {/* Template Selection */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Plus size={20} className="text-blue-600" />
            选择模板开始创建
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {TEMPLATES.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onSelect={handleCreateNew}
              />
            ))}
          </div>
        </div>

        {/* Saved Resumes */}
        <ResumeList
          resumes={savedResumes}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onDuplicate={handleDuplicate}
        />

        {/* Empty state */}
        {savedResumes.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <FileText size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-sm">还没有保存的简历，选择一个模板开始创建吧</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-6 text-center text-xs text-gray-400">
        简历制作工具 · 所有数据保存在浏览器本地 · 无需注册登录
      </footer>
    </div>
  );
};

export default HomePage;
