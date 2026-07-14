# DocMaster — 多功能文档格式转换工具

<div align="center">

![DocMaster](https://img.shields.io/badge/DocMaster-v1.0-4F46E5)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?logo=fastapi)
![Python](https://img.shields.io/badge/Python-3.10+-3776AB?logo=python)

**支持 PDF、Word、PPT 之间相互转换的企业级 Web 应用**

[功能](#-功能) · [快速开始](#-快速开始) · [API 文档](#-api-文档) · [技术栈](#-技术栈)

</div>

---

## 📋 功能

### 核心转换
| 转换方向 | 说明 | 状态 |
|----------|------|------|
| **PDF → Word** | 保留原始排版、表格和图片，高还原度 | ✅ |
| **PDF → PPT** | PDF 每页转为 PPT 幻灯片 | ✅ |
| **Word → PDF** | 直接转换（需 LibreOffice / Windows COM） | ✅ |
| **PPT → PDF** | 演示文稿转 PDF（需 LibreOffice / Windows COM） | ✅ |
| **PPT → Word** | 提取 PPT 文本生成 Word 文档 | ✅ |

### 增值功能
- **PDF 拆分** — 将 PDF 按页拆分为多个独立文件
- **拖拽上传** — 支持 Drag & Drop，上传实时进度条
- **转换进度** — 实时百分比进度展示
- **历史记录** — 自动保存转换历史，支持一键清空
- **一键下载** — 转换完成后直接下载

---

## 🚀 快速开始

### 环境要求

| 工具 | 版本要求 |
|------|----------|
| Node.js | ≥ 18.0 |
| Python | ≥ 3.10 |
| (可选) LibreOffice | 最新稳定版 |

### 一、后端启动

```bash
# 进入后端目录
cd backend

# 创建虚拟环境（推荐）
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # macOS/Linux

# 安装依赖
pip install -r requirements.txt

# 启动服务（默认 http://127.0.0.1:8000）
python run.py
```

启动成功后访问：
- **API 文档 (Swagger)**: http://127.0.0.1:8000/docs
- **健康检查**: http://127.0.0.1:8000/health

### 二、前端启动

```bash
# 进入前端目录
cd frontend

# 安装依赖
npm install

# 启动开发服务器（默认 http://localhost:5173）
npm run dev
```

前端开发服务器已配置 API 代理，会自动将 `/api/*` 请求转发到后端 `http://127.0.0.1:8000`。

### 三、打开浏览器

访问 **http://localhost:5173** 即可使用 DocMaster。

---

## 📡 API 文档

| 方法 | 端点 | 说明 |
|------|------|------|
| `POST` | `/api/upload` | 上传文件，返回 `task_id` |
| `POST` | `/api/convert` | 发起转换任务 |
| `GET` | `/api/status/{task_id}` | 查询转换进度 |
| `GET` | `/api/download/{task_id}` | 下载转换结果 |
| `DELETE` | `/api/files/{task_id}` | 清理临时文件 |
| `GET` | `/health` | 健康检查 |

详细接口文档请启动后端后访问：http://127.0.0.1:8000/docs

---

## 🛠 技术栈

### 前端
- **React 18** + TypeScript — UI 框架
- **Vite 5** — 构建工具（极速 HMR）
- **Ant Design 5** — 企业级 UI 组件库
- **Axios** — HTTP 请求库

### 后端
- **FastAPI** — 高性能异步 Web 框架
- **Uvicorn** — ASGI 服务器
- **pdf2docx** — PDF → Word 核心引擎
- **PyMuPDF (fitz)** — PDF 高清渲染 → PPT
- **python-pptx** — PPT 生成与读取
- **python-docx** — Word 文档生成
- **pypdf** — PDF 合并/拆分
- **Pillow** — 图片处理

### 架构
```
┌──────────────┐     HTTP/Axios     ┌──────────────┐
│   Frontend   │ ◄──────────────► │   Backend    │
│  React+Vite  │    REST API       │   FastAPI    │
│  :5173       │                   │   :8000      │
└──────────────┘                   └──────┬───────┘
                                          │
                                   ┌──────▼───────┐
                                   │  Conversion  │
                                   │  Services    │
                                   │  (Python)    │
                                   └──────────────┘
```

---

## 📁 项目结构

```
formatconverter/
├── frontend/                # React + Vite 前端
│   ├── src/
│   │   ├── components/      # UI 组件
│   │   │   ├── FileUploader/ # 拖拽上传
│   │   │   ├── ConversionPanel/ # 格式选择
│   │   │   ├── ProgressBar/ # 进度条
│   │   │   ├── DownloadArea/ # 下载区域
│   │   │   ├── HistoryList/ # 历史记录
│   │   │   └── Layout/      # 页面布局
│   │   ├── pages/Home/      # 首页
│   │   ├── services/        # API 调用
│   │   └── types/           # 类型定义
│   └── ...
├── backend/                 # FastAPI 后端
│   ├── app/
│   │   ├── api/             # API 路由
│   │   ├── services/        # 转换服务
│   │   ├── models/          # 数据模型
│   │   ├── tasks/           # 任务管理
│   │   └── utils/           # 工具函数
│   ├── uploads/             # 上传文件
│   └── outputs/             # 输出文件
├── docs/                    # 文档
└── README.md
```

---

## ⚠️ 注意事项

1. **Word → PDF** 和 **PPT → PDF** 转换需要 LibreOffice 安装在系统中，或 Windows 下的 Microsoft Office。
   - 下载 LibreOffice: https://www.libreoffice.org/download/
2. PDF 文件如果已加密，需要先解密再上传。
3. 单文件上传大小限制 2GB。
4. 临时文件在 24 小时后自动清理。

---

## 📄 License

MIT License — 仅供学习和内部使用。
