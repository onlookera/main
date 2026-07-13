import React from 'react';
import { Template } from '../../types';
import { ArrowRight } from 'lucide-react';

interface Props {
  template: Template;
  onSelect: (templateId: string) => void;
}

const layoutPreview = (layout: string): React.ReactNode => {
  const baseStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    borderRadius: 4,
    overflow: 'hidden',
    display: 'flex',
    background: '#fff',
    padding: 8,
    gap: 4,
  };

  if (layout === 'sidebar-left') {
    return (
      <div style={baseStyle}>
        <div style={{ width: '30%', background: '#e5e7eb', borderRadius: 2, display: 'flex', flexDirection: 'column', gap: 3, padding: 2 }}>
          <div style={{ height: 10, background: '#9ca3af', borderRadius: 1, width: '60%' }} />
          <div style={{ height: 3, background: '#d1d5db', borderRadius: 1 }} />
          <div style={{ height: 3, background: '#d1d5db', borderRadius: 1, width: '80%' }} />
          <div style={{ height: 4, background: '#9ca3af', borderRadius: 1, width: '50%', marginTop: 4 }} />
          <div style={{ height: 2, background: '#e5e7eb', borderRadius: 1 }} />
          <div style={{ height: 2, background: '#e5e7eb', borderRadius: 1, width: '70%' }} />
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3, padding: 2 }}>
          <div style={{ height: 8, background: '#6b7280', borderRadius: 1, width: '40%' }} />
          <div style={{ height: 2, background: '#d1d5db', borderRadius: 1 }} />
          <div style={{ height: 2, background: '#d1d5db', borderRadius: 1, width: '90%' }} />
          <div style={{ height: 5, background: '#9ca3af', borderRadius: 1, width: '50%', marginTop: 4 }} />
          <div style={{ height: 3, background: '#e5e7eb', borderRadius: 1 }} />
          <div style={{ height: 3, background: '#e5e7eb', borderRadius: 1, width: '80%' }} />
          <div style={{ height: 3, background: '#e5e7eb', borderRadius: 1 }} />
          <div style={{ height: 3, background: '#e5e7eb', borderRadius: 1, width: '60%' }} />
          <div style={{ height: 5, background: '#9ca3af', borderRadius: 1, width: '50%', marginTop: 4 }} />
          <div style={{ height: 3, background: '#e5e7eb', borderRadius: 1 }} />
          <div style={{ height: 3, background: '#e5e7eb', borderRadius: 1, width: '75%' }} />
        </div>
      </div>
    );
  }

  if (layout === 'sidebar-right') {
    return (
      <div style={baseStyle}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3, padding: 2 }}>
          <div style={{ height: 8, background: '#6b7280', borderRadius: 1, width: '40%' }} />
          <div style={{ height: 2, background: '#d1d5db', borderRadius: 1 }} />
          <div style={{ height: 2, background: '#d1d5db', borderRadius: 1, width: '90%' }} />
          <div style={{ height: 5, background: '#9ca3af', borderRadius: 1, width: '50%', marginTop: 4 }} />
          <div style={{ height: 3, background: '#e5e7eb', borderRadius: 1 }} />
          <div style={{ height: 3, background: '#e5e7eb', borderRadius: 1, width: '80%' }} />
        </div>
        <div style={{ width: '30%', background: '#374151', borderRadius: 2, display: 'flex', flexDirection: 'column', gap: 3, padding: 2 }}>
          <div style={{ height: 10, background: '#6b7280', borderRadius: 1, width: '60%' }} />
          <div style={{ height: 3, background: '#4b5563', borderRadius: 1 }} />
          <div style={{ height: 3, background: '#4b5563', borderRadius: 1, width: '80%' }} />
          <div style={{ height: 4, background: '#6b7280', borderRadius: 1, width: '50%', marginTop: 4 }} />
          <div style={{ height: 2, background: '#4b5563', borderRadius: 1 }} />
          <div style={{ height: 2, background: '#4b5563', borderRadius: 1, width: '70%' }} />
        </div>
      </div>
    );
  }

  if (layout === 'timeline') {
    return (
      <div style={baseStyle}>
        <div style={{ width: 2, background: '#d1d5db', borderRadius: 1, marginRight: 6 }} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6, padding: 2 }}>
          <div>
            <div style={{ height: 6, background: '#6b7280', borderRadius: 1, width: '35%', marginBottom: 2 }} />
            <div style={{ height: 3, background: '#e5e7eb', borderRadius: 1 }} />
            <div style={{ height: 3, background: '#e5e7eb', borderRadius: 1, width: '80%' }} />
          </div>
          <div>
            <div style={{ height: 6, background: '#6b7280', borderRadius: 1, width: '40%', marginBottom: 2 }} />
            <div style={{ height: 3, background: '#e5e7eb', borderRadius: 1 }} />
            <div style={{ height: 3, background: '#e5e7eb', borderRadius: 1, width: '85%' }} />
            <div style={{ height: 3, background: '#e5e7eb', borderRadius: 1 }} />
          </div>
          <div>
            <div style={{ height: 6, background: '#6b7280', borderRadius: 1, width: '30%', marginBottom: 2 }} />
            <div style={{ height: 3, background: '#e5e7eb', borderRadius: 1 }} />
            <div style={{ height: 3, background: '#e5e7eb', borderRadius: 1, width: '70%' }} />
          </div>
        </div>
      </div>
    );
  }

  if (layout === 'photo-hero') {
    return (
      <div style={baseStyle}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ height: '35%', background: 'linear-gradient(135deg, #1a365d, #2563eb)', borderRadius: '2px 2px 0 0', display: 'flex', alignItems: 'center', padding: '6px 8px', gap: 8 }}>
            <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(255,255,255,0.3)', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ height: 6, background: 'rgba(255,255,255,0.5)', borderRadius: 1, width: '50%', marginBottom: 2 }} />
              <div style={{ height: 3, background: 'rgba(255,255,255,0.3)', borderRadius: 1, width: '35%' }} />
            </div>
          </div>
          <div style={{ flex: 1, display: 'flex', gap: 3, padding: '4px 6px' }}>
            <div style={{ width: '30%', background: '#f3f4f6', borderRadius: 2, padding: 2 }}>
              <div style={{ height: 3, background: '#d1d5db', borderRadius: 1, marginBottom: 2 }} />
              <div style={{ height: 2, background: '#e5e7eb', borderRadius: 1, marginBottom: 1 }} />
              <div style={{ height: 2, background: '#e5e7eb', borderRadius: 1, width: '60%' }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ height: 5, background: '#9ca3af', borderRadius: 1, width: '40%', marginBottom: 2 }} />
              <div style={{ height: 2, background: '#e5e7eb', borderRadius: 1, marginBottom: 1 }} />
              <div style={{ height: 2, background: '#e5e7eb', borderRadius: 1, width: '80%' }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (layout === 'photo-top') {
    return (
      <div style={baseStyle}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2, padding: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingBottom: 6, borderBottom: '2px solid #e5e7eb' }}>
            <div style={{ width: 28, height: 28, borderRadius: 4, background: '#d1d5db', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ height: 7, background: '#6b7280', borderRadius: 1, width: '40%', marginBottom: 2 }} />
              <div style={{ height: 3, background: '#d1d5db', borderRadius: 1, width: '30%' }} />
            </div>
          </div>
          <div style={{ height: 5, background: '#9ca3af', borderRadius: 1, width: '40%', marginTop: 4 }} />
          <div style={{ height: 2, background: '#e5e7eb', borderRadius: 1 }} />
          <div style={{ height: 2, background: '#e5e7eb', borderRadius: 1, width: '85%' }} />
          <div style={{ height: 5, background: '#9ca3af', borderRadius: 1, width: '40%', marginTop: 3 }} />
          <div style={{ height: 2, background: '#e5e7eb', borderRadius: 1 }} />
          <div style={{ height: 2, background: '#e5e7eb', borderRadius: 1, width: '75%' }} />
        </div>
      </div>
    );
  }

  // default: single layout
  return (
    <div style={baseStyle}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3, padding: 2 }}>
        <div style={{ height: 10, background: '#6b7280', borderRadius: 1, width: '30%', alignSelf: 'center' }} />
        <div style={{ height: 2, background: '#d1d5db', borderRadius: 1, width: '60%', alignSelf: 'center' }} />
        <div style={{ height: 6, background: '#9ca3af', borderRadius: 1, width: '40%', marginTop: 6 }} />
        <div style={{ height: 3, background: '#e5e7eb', borderRadius: 1 }} />
        <div style={{ height: 3, background: '#e5e7eb', borderRadius: 1, width: '90%' }} />
        <div style={{ height: 3, background: '#e5e7eb', borderRadius: 1 }} />
        <div style={{ height: 6, background: '#9ca3af', borderRadius: 1, width: '40%', marginTop: 4 }} />
        <div style={{ height: 3, background: '#e5e7eb', borderRadius: 1 }} />
        <div style={{ height: 3, background: '#e5e7eb', borderRadius: 1, width: '85%' }} />
        <div style={{ height: 6, background: '#9ca3af', borderRadius: 1, width: '40%', marginTop: 4 }} />
        <div style={{ height: 3, background: '#e5e7eb', borderRadius: 1 }} />
        <div style={{ height: 3, background: '#e5e7eb', borderRadius: 1, width: '75%' }} />
      </div>
    </div>
  );
};

const TemplateCard: React.FC<Props> = ({ template, onSelect }) => {
  return (
    <div
      className="template-card bg-white rounded-xl border border-gray-200 overflow-hidden cursor-pointer group"
      onClick={() => onSelect(template.id)}
    >
      {/* Preview */}
      <div className="aspect-[1/1.4] bg-gray-50 p-4 relative overflow-hidden">
        {layoutPreview(template.layout)}
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/10 transition-colors flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all">
            <span className="btn-primary flex items-center gap-1.5 shadow-lg">
              使用此模板
              <ArrowRight size={16} />
            </span>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-4 border-t border-gray-100">
        <h3 className="font-semibold text-gray-800 text-sm">{template.name}</h3>
        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{template.description}</p>
      </div>
    </div>
  );
};

export default TemplateCard;
