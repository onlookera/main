import { Template, Module, PhotoSize, PhotoShape } from '../types';

const uid = (): string => Math.random().toString(36).substring(2, 10);
const modId = (type: string): string => `${type}_${uid()}`;

// ============ 默认模块工厂 ============

const makePersonalInfo = (order: number, overrides?: Partial<{ photoSize: PhotoSize; photoShape: PhotoShape }>): Module => ({
  id: modId('personal-info'),
  type: 'personal-info',
  title: '个人信息',
  visible: true,
  section: 'auto',
  order,
  data: {
    fullName: '张三',
    title: '高级前端工程师',
    email: 'zhangsan@example.com',
    phone: '138-0000-0000',
    location: '北京市',
    website: 'zhangsan.dev',
    linkedin: 'linkedin.com/in/zhangsan',
    github: 'github.com/zhangsan',
    avatar: '',
    photoSize: overrides?.photoSize || 'medium',
    photoShape: overrides?.photoShape || 'rounded',
    showPhoto: true,
  },
});

const makeSummary = (order: number): Module => ({
  id: modId('summary'),
  type: 'summary',
  title: '个人简介',
  visible: true,
  section: 'auto',
  order,
  data: {
    content: '拥有8年前端开发经验的资深工程师，专注于React生态系统和Web性能优化。擅长构建大型单页应用，具备良好的产品思维和团队协作能力。曾主导多个千万级用户项目的架构设计和开发。',
  },
});

const makeExperience = (order: number): Module => ({
  id: modId('experience'),
  type: 'experience',
  title: '工作经历',
  visible: true,
  section: 'auto',
  order,
  data: {
    entries: [
      {
        id: uid(), title: '字节跳动', subtitle: '高级前端工程师',
        startDate: '2020-03', endDate: '', current: true, location: '北京',
        description: '• 主导抖音Web版前端架构重构，采用React+TypeScript技术栈\n• 核心指标首屏加载时间从3.2s优化至1.1s\n• 设计实现通用组件库，覆盖50+业务场景，npm周下载量2万+\n• 指导5名初中级工程师，建立团队Code Review流程',
      },
      {
        id: uid(), title: '阿里巴巴', subtitle: '前端开发工程师',
        startDate: '2017-07', endDate: '2020-02', current: false, location: '杭州',
        description: '• 负责淘宝商家后台管理系统前端开发\n• React+Redux重构订单管理模块，性能提升60%\n• 参与双11大促活动页面开发，峰值QPS达50万\n• 获得年度最佳新人奖',
      },
    ],
  },
});

const makeEducation = (order: number): Module => ({
  id: modId('education'),
  type: 'education',
  title: '教育背景',
  visible: true,
  section: 'auto',
  order,
  data: {
    entries: [
      {
        id: uid(), title: '清华大学', subtitle: '计算机科学与技术 · 硕士',
        startDate: '2015-09', endDate: '2017-06', current: false, location: '北京',
        description: '• 研究方向：Web前端性能优化\n• 发表SCI论文2篇\n• 获国家奖学金',
      },
      {
        id: uid(), title: '浙江大学', subtitle: '软件工程 · 学士',
        startDate: '2011-09', endDate: '2015-06', current: false, location: '杭州',
        description: '• GPA: 3.8/4.0，专业排名前5%\n• ACM程序设计竞赛银牌',
      },
    ],
  },
});

const makeSkills = (order: number, displayMode: 'tags' | 'bars' | 'dots' = 'bars'): Module => ({
  id: modId('skills'),
  type: 'skills',
  title: '专业技能',
  visible: true,
  section: 'auto',
  order,
  data: {
    skills: [
      { id: uid(), name: 'React / Vue.js', level: 5 },
      { id: uid(), name: 'TypeScript', level: 5 },
      { id: uid(), name: 'Node.js', level: 4 },
      { id: uid(), name: 'Webpack / Vite', level: 4 },
      { id: uid(), name: 'CSS / Tailwind', level: 5 },
      { id: uid(), name: 'Docker / K8s', level: 3 },
      { id: uid(), name: 'AWS / Cloud', level: 3 },
      { id: uid(), name: 'GraphQL', level: 3 },
      { id: uid(), name: 'Git / CI/CD', level: 4 },
      { id: uid(), name: 'Agile / Scrum', level: 4 },
    ],
    displayMode,
  },
});

