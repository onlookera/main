import React from 'react';
import { Module, CustomData } from '../../../types';
import { SectionHeader } from './ExperienceSection';
import { renderMarkdown } from '../../../utils/markdown';

interface Props {
  module: Module;
  globalSettings: { primaryColor: string; fontFamily: string; fontSize: number; sectionSpacing: number };
}

const CustomSection: React.FC<Props> = ({ module, globalSettings }) => {
  const data = module.data as CustomData;
  const { primaryColor, fontFamily, fontSize } = globalSettings;

  return (
    <div style={{ fontFamily, marginBottom: globalSettings.sectionSpacing }}>
      <SectionHeader title={module.title} primaryColor={primaryColor} fontFamily={fontFamily} fontSize={fontSize} />
      <div
        style={{
          fontSize: fontSize,
          color: '#374151',
          lineHeight: 1.7,
        }}
      >
        {renderMarkdown(data.content || '', { color: '#374151' })}
      </div>
    </div>
  );
};

export default CustomSection;
