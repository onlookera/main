import { Module, ModuleSection, LayoutType } from '../types';

export const A4_WIDTH = 794;
export const A4_HEIGHT = 1123;

export interface ModuleSlice {
  module: Module;
  entryRange?: { start: number; end: number };
  showHeader: boolean;
}

export interface PageSlice {
  sidebarSlices: ModuleSlice[];
  mainSlices: ModuleSlice[];
}

// ============ 分类 ============
function classify(module: Module): ModuleSection {
  if (module.section === 'sidebar') return 'sidebar';
  if (module.section === 'main') return 'main';
  return ['skills', 'languages', 'certifications'].includes(module.type) ? 'sidebar' : 'main';
}

function isList(m: Module): boolean {
  return ['experience', 'education', 'projects', 'certifications'].includes(m.type);
}

// ============ 紧凑高度估算（偏小估算，避免多余空白） ============
function estHeader(fontSize: number): number {
  return fontSize + 22; // 标题行
}

function estEntry(e: any, fontSize: number): number {
  let h = 4; // 条目间紧凑间距
  if (e.title) h += fontSize + 6;
  if (e.subtitle) h += fontSize + 2;
  if (e.startDate || e.endDate || e.location) h += fontSize;
  if (e.description) {
    const lines = Math.max(1, Math.ceil(e.description.length / 60));
    h += lines * (fontSize * 1.5);
  }
  return h;
}

function estModule(m: Module, fontSize: number): number {
  const d = m.data;
  let h = estHeader(fontSize);

  switch (m.type) {
    case 'personal-info': {
      const hasPhoto = d.showPhoto !== false && !!d.avatar;
      const map: Record<string, number> = { small: 90, medium: 110, large: 135, xlarge: 160 };
      h += hasPhoto ? (map[d.photoSize || 'medium'] || 110) + 8 : 16;
      if (d.fullName) h += fontSize + 10;
      if (d.title) h += fontSize + 4;
      const n = [d.email, d.phone, d.location, d.website, d.linkedin, d.github].filter(Boolean).length;
      h += n * (fontSize + 5);
      break;
    }
    case 'summary':
    case 'custom':
      h += Math.max(1, Math.ceil((d.content || '').length / 65)) * (fontSize * 1.45) + 6;
      break;
    case 'experience':
    case 'education':
    case 'projects':
    case 'certifications': {
      const entries: any[] = d.entries || [];
      if (entries.length === 0) h += 16;
      else for (const e of entries) h += estEntry(e, fontSize);
      break;
    }
    case 'skills': {
      const skills: any[] = d.skills || [];
      h += Math.max(16, skills.length * ((d.displayMode || 'bars') === 'tags' ? 26 : 18) + 4);
      break;
    }
    case 'languages': {
      const langs: any[] = d.languages || [];
      h += Math.max(16, langs.length * (fontSize + 6) + 4);
      break;
    }
    default:
      h += 20;
  }
  return h;
}

// ============ 主分页入口 ============
export function paginateModules(
  modules: Module[],
  layout: LayoutType,
  fontSize: number,
  margin: number,
  sectionSpacing: number,
): PageSlice[] {
  const visible = modules.filter((m) => m.visible).sort((a, b) => a.order - b.order);
  const pageH = A4_HEIGHT - margin * 2;
  const isTwoCol = layout === 'sidebar-left' || layout === 'sidebar-right';

  // photo-hero: 第一页 banner 占位后，剩余空间双栏
  if (layout === 'photo-hero') {
    const pi = visible.find((m) => m.type === 'personal-info');
    const others = visible.filter((m) => m.type !== 'personal-info');
    const heroH = pi ? estModule(pi, fontSize) + 60 : 0;
    const pages = paginateTwoCol(others, fontSize, pageH - heroH, sectionSpacing);
    return pages;
  }

  if (isTwoCol) {
    return paginateTwoCol(visible, fontSize, pageH, sectionSpacing);
  }

  // 单栏：内容紧凑连续流动
  return paginateSingle(visible, fontSize, pageH, sectionSpacing);
}

// ============ 单栏连续分页 ============
function paginateSingle(
  modules: Module[],
  fontSize: number,
  pageH: number,
  spacing: number,
): PageSlice[] {
  const pages: PageSlice[] = [];
  let curMain: ModuleSlice[] = [];
  let curH = 0;

  for (const mod of modules) {
    const entries = isList(mod) ? (mod.data.entries || []) as any[] : [];
    const headerH = estHeader(fontSize);
    // 每个模块后加 spacing（与渲染时的 section marginBottom 一致）
    const gap = spacing;

    if (entries.length > 0) {
      let start = 0;
      let batchH = headerH;
      let batchEnd = 0;

      for (let ei = 0; ei < entries.length; ei++) {
        const eh = estEntry(entries[ei], fontSize);
        if (curH + batchH + eh <= pageH) {
          batchH += eh;
          batchEnd = ei + 1;
        } else {
          if (batchEnd > start) {
            curMain.push({ module: mod, entryRange: { start, end: batchEnd }, showHeader: true });
          }
          pages.push({ sidebarSlices: [], mainSlices: curMain });
          curMain = [];
          curH = 0;
          start = ei;
          batchH = headerH + eh;
          batchEnd = ei + 1;
        }
      }
      if (batchEnd > start) {
        curMain.push({ module: mod, entryRange: { start, end: batchEnd }, showHeader: true });
        curH += batchH + gap;
      }
    } else {
      const fullH = estModule(mod, fontSize) + gap;
      if (curH + fullH > pageH && curMain.length > 0) {
        pages.push({ sidebarSlices: [], mainSlices: curMain });
        curMain = [];
        curH = 0;
      }
      curMain.push({ module: mod, showHeader: true });
      curH += fullH;
    }
  }

  if (curMain.length > 0) pages.push({ sidebarSlices: [], mainSlices: curMain });
  return pages.length > 0 ? pages : [{ sidebarSlices: [], mainSlices: [] }];
}

