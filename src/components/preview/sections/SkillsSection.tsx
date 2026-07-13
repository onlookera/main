import React from 'react';
import { Module, SkillsData, SkillItem } from '../../../types';
import { SectionHeader } from './ExperienceSection';

interface Props {
  module: Module;
  globalSettings: { primaryColor: string; fontFamily: string; fontSize: number; sectionSpacing: number };
  layout?: string;
}

const SkillBars: React.FC<{ skills: SkillItem[]; primaryColor: string; fontFamily: string; fontSize: number }> = ({
  skills,
  primaryColor,
  fontFamily,
  fontSize,
}) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
    {skills.map((skill) => (
      <div key={skill.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ width: 80, fontSize: fontSize - 1, fontFamily, color: '#374151', flexShrink: 0 }}>
          {skill.name}
        </span>
        <div style={{ flex: 1, height: 6, background: '#e5e7eb', borderRadius: 3, overflow: 'hidden' }}>
          <div
            style={{
              height: '100%',
              width: `${(skill.level / 5) * 100}%`,
              background: primaryColor,
              borderRadius: 3,
              transition: 'width 0.3s',
            }}
          />
        </div>
      </div>
    ))}
  </div>
);

const SkillTags: React.FC<{ skills: SkillItem[]; primaryColor: string; fontFamily: string; fontSize: number }> = ({
  skills,
  primaryColor,
  fontFamily,
  fontSize,
}) => (
  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
    {skills.map((skill) => (
      <span
        key={skill.id}
        style={{
          padding: '2px 10px',
          fontSize: fontSize - 1,
          fontFamily,
          background: `${primaryColor}10`,
          color: primaryColor,
          borderRadius: 12,
          border: `1px solid ${primaryColor}30`,
        }}
      >
        {skill.name}
      </span>
    ))}
  </div>
);

const SkillDots: React.FC<{ skills: SkillItem[]; primaryColor: string; fontFamily: string; fontSize: number }> = ({
  skills,
  primaryColor,
  fontFamily,
  fontSize,
}) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
    {skills.map((skill) => (
      <div key={skill.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ width: 80, fontSize: fontSize - 1, fontFamily, color: '#374151', flexShrink: 0 }}>
          {skill.name}
        </span>
        <div style={{ display: 'flex', gap: 3 }}>
          {[1, 2, 3, 4, 5].map((dot) => (
            <span
              key={dot}
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: dot <= skill.level ? primaryColor : '#e5e7eb',
              }}
            />
          ))}
        </div>
      </div>
    ))}
  </div>
);

const SkillsSection: React.FC<Props> = ({ module, globalSettings, layout }) => {
  const data = module.data as SkillsData;
  const skills = data.skills || [];
  const displayMode = data.displayMode || 'bars';
  const { primaryColor, fontFamily, fontSize } = globalSettings;

  if (skills.length === 0) return null;

  return (
    <div style={{ fontFamily, marginBottom: globalSettings.sectionSpacing }}>
      <SectionHeader title={module.title} primaryColor={primaryColor} fontFamily={fontFamily} fontSize={fontSize} layout={layout} />
      {displayMode === 'bars' && (
        <SkillBars skills={skills} primaryColor={primaryColor} fontFamily={fontFamily} fontSize={fontSize} />
      )}
      {displayMode === 'tags' && (
        <SkillTags skills={skills} primaryColor={primaryColor} fontFamily={fontFamily} fontSize={fontSize} />
      )}
      {displayMode === 'dots' && (
        <SkillDots skills={skills} primaryColor={primaryColor} fontFamily={fontFamily} fontSize={fontSize} />
      )}
    </div>
  );
};

export default SkillsSection;
