import React from 'react';
import { Module, LanguagesData } from '../../../types';

interface Props {
  module: Module;
  globalSettings: { primaryColor: string; fontFamily: string; fontSize: number; sectionSpacing: number };
}

const SectionHeader: React.FC<{ title: string; primaryColor: string; fontFamily: string; fontSize: number }> = ({
  title,
  primaryColor,
  fontFamily,
  fontSize,
}) => (
  <div
    style={{
      borderBottom: `2px solid ${primaryColor}`,
      marginBottom: 12,
      paddingBottom: 4,
    }}
  >
    <h2
      style={{
        fontSize: fontSize + 4,
        fontWeight: 700,
        color: primaryColor,
        fontFamily,
        letterSpacing: 0.5,
        textTransform: 'uppercase',
      }}
    >
      {title}
    </h2>
  </div>
);

const LanguagesSection: React.FC<Props> = ({ module, globalSettings }) => {
  const data = module.data as LanguagesData;
  const languages = data.languages || [];
  const { primaryColor, fontFamily, fontSize } = globalSettings;

  return (
    <div style={{ fontFamily, marginBottom: globalSettings.sectionSpacing }}>
      <SectionHeader title={module.title} primaryColor={primaryColor} fontFamily={fontFamily} fontSize={fontSize} />
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
        {languages.map((lang) => (
          <div key={lang.id} style={{ fontSize: fontSize, color: '#374151' }}>
            <span style={{ fontWeight: 600 }}>{lang.name}</span>
            {lang.proficiency && (
              <span style={{ color: '#6b7280', marginLeft: 6 }}>({lang.proficiency})</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LanguagesSection;
