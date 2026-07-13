import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useResume } from '../hooks/useResume';
import ResumePreview from '../components/preview/ResumePreview';
import { getTemplateById } from '../templates';
import { ArrowLeft } from 'lucide-react';

const PreviewPage: React.FC = () => {
  const navigate = useNavigate();
  const { resume } = useResume();

  if (!resume) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">没有简历数据</p>
          <button onClick={() => navigate('/')} className="btn-primary">
            返回首页
          </button>
        </div>
      </div>
    );
  }

  const template = getTemplateById(resume.templateId);

  return (
    <div className="min-h-screen bg-gray-200 py-6">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft size={16} />
            返回编辑
          </button>
          <h2 className="font-semibold text-gray-700">打印预览</h2>
          <div className="w-20" />
        </div>

        <div className="flex justify-center">
          <ResumePreview
            modules={resume.modules}
            globalSettings={resume.globalSettings}
            templateId={resume.templateId}
            layout={template?.layout || 'single'}
            scale={1}
          />
        </div>
      </div>
    </div>
  );
};

export default PreviewPage;