const makeProjects = (order: number): Module => ({
  id: modId('projects'),
  type: 'projects',
  title: '项目经验',
  visible: true,
  section: 'auto',
  order,
  data: {
    entries: [
      {
        id: uid(), title: '开源组件库 ZenUI', subtitle: '项目发起人 & 核心维护者',
        startDate: '2021-01', endDate: '', current: true, location: '',
        description: '• GitHub 5k+ Stars，基于React+TypeScript的企业级UI组件库\n• 提供60+高质量组件，支持主题定制和国际化\n• npm周下载量2万+，被30+企业项目采用',
      },
      {
        id: uid(), title: '实时数据可视化平台', subtitle: '技术负责人',
        startDate: '2019-06', endDate: '2020-12', current: false, location: '',
        description: '• D3.js+Canvas实现百万级数据点实时渲染\n• WebSocket数据推送延迟<100ms\n• 服务20+业务线，日均活跃用户3000+',
      },
    ],
  },
});

const makeCertifications = (order: number): Module => ({
  id: modId('certifications'),
  type: 'certifications',
  title: '证书与荣誉',
  visible: false,
  section: 'auto',
  order,
  data: {
    entries: [
      { id: uid(), title: 'AWS Solutions Architect Professional', subtitle: 'Amazon Web Services', startDate: '2022-06', endDate: '', current: false, location: '', description: '' },
      { id: uid(), title: 'PMP项目管理认证', subtitle: 'PMI', startDate: '2021-03', endDate: '', current: false, location: '', description: '' },
    ],
  },
});

const makeLanguages = (order: number): Module => ({
  id: modId('languages'),
  type: 'languages',
  title: '语言能力',
  visible: true,
  section: 'auto',
  order,
  data: {
    languages: [
      { id: uid(), name: '中文', proficiency: '母语' },
      { id: uid(), name: '英语', proficiency: '流利 (CET-6)' },
      { id: uid(), name: '日语', proficiency: '基础' },
    ],
  },
});

// ============ 完整模块列表 ============
const defaultModulesList = (photoSize?: PhotoSize, photoShape?: PhotoShape): Module[] => {
  let o = 0;
  return [
    makePersonalInfo(o++, { photoSize, photoShape }),
    makeSummary(o++),
    makeExperience(o++),
    makeEducation(o++),
    makeSkills(o++, 'bars'),
    makeProjects(o++),
    makeCertifications(o++),
    makeLanguages(o++),
  ];
};

// ============ 8套专业简历模板 ============

