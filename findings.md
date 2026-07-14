# Findings & Decisions

## Requirements
- PDF 转 Word (.docx) —— 排版尽量还原
- PDF 转 PPT (.pptx) —— 每页转幻灯片
- Word 转 PDF —— 直接转换
- PPT 转 PDF —— 直接转换
- PPT 转 Word —— 提取文本生成 Word
- PDF 合并/拆分 —— 增值功能
- 拖拽上传文件（Drag & Drop）
- 显示上传进度和转换进度（百分比进度条）
- 一键下载生成文档
- 历史转换记录查看和清空
- 极简企业级风格 UI，适配移动端和 PC 端
- 异常处理（文件过大、格式不支持、转换失败等友好提示）

## Research Findings
<!-- 等待 deep-research 结果填充 -->

## Technical Decisions
| Decision | Rationale |
|----------|-----------|
| React + Vite + Ant Design 5 | 文档推荐，Ant Design 提供企业级 UI 组件，Vite 构建快 |
| FastAPI + Uvicorn | 文档推荐，高性能异步框架 |
| pdf2docx | PDF 转 Word 的最佳 Python 库 |
| python-pptx | PPT 操作的标准库 |
| pypdf (PyPDF2 继任者) | PDF 合并/拆分，PyPDF2 已停止维护 |
| Axios | 前端 HTTP 请求库，支持进度回调 |
| asyncio 后台任务 | 原型阶段避免 Celery + Redis 的复杂度 |

## Issues Encountered
| Issue | Resolution |
|-------|------------|
|       |            |

## Resources
- 开发文档：e:\自由开发区\formatconverter\开发文档.txt
- FastAPI 官方文档：https://fastapi.tiangolo.com/
- Ant Design 5 文档：https://ant.design/
- pdf2docx PyPI：https://pypi.org/project/pdf2docx/
- python-pptx 文档：https://python-pptx.readthedocs.io/

## Visual/Browser Findings

---
*Update this file after every 2 view/browser/search operations*
*This prevents visual information from being lost*
