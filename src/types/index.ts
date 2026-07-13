// ============ 简历主数据结构 ============

export type ModuleType =
  | 'personal-info'
  | 'summary'
  | 'experience'
  | 'education'
  | 'skills'
  | 'projects'
  | 'certifications'
  | 'languages'
  | 'custom';

export type LayoutType = 'single' | 'two-column' | 'sidebar-left' | 'sidebar-right' | 'timeline' | 'photo-top' | 'photo-hero';

export type PhotoShape = 'circle' | 'rounded' | 'square';
export type PhotoSize = 'small' | 'medium' | 'large' | 'xlarge';

export interface GlobalSettings {
  primaryColor: string;
  backgroundColor: string;
  fontFamily: string;
  fontSize: number;
  margin: number;
  sectionSpacing: number;
  showPageNumbers: boolean;
}

export type ModuleSection = 'sidebar' | 'main' | 'auto';

export interface Module {
  id: string;
  type: ModuleType;
  title: string;
  visible: boolean;
  order: number;
  section: ModuleSection;
  data: Record<string, any>;
}

export interface Resume {
  id: string;
  name: string;
  templateId: string;
  globalSettings: GlobalSettings;
  modules: Module[];
  createdAt: string;
  updatedAt: string;
}

// ============ 各模块 data 接口 ============

export interface PersonalInfoData {
  fullName: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  linkedin: string;
  github: string;
  avatar: string;         // base64
  photoSize: PhotoSize;   // 照片尺寸
  photoShape: PhotoShape; // 照片形状
  showPhoto: boolean;     // 是否显示照片
}

export interface SummaryData {
  content: string;
}

export interface ListEntry {
  id: string;
  title: string;
  subtitle: string;
  startDate: string;
  endDate: string;
  current: boolean;
  location: string;
  description: string;
}

export interface ListModuleData {
  entries: ListEntry[];
}

export interface SkillItem {
  id: string;
  name: string;
  level: number;
}

export interface SkillsData {
  skills: SkillItem[];
  displayMode: 'tags' | 'bars' | 'dots';
}

export interface LanguageItem {
  id: string;
  name: string;
  proficiency: string;
}

export interface LanguagesData {
  languages: LanguageItem[];
}

export interface CustomData {
  content: string;
}

// ============ 照片尺寸映射（宽度，高度=宽度*4/3竖版比例） ============
export const PHOTO_SIZE_MAP: Record<PhotoSize, { width: number; height: number }> = {
  small:  { width: 80,  height: 107 },
  medium: { width: 100, height: 133 },
  large:  { width: 120, height: 160 },
  xlarge: { width: 140, height: 187 },
};

export const PHOTO_SIZE_LABELS: Record<PhotoSize, string> = {
  small: '小 (80×107)',
  medium: '中 (100×133)',
  large: '大 (120×160)',
  xlarge: '特大 (140×187)',
};

export const PHOTO_SHAPE_STYLE: Record<PhotoShape, string> = {
  circle: '50%',
  rounded: '12px',
  square: '4px',
};

// ============ 模板数据 ============

export interface Template {
  id: string;
  name: string;
  description: string;
  layout: LayoutType;
  thumbnail: string;
  defaultGlobalSettings: GlobalSettings;
  defaultModules: Module[];
}

// ============ Context Action ============

export type ResumeAction =
  | { type: 'SET_RESUME'; payload: Resume }
  | { type: 'UPDATE_MODULE'; payload: { moduleId: string; data: Record<string, any> } }
  | { type: 'UPDATE_MODULE_TITLE'; payload: { moduleId: string; title: string } }
  | { type: 'ADD_MODULE'; payload: Module }
  | { type: 'DELETE_MODULE'; payload: { moduleId: string } }
  | { type: 'TOGGLE_MODULE_VISIBILITY'; payload: { moduleId: string } }
  | { type: 'REORDER_MODULES'; payload: { modules: Module[] } }
  | { type: 'UPDATE_GLOBAL_SETTINGS'; payload: Partial<GlobalSettings> }
  | { type: 'SET_SELECTED_MODULE'; payload: { moduleId: string | null } }
  | { type: 'APPLY_TEMPLATE'; payload: { template: Template; keepContent: boolean } }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'RESET_STYLES'; payload: { globalSettings: GlobalSettings } }
  | { type: 'SET_SCALE'; payload: { scale: number } };

export interface ResumeState {
  resume: Resume | null;
  selectedModuleId: string | null;
  history: { past: Resume[]; future: Resume[] };
  scale: number;
  isDirty: boolean;
}

// ============ 字体选项 ============

export interface FontOption {
  name: string;
  family: string;
  category: 'sans' | 'serif' | 'mono';
}

export const FONT_OPTIONS: FontOption[] = [
  { name: 'Inter (现代无衬线)', family: "'Inter', 'Noto Sans SC', sans-serif", category: 'sans' },
  { name: '思源黑体', family: "'Noto Sans SC', sans-serif", category: 'sans' },
  { name: 'Poppins (圆润无衬线)', family: "'Poppins', 'Noto Sans SC', sans-serif", category: 'sans' },
  { name: 'Roboto (经典无衬线)', family: "'Roboto', 'Noto Sans SC', sans-serif", category: 'sans' },
  { name: 'Merriweather (优雅衬线)', family: "'Merriweather', 'Noto Serif SC', serif", category: 'serif' },
  { name: '思源宋体 (中式典雅)', family: "'Noto Serif SC', serif", category: 'serif' },
  { name: 'Lora (现代衬线)', family: "'Lora', 'Noto Serif SC', serif", category: 'serif' },
  { name: 'JetBrains Mono (等宽)', family: "'JetBrains Mono', monospace", category: 'mono' },
];

// ============ 颜色预设 ============

export interface ColorPreset {
  name: string;
  primary: string;
  background: string;
  accent?: string;
}

export const COLOR_PRESETS: ColorPreset[] = [
  { name: '深海蓝', primary: '#1a365d', background: '#ffffff', accent: '#3182ce' },
  { name: '商务黑', primary: '#1a1a2e', background: '#fafafa', accent: '#4a5568' },
  { name: '墨玉绿', primary: '#1a3c34', background: '#ffffff', accent: '#2d6a4f' },
  { name: '典雅紫', primary: '#44337a', background: '#faf5ff', accent: '#805ad5' },
  { name: '沉稳棕', primary: '#3e2723', background: '#ffffff', accent: '#795548' },
  { name: '科技青', primary: '#065666', background: '#f0f9ff', accent: '#0891b2' },
  { name: '酒红金', primary: '#742a2a', background: '#fff1f2', accent: '#c53030' },
  { name: '极简灰', primary: '#2d3748', background: '#ffffff', accent: '#718096' },
  { name: '清新蓝', primary: '#2563eb', background: '#ffffff', accent: '#60a5fa' },
  { name: '温暖橙', primary: '#9a3412', background: '#ffffff', accent: '#ea580c' },
];