// ============ 双栏连续分页 ============
function paginateTwoCol(
  modules: Module[],
  fontSize: number,
  pageH: number,
  spacing: number,
): PageSlice[] {
  const pages: PageSlice[] = [{ sidebarSlices: [], mainSlices: [] }];
  let cur = 0;
  let sideH = 0;
  let mainH = 0;
  const gap = spacing;

  for (const mod of modules) {
    const cls = classify(mod);
    const isSide = cls === 'sidebar';
    const colH = isSide ? sideH : mainH;
    const entries = isList(mod) ? (mod.data.entries || []) as any[] : [];
    const headerH = estHeader(fontSize);
    const fullH = estModule(mod, fontSize) + gap;

    const colSlices = isSide ? pages[cur].sidebarSlices : pages[cur].mainSlices;
    let fits = colH + fullH <= pageH || colSlices.length === 0;

    if (!fits && entries.length > 0) {
      let h = headerH; let n = 0;
      for (const e of entries) {
        const eh = estEntry(e, fontSize);
        if (colH + h + eh <= pageH) { h += eh; n++; } else break;
      }
      fits = n > 0;
    }

    if (!fits) {
      cur++;
      sideH = 0;
      mainH = 0;
      pages.push({ sidebarSlices: [], mainSlices: [] });
    }

    const pg = pages[cur];

    if (entries.length > 0) {
      // while 循环：支持跨多页拆分
      let entryIdx = 0;
      let safety = 0;
      while (entryIdx < entries.length && safety < 1000) {
        safety++;
        const pg2 = pages[cur];
        const colH2 = isSide ? sideH : mainH;
        let h = headerH; let n = 0;
        for (let ei = entryIdx; ei < entries.length; ei++) {
          const eh = estEntry(entries[ei], fontSize);
          if (colH2 + h + eh <= pageH) { h += eh; n++; } else break;
        }
        // 如果一个条目都放不下：起新页（当前页有内容时）或强制放一个条目
        if (n === 0) {
          if ((isSide ? pg2.sidebarSlices.length : pg2.mainSlices.length) > 0) {
            cur++; sideH = 0; mainH = 0;
            pages.push({ sidebarSlices: [], mainSlices: [] });
            continue; // 在新页上重试
          }
          // 空页也放不下 → 强制放一个条目（条目超高，让它溢出）
          n = 1;
          h = headerH + estEntry(entries[entryIdx], fontSize);
        }
        const lastBatch = entryIdx + n === entries.length;
        if (isSide) { pg2.sidebarSlices.push({ module: mod, entryRange: { start: entryIdx, end: entryIdx + n }, showHeader: true }); sideH += h + (lastBatch ? gap : 0); }
        else { pg2.mainSlices.push({ module: mod, entryRange: { start: entryIdx, end: entryIdx + n }, showHeader: true }); mainH += h + (lastBatch ? gap : 0); }
        entryIdx += n;
        if (entryIdx < entries.length) {
          cur++; sideH = 0; mainH = 0;
          pages.push({ sidebarSlices: [], mainSlices: [] });
        }
      }
    } else {
      if (isSide) { pg.sidebarSlices.push({ module: mod, showHeader: true }); sideH += fullH; }
      else { pg.mainSlices.push({ module: mod, showHeader: true }); mainH += fullH; }
    }
  }

  // ===== 平衡：把后面页的 sidebar 模块往前搬 =====
  for (let pi = 0; pi < pages.length - 1; pi++) {
    const curPg = pages[pi];
    const nextPg = pages[pi + 1];
    let curSH = curPg.sidebarSlices.reduce((s: number, sl: ModuleSlice) => {
      if (sl.entryRange) {
        const ents = (sl.module.data.entries || []).slice(sl.entryRange.start, sl.entryRange.end);
        return s + ents.reduce((ss: number, e: any) => ss + estEntry(e, fontSize), estHeader(fontSize));
      }
      return s + estModule(sl.module, fontSize);
    }, 0);

    while (curSH < pageH && nextPg.sidebarSlices.length > 0) {
      const sl = nextPg.sidebarSlices[0];
      const sh = sl.entryRange
        ? (sl.module.data.entries || []).slice(sl.entryRange.start, sl.entryRange.end).reduce((ss: number, e: any) => ss + estEntry(e, fontSize), estHeader(fontSize))
        : estModule(sl.module, fontSize);
      if (curSH + sh <= pageH) {
        curPg.sidebarSlices.push(nextPg.sidebarSlices.shift()!);
        curSH += sh;
      } else break;
    }
  }

  // 清除末尾空页
  while (pages.length > 1) {
    const last = pages[pages.length - 1];
    if (last.sidebarSlices.length === 0 && last.mainSlices.length === 0) pages.pop();
    else break;
  }

  return pages.length > 0 ? pages : [{ sidebarSlices: [], mainSlices: [] }];
}

export function getScaledA4(scale: number) {
  return { width: A4_WIDTH * scale, height: A4_HEIGHT * scale };
}

export function getContentHeight(margin: number): number {
  return A4_HEIGHT - margin * 2;
}
