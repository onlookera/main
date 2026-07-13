import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useResume } from '../hooks/useResume';
import { createNewResume, getTemplateById } from '../templates';
import EditorLayout from '../components/layout/EditorLayout';
import { loadResumesFromStorage } from '../context/ResumeContext';
import { Loader2 } from 'lucide-react';

const EditorPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { resume, setResume } = useResume();
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    const templateId = searchParams.get('template');
    const resumeId = searchParams.get('resume');

    // Try to load existing resume by ID
    if (resumeId) {
      const saved = loadResumesFromStorage();
      const existing = saved.find((r) => r.id === resumeId);
      if (existing) {
        setResume(existing);
        setLoading(false);
        return;
      }
    }

    // Create new resume from template
    const tplId = templateId || 'modern-two-column';
    const template = getTemplateById(tplId);
    if (!template) {
      navigate('/');
      return;
    }
    const newResume = createNewResume(tplId);
    setResume(newResume);
    setLoading(false);
  }, [searchParams, setResume, navigate]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 size={40} className="animate-spin mx-auto text-blue-600 mb-4" />
          <p className="text-sm text-gray-500">加载简历编辑器...</p>
        </div>
      </div>
    );
  }

  if (!resume) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-500 mb-4">简历加载失败</p>
          <button onClick={() => navigate('/')} className="btn-primary">
            返回首页
          </button>
        </div>
      </div>
    );
  }

  return <EditorLayout />;
};

export default EditorPage;
