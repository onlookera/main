import React, { useState } from 'react';
import TopBar from './TopBar';
import LeftPanel from './LeftPanel';
import CenterPanel from './CenterPanel';
import RightPanel from './RightPanel';
import { useResume } from '../../hooks/useResume';
import { PanelLeft, PanelRight, Eye, Settings, List } from 'lucide-react';

const EditorLayout: React.FC = () => {
  const { resume } = useResume();
  const [mobileTab, setMobileTab] = useState<'preview' | 'edit' | 'modules'>('preview');

  if (!resume) return null;

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <TopBar />

      {/* Desktop Layout */}
      <div className="hidden lg:flex flex-1 overflow-hidden">
        {/* Left Panel */}
        <div className="w-64 flex-shrink-0 border-r border-gray-200 overflow-visible">
          <LeftPanel />
        </div>

        {/* Center Preview */}
        <div className="flex-1 overflow-hidden">
          <CenterPanel />
        </div>

        {/* Right Panel */}
        <div className="w-80 flex-shrink-0 border-l border-gray-200 overflow-hidden">
          <RightPanel />
        </div>
      </div>

      {/* Tablet/Mobile Layout */}
      <div className="lg:hidden flex flex-col flex-1 overflow-hidden">
        {/* Tab bar */}
        <div className="flex border-b border-gray-200 bg-white flex-shrink-0">
          {[
            { key: 'preview' as const, label: '预览', icon: <Eye size={16} /> },
            { key: 'modules' as const, label: '模块', icon: <List size={16} /> },
            { key: 'edit' as const, label: '编辑', icon: <Settings size={16} /> },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setMobileTab(tab.key)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-medium transition-colors ${
                mobileTab === tab.key
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-hidden">
          {mobileTab === 'preview' && <CenterPanel />}
          {mobileTab === 'modules' && <LeftPanel />}
          {mobileTab === 'edit' && <RightPanel />}
        </div>
      </div>
    </div>
  );
};

export default EditorLayout;