export const TEMPLATES: Template[] = [
  // ===== 1. 经典双栏 =====
  {
    id: 'classic-two-column',
    name: '经典双栏',
    description: '左侧深色栏放照片+技能，右侧放经历。HR最熟悉的布局，专业稳重',
    layout: 'sidebar-left',
    thumbnail: '📄',
    defaultGlobalSettings: {
      primaryColor: '#1a365d',
      backgroundColor: '#ffffff',
      fontFamily: "'Inter', 'Noto Sans SC', sans-serif",
      fontSize: 14,
      margin: 44,
      sectionSpacing: 10,
      showPageNumbers: false,
    },
    defaultModules: defaultModulesList('medium', 'rounded'),
  },

  // ===== 2. 极简单栏 =====
  {
    id: 'minimal-single',
    name: '极简单栏',
    description: '上排照片+姓名，下方单栏内容区。适合学术/教育/传统行业',
    layout: 'single',
    thumbnail: '📝',
    defaultGlobalSettings: {
      primaryColor: '#2d3748',
      backgroundColor: '#ffffff',
      fontFamily: "'Noto Sans SC', sans-serif",
      fontSize: 14,
      margin: 56,
      sectionSpacing: 12,
      showPageNumbers: true,
    },
    defaultModules: defaultModulesList('medium', 'circle'),
  },

  // ===== 3. 创意时间轴 =====
  {
    id: 'creative-timeline',
    name: '创意时间轴',
    description: '左侧时间轴+圆形照片，适合设计/创意/互联网行业',
    layout: 'timeline',
    thumbnail: '🎨',
    defaultGlobalSettings: {
      primaryColor: '#44337a',
      backgroundColor: '#faf5ff',
      fontFamily: "'Poppins', 'Noto Sans SC', sans-serif",
      fontSize: 14,
      margin: 48,
      sectionSpacing: 10,
      showPageNumbers: false,
    },
    defaultModules: defaultModulesList('large', 'circle'),
  },

  // ===== 4. 专业侧边栏 =====
  {
    id: 'professional-sidebar',
    name: '专业侧边栏',
    description: '右侧深色侧边栏展示照片+技能，视觉对比强烈，现代商务风',
    layout: 'sidebar-right',
    thumbnail: '💼',
    defaultGlobalSettings: {
      primaryColor: '#1a1a2e',
      backgroundColor: '#fafafa',
      fontFamily: "'Inter', 'Noto Sans SC', sans-serif",
      fontSize: 14,
      margin: 44,
      sectionSpacing: 10,
      showPageNumbers: false,
    },
    defaultModules: defaultModulesList('medium', 'square'),
  },

  // ===== 5. 典雅衬线 =====
  {
    id: 'elegant-serif',
    name: '典雅衬线',
    description: '衬线字体+大边距，优雅排版。适合法律/金融/出版行业',
    layout: 'single',
    thumbnail: '📋',
    defaultGlobalSettings: {
      primaryColor: '#3e2723',
      backgroundColor: '#ffffff',
      fontFamily: "'Merriweather', 'Noto Serif SC', serif",
      fontSize: 13,
      margin: 60,
      sectionSpacing: 14,
      showPageNumbers: true,
    },
    defaultModules: defaultModulesList('small', 'rounded'),
  },

  // ===== 6. 大头照商务版 🆕 =====
  {
    id: 'photo-professional',
    name: '大头照商务版',
    description: '左大右小的双栏布局，左侧大尺寸照片+个人信息，右侧展示全部经历，视觉重点突出',
    layout: 'sidebar-left',
    thumbnail: '👔',
    defaultGlobalSettings: {
      primaryColor: '#1a365d',
      backgroundColor: '#ffffff',
      fontFamily: "'Inter', 'Noto Sans SC', sans-serif",
      fontSize: 14,
      margin: 40,
      sectionSpacing: 10,
      showPageNumbers: false,
    },
    defaultModules: defaultModulesList('xlarge', 'rounded'),
  },

  // ===== 7. 照片顶栏版 🆕 =====
  {
    id: 'photo-hero',
    name: '照片顶栏版',
    description: '顶部大横幅姓名+大照片，下方双栏内容。类似LinkedIn风格，现代醒目',
    layout: 'photo-hero',
    thumbnail: '🌟',
    defaultGlobalSettings: {
      primaryColor: '#065666',
      backgroundColor: '#ffffff',
      fontFamily: "'Poppins', 'Noto Sans SC', sans-serif",
      fontSize: 14,
      margin: 44,
      sectionSpacing: 10,
      showPageNumbers: true,
    },
    defaultModules: defaultModulesList('large', 'circle'),
  },

  // ===== 8. 创意头像版 🆕 =====
  {
    id: 'creative-photo',
    name: '创意头像版',
    description: '彩色顶栏+大尺寸方形照片，交错排版，视觉冲击力强，适合设计/媒体行业',
    layout: 'photo-top',
    thumbnail: '🎯',
    defaultGlobalSettings: {
      primaryColor: '#742a2a',
      backgroundColor: '#fff1f2',
      fontFamily: "'Poppins', 'Noto Sans SC', sans-serif",
      fontSize: 14,
      margin: 36,
      sectionSpacing: 10,
      showPageNumbers: false,
    },
    defaultModules: defaultModulesList('xlarge', 'square'),
  },
];

export const getTemplateById = (id: string): Template | undefined =>
  TEMPLATES.find((t) => t.id === id);

export const createNewResume = (templateId: string): import('../types').Resume => {
  const template = getTemplateById(templateId) || TEMPLATES[0];
  return {
    id: `resume_${uid()}`,
    name: '未命名简历',
    templateId: template.id,
    globalSettings: { ...template.defaultGlobalSettings },
    modules: template.defaultModules.map((m, i) => ({
      ...m,
      data: { ...m.data },
      id: `${m.type}_${uid()}`,
      order: i,
    })),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};
