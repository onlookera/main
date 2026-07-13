import React from 'react';
import { Module, ListEntry } from '../../../types';
import { renderMarkdown } from '../../../utils/markdown';

interface Props {
  module: Module;
  globalSettings: {
    primaryColor: string;
    fontFamily: string;
    fontSize: number;
    sectionSpacing: number;
    margin: number;
  };
  layout?: string;
}

// ============ Professional Section Header ============
export const SectionHeader: React.FC<{
  title: string;
  primaryColor: string;
  fontFamily: string;
  fontSize: number;
  layout?: string;
}> = ({ title, primaryColor, fontFamily, fontSize, layout }) => {
  // Dark sidebar: white text
  const isDark = layout === 'sidebar-right';
  const textColor = isDark ? 'rgba(255,255,255,0.9)' : primaryColor;
  const lineColor = isDark ? 'rgba(255,255,255,0.2)' : primaryColor + '30';

  return (
    <div style={{ marginBottom: 14 }}>
      <h2
        style={{
          fontSize: fontSize + 4,
          fontWeight: 700,
          color: textColor,
          fontFamily,
          letterSpacing: 1.5,
          textTransform: 'uppercase',
          marginBottom: 8,
          paddingBottom: 6,
          borderBottom: `2px solid ${lineColor}`,
        }}
      >
        {title}
      </h2>
    </div>
  );
};

// ============ Professional List Entry Item ============
export const ListEntryItem: React.FC<{
  entry: ListEntry;
  primaryColor: string;
  fontFamily: string;
  fontSize: number;
  isDark?: boolean;
  isTimeline?: boolean;
}> = ({ entry, primaryColor, fontFamily, fontSize, isDark, isTimeline }) => {
  const textColor = isDark ? 'rgba(255,255,255,0.85)' : '#1f2937';
  const subtitleColor = isDark ? 'rgba(255,255,255,0.6)' : primaryColor;
  const descColor = isDark ? 'rgba(255,255,255,0.55)' : '#4b5563';
  const metaColor = isDark ? 'rgba(255,255,255,0.45)' : '#6b7280';

  const dateStr = [entry.startDate, entry.current ? '至今' : entry.endDate].filter(Boolean).join(' - ');
  const locationStr = entry.location || '';

  return (
    <div style={{ marginBottom: isTimeline ? 16 : 14 }}>
      {/* Title Row */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          flexWrap: 'wrap',
          gap: '4px 12px',
          marginBottom: 2,
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{
            fontSize: fontSize + 2,
            fontWeight: 600,
            color: textColor,
            fontFamily,
            lineHeight: 1.3,
            margin: 0,
          }}>
            {entry.title}
          </h3>
          {entry.subtitle && (
            <p style={{
              fontSize: fontSize,
              color: subtitleColor,
              fontWeight: 500,
              fontFamily,
              margin: '2px 0 0 0',
            }}>
              {entry.subtitle}
            </p>
          )}
        </div>

        {/* Date & Location */}
        {(dateStr || locationStr) && (
          <div style={{
            textAlign: 'right',
            fontSize: fontSize - 1,
            color: metaColor,
            fontFamily,
            flexShrink: 0,
            lineHeight: 1.4,
          }}>
            {dateStr && <div>{dateStr}</div>}
            {locationStr && <div>{locationStr}</div>}
            {isTimeline && (
              <div style={{
                display: 'inline-block',
                marginTop: 2,
                padding: '2px 8px',
                borderRadius: 10,
                fontSize: fontSize - 2,
                background: primaryColor + '15',
                color: primaryColor,
                fontWeight: 500,
              }}>
                {dateStr}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Description with Markdown rendering */}
      {entry.description && (
        <div
          style={{
            fontSize: fontSize - 1,
            color: descColor,
            lineHeight: 1.65,
            fontFamily,
            marginTop: 6,
            paddingLeft: isTimeline ? 0 : 2,
          }}
        >
          {renderMarkdown(entry.description, { color: descColor })}
        </div>
      )}
    </div>
  );
};

// ============ Experience Section ============
const ExperienceSection: React.FC<Props> = ({ module, globalSettings, layout }) => {
  const entries = (module.data as { entries: ListEntry[] }).entries || [];
  const visibleEntries = entries.filter((e) => e.title || e.subtitle);
  const { primaryColor, fontFamily, fontSize } = globalSettings;
  const isDark = layout === 'sidebar-right';
  const isTimeline = layout === 'timeline';

  return (
    <div style={{ fontFamily, marginBottom: globalSettings.sectionSpacing }}>
      <SectionHeader
        title={module.title}
        primaryColor={primaryColor}
        fontFamily={fontFamily}
        fontSize={fontSize}
        layout={layout}
      />
      {visibleEntries.map((entry, idx) => (
        <ListEntryItem
          key={entry.id}
          entry={entry}
          primaryColor={isTimeline ? primaryColor : primaryColor}
          fontFamily={fontFamily}
          fontSize={fontSize}
          isDark={isDark}
          isTimeline={isTimeline}
        />
      ))}
    </div>
  );
};

export default ExperienceSection;
