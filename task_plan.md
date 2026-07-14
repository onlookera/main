# Task Plan: DocMaster 多功能文档格式转换网站

## Goal
开发一个支持 PDF、Word、PPT 之间相互转换的企业级 Web 网站，前后端分离架构（React + FastAPI），功能全面、界面现代、处理速度快。

## Current Phase
Phase 5 - 代码审查与优化

## Phases

### Phase 1: 前期调研与规划
- [x] 调研 PDF/Word/PPT 转换最佳 Python 开源库
- [x] 确认核心依赖库版本与安装命令
- [x] 生成完整项目目录结构
- [x] 记录调研结果到 findings.md
- **Status:** complete

### Phase 2: 前端架构与 UI 构建
- [x] 初始化 React + Vite + Ant Design 项目
- [x] 构建静态原型页面（文件选择器、拖拽上传、转换按钮、进度条、下载区）
- [x] 实现历史记录查看和清空功能
- [x] 适配移动端响应式布局
- [x] 确认前端可独立构建 (vite build OK, tsc zero errors)
- **Status:** complete

### Phase 3: 后端核心业务开发
- [x] 初始化 FastAPI 项目结构
- [x] 实现文件上传接口 POST /api/upload
- [x] 实现转换接口 POST /api/convert
- [x] 实现进度查询 GET /api/status/{task_id}
- [x] 实现文件下载 GET /api/download/{task_id}
- [x] 实现文件清理 DELETE /api/files/{task_id}
- [x] 实现 PDF 转 Word 核心逻辑
- [x] 实现 PDF 转 PPT 核心逻辑
- [x] 实现 Word 转 PDF 核心逻辑
- [x] 实现 PPT 转 PDF 核心逻辑
- [x] 实现 PPT 转 Word 核心逻辑
- [x] 实现 PDF 合并/拆分功能
- [x] 实现异步任务队列
- [x] 本地启动后端服务并通过健康检查
- **Status:** complete

### Phase 4: 项目配置与文档
- [x] 创建 README.md
- [x] 创建 .gitignore
- [x] 创建 API 文档
- **Status:** complete

### Phase 5: 优化与代码审查
- [ ] 使用 code-review 技能全局审查代码 (进行中)
- [ ] 修复审查发现的问题
- [ ] 最终验证
- **Status:** in_progress

## Key Questions
1. ~~各转换库在 Windows 环境下的兼容性如何？~~ → 已验证，py -3 使用正常
2. ~~异步任务队列选择 asyncio 还是 Celery？~~ → 使用 FastAPI BackgroundTasks + 线程安全 TaskManager
3. Word→PDF / PPT→PDF 需要 LibreOffice 或 Windows COM，已提供 fallback 方案

## Decisions Made
| Decision | Rationale |
|----------|-----------|
| 前后端分离架构 | 开发文档要求，便于独立部署和维护 |
| React + Vite + Ant Design 5 | 文档推荐，Ant Design 提供企业级 UI 组件 |
| Python + FastAPI + BackgroundTasks | 原型阶段避免 Celery/Redis 复杂度 |
| pdf2docx + PyMuPDF | PDF 转换核心引擎，排版还原度最高 |
| 内存 TaskManager 字典 | 单服务器低负载原型，生产可换 Redis |
| 渐变边框拖拽动画 | 签名元素，传达"精密仪器"品牌感 |

## Errors Encountered
| Error | Attempt | Resolution |
|-------|---------|------------|
| TS2353: onDragEnter not in UploadProps | 1 | 改用原生 DOM 事件处理拖拽 |
| JSX structure broken by Edit | 2 | 重写整个 FileUploader 组件 |
| pip not found in bash | 1 | 使用 py -3 -m pip |

## Notes
- 开发环境：Windows 11，VSCode
- 后端运行在 http://127.0.0.1:8000
- 前端运行在 http://localhost:5173
- API 文档 (Swagger): http://127.0.0.1:8000/docs
