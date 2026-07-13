import React, { useRef, useCallback } from 'react';
import { useResume } from '../../hooks/useResume';
import ResumePreview from '../preview/ResumePreview';
import { getTemplateById } from '../../templates';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

const SCALE_STEPS = [0.5, 0.6, 0.75, 0.9, 1, 1.1, 1.25, 1.5];

const CenterPanel: React.FC = () => {
  const { resume, selectedModuleId, selectModule, scale, setScale } = useResume();
  const previewRef = useRef<HTMLDivElement>(null);

  const handleZoomIn = useCallback(() => {
    const currentIdx = SCALE_STEPS.findIndex((s) => s > scale);
    if (currentIdx !== -1) setScale(SCALE_STEPS[currentIdx]);
  }, [scale, setScale]);

  const handleZoomOut = useCallback(() => {
    const reversed = [...SCALE_STEPS].reverse();
    const currentIdx = reversed.findIndex((s) => s < scale);
    if (currentIdx !== -1) setScale(reversed[currentIdx]);
  }, [scale, setScale]);

  const handleResetZoom = useCallback(() => {
    setScale(1);
  }, [setScale]);

  if (!resume) return null;

  const template = getTemplateById(resume.templateId);

  return (
    <div className="h-full flex flex-col bg-gray-100">
      {/* Zoom Controls */}
      <div className="flex items-center justify-center gap-1 py-2 px-4 bg-white border-b border-gray-200 flex-shrink-0">
        <button onClick={handleZoomOut} className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 transition-colors" title="缩小">
          <ZoomOut size={16} />
        </button>
        <button onClick={handleResetZoom} className="px-2 py-0.5 text-xs text-gray-500 hover:text-gray-700 rounded hover:bg-gray-100 transition-colors">
          {Math.round(scale * 100)}%
        </button>
        <button onClick={handleZoomIn} className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 transition-colors" title="放大">
          <ZoomIn size={16} />
        </button>
        <button onClick={handleResetZoom} className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 transition-colors ml-2" title="重置缩放">
          <RotateCcw size={14} />
        </button>
      </div>

      {/* Preview Area */}
      <div className="flex-1 overflow-auto p-6 flex justify-center">
        <div ref={previewRef}>
          <ResumePreview
            modules={resume.modules}
            globalSettings={resume.globalSettings}
            templateId={resume.templateId}
            layout={template?.layout || 'single'}
            scale={scale}
            onModuleClick={selectModule}
            selectedModuleId={selectedModuleId}
          />
        </div>
      </div>
    </div>
  );
};

export default CenterPanel;
