import React from 'react';
import { Module, ListEntry } from '../../../types';
import { SectionHeader, ListEntryItem } from './ExperienceSection';

interface Props {
  module: Module;
  globalSettings: { primaryColor: string; fontFamily: string; fontSize: number; sectionSpacing: number };
}

const CertificationsSection: React.FC<Props> = ({ module, globalSettings }) => {
  const entries = (module.data as { entries: ListEntry[] }).entries || [];
  const visibleEntries = entries.filter((e) => e.title);
  const { primaryColor, fontFamily, fontSize } = globalSettings;

  return (
    <div style={{ fontFamily, marginBottom: globalSettings.sectionSpacing }}>
      <SectionHeader title={module.title} primaryColor={primaryColor} fontFamily={fontFamily} fontSize={fontSize} />
      {visibleEntries.map((entry) => (
        <ListEntryItem
          key={entry.id}
          entry={entry}
          primaryColor={primaryColor}
          fontFamily={fontFamily}
          fontSize={fontSize}
        />
      ))}
    </div>
  );
};

export default CertificationsSection;
