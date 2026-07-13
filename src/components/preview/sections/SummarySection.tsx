import React from 'react';
import { Module, SummaryData } from '../../../types';
import { renderMarkdown } from '../../../utils/markdown';

interface Props {
  module: Module;
  globalSettings: { primaryColor: string; fontFamily: string; fontSize: number; sectionSpacing: number };
}

const SummarySection: React.FC<Props> = ({ module, globalSettings }) => {
  const data = module.data as SummaryData;
  if (!data.content) return null;
  const { primaryColor, fontFamily, fontSize } = globalSettings;

  return (
    <div style={{ fontFamily, marginBottom: globalSettings.sectionSpacing }}>
      <div
        style={{
          fontSize: fontSize,
          color: '#374151',
          lineHeight: 1.7,
        }}
      >
        {renderMarkdown(data.content, { color: '#374151' })}
      </div>
    </div>
  );
};

export default SummarySection;
