import React, { useRef } from 'react';
import { Module, LayoutType } from '../../types';
import { A4_WIDTH, A4_HEIGHT } from '../../utils/pagination';
import PersonalInfoSection from './sections/PersonalInfoSection';
import SummarySection from './sections/SummarySection';
import ExperienceSection from './sections/ExperienceSection';
import EducationSection from './sections/EducationSection';
import SkillsSection from './sections/SkillsSection';
import ProjectsSection from './sections/ProjectsSection';
import CertificationsSection from './sections/CertificationsSection';
import LanguagesSection from './sections/LanguagesSection';
import CustomSection from './sections/CustomSection';

interface Props {
  modules: Module[];
  globalSettings: {
    primaryColor: string; backgroundColor: string; fontFamily: string;
    fontSize: number; margin: number; sectionSpacing: number; showPageNumbers: boolean;
  };
  templateId: string;
  layout: LayoutType;
  scale: number;
  onModuleClick?: (moduleId: string) => void;
  selectedModuleId?: string | null;
  previewRef?: React.RefObject<HTMLDivElement>;
}

const sectionComponentMap: Record<string, React.FC<any>> = {
  'personal-info': PersonalInfoSection, 'summary': SummarySection,
  'experience': ExperienceSection, 'education': EducationSection,
  'skills': SkillsSection, 'projects': ProjectsSection,
  'certifications': CertificationsSection, 'languages': LanguagesSection,
  'custom': CustomSection,
};

function getSection(m: Module): 'sidebar' | 'main' {
  if (m.section === 'sidebar') return 'sidebar';
  if (m.section === 'main') return 'main';
  return ['skills', 'languages', 'certifications'].includes(m.type) ? 'sidebar' : 'main';
}

const ResumePreview: React.FC<Props> = ({
  modules, globalSettings: gs, layout, scale, onModuleClick, selectedModuleId, previewRef,
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const isTwoCol = layout === 'sidebar-left' || layout === 'sidebar-right' || layout === 'photo-hero';
  const isPhotoHero = layout === 'photo-hero';

  const visible = modules.filter((m) => m.visible).sort((a, b) => a.order - b.order);
  const sidebarMods = visible.filter((m) => getSection(m) === 'sidebar');
  const mainMods = visible.filter((m) => getSection(m) === 'main');
  const piMod = isPhotoHero ? visible.find((m) => m.type === 'personal-info') : null;

  // 渲染单个模块
  const renderMod = (m: Module, overrideLayout?: string) => {
    const Comp = sectionComponentMap[m.type];
    if (!Comp) return null;
    const sel = selectedModuleId === m.id;
    return (
      <div
        key={m.id}
        data-module-id={m.id}
        onClick={(e) => { e.stopPropagation(); onModuleClick?.(m.id); }}
        style={{
          cursor: onModuleClick ? 'pointer' : 'default',
          outline: sel ? `2px solid ${gs.primaryColor}` : '2px solid transparent',
          outlineOffset: 2, borderRadius: 4, transition: 'outline-color 0.2s',
          marginBottom: gs.sectionSpacing,
        }}
      >
        <Comp module={m} globalSettings={gs} layout={overrideLayout || layout} />
      </div>
    );
  };

  return (
    <div ref={previewRef} style={{ transform: `scale(${scale})`, transformOrigin: 'top center' }}>
      <div
        ref={contentRef}
        className="a4-paper"
        style={{
          width: A4_WIDTH,
          minHeight: A4_HEIGHT,
          backgroundColor: gs.backgroundColor,
          fontFamily: gs.fontFamily,
          fontSize: gs.fontSize,
          boxShadow: '0 4px 24px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)',
          margin: '0 auto',
          padding: isPhotoHero ? 0 : gs.margin,
          position: 'relative',
        }}
      >
        {/* Photo-hero banner */}
        {piMod && renderMod(piMod, 'photo-hero')}

        {isTwoCol ? (
          <div style={{ display: 'flex', gap: 20, padding: isPhotoHero ? `0 ${gs.margin}px` : 0 }}>
            {/* SIDEBAR */}
            <div style={{
              width: 215, flexShrink: 0,
              background: layout === 'sidebar-right' ? gs.primaryColor : gs.primaryColor + '08',
              borderRadius: 6, padding: layout === 'sidebar-right' ? '16px 14px' : '12px 14px',
              color: layout === 'sidebar-right' ? '#fff' : undefined,
            }}>
              {sidebarMods.map((m) => renderMod(m, layout === 'sidebar-right' ? 'sidebar-right' : 'sidebar-left'))}
            </div>
            {/* MAIN */}
            <div style={{ flex: 1 }}>
              {(piMod ? mainMods.filter((m) => m.type !== 'personal-info') : mainMods).map((m) => renderMod(m))}
            </div>
          </div>
        ) : (
          /* 单栏 / 时间轴 / photo-top */
          mainMods.map((m) => {
            if (layout === 'timeline' && ['experience', 'education', 'projects'].includes(m.type)) {
              return (
                <div key={m.id} style={{ position: 'relative', paddingLeft: 28 }}>
                  <div style={{ position: 'absolute', left: -4, top: 6, width: 10, height: 10, borderRadius: '50%', background: gs.primaryColor, border: '2px solid #fff', boxShadow: `0 0 0 2px ${gs.primaryColor}40`, zIndex: 1 }} />
                  <div style={{ position: 'absolute', left: 0, top: 16, bottom: 0, width: 2, background: gs.primaryColor + '30' }} />
                  {renderMod(m, 'timeline')}
                </div>
              );
            }
            return renderMod(m, m.type === 'personal-info' && layout === 'photo-top' ? 'photo-top' : undefined);
          })
        )}

        {/* A4 分页线叠加层：每 1123px 画一条虚线 */}
        <PageBreakOverlay contentRef={contentRef} fontFamily={gs.fontFamily} />
      </div>
    </div>
  );
};

// 分页线叠加组件
const PageBreakOverlay: React.FC<{ contentRef: React.RefObject<HTMLDivElement | null>; fontFamily: string }> = ({ contentRef, fontFamily }) => {
  const [lines, setLines] = React.useState<number[]>([]);

  React.useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() => {
      const h = el.scrollHeight;
      const count = Math.floor(h / A4_HEIGHT);
      const arr: number[] = [];
      for (let i = 1; i <= count; i++) arr.push(i * A4_HEIGHT);
      setLines(arr);
    });
    observer.observe(el);
    // Initial measurement
    const h = el.scrollHeight;
    const count = Math.floor(h / A4_HEIGHT);
    const arr: number[] = [];
    for (let i = 1; i <= count; i++) arr.push(i * A4_HEIGHT);
    setLines(arr);
    return () => observer.disconnect();
  }, [contentRef]);

  return (
    <>
      {lines.map((y) => (
        <div
          key={y}
          style={{
            position: 'absolute',
            top: y,
            left: 0,
            right: 0,
            height: 0,
            borderTop: '2px dashed #cbd5e1',
            pointerEvents: 'none',
            zIndex: 10,
          }}
        >
          <span style={{
            position: 'absolute',
            right: 16,
            top: -10,
            fontSize: 11,
            color: '#94a3b8',
            background: '#fff',
            padding: '0 8px',
            fontFamily,
          }}>
            分页线
          </span>
        </div>
      ))}
    </>
  );
};

export default ResumePreview;
