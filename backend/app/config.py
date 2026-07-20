"""
智能 RAG 知识库 — 配置文件
所有配置项从环境变量或 .env 文件加载，提供合理的默认值。
注意：严禁删除或重命名现有配置项，只能新增。
"""

import os
from pathlib import Path

# ============================================================
# API 安全
# ============================================================

# API Key 鉴权密钥（从环境变量 RAG_API_KEY 加载，默认值仅用于本地开发）
API_KEY: str = os.getenv("RAG_API_KEY", "rag-dev-key-change-me")

# ============================================================
# DeepSeek 模型配置
# ============================================================

# 嵌入模型（用于文本向量化，输出 512 维向量）
EMBEDDING_MODEL: str = os.getenv("RAG_EMBEDDING_MODEL", "deepseek-embedding")

# 对话模型（用于问答生成）
LLM_MODEL: str = os.getenv("RAG_LLM_MODEL", "deepseek-chat")

# DeepSeek API 地址与密钥
DEEPSEEK_API_KEY: str = os.getenv("DEEPSEEK_API_KEY", "")
DEEPSEEK_API_BASE: str = os.getenv("DEEPSEEK_API_BASE", "https://api.deepseek.com/v1")

# ============================================================
# 文档分块参数（写死，不可更改默认值）
# ============================================================

# 每个文本块的最大字符数
CHUNK_SIZE: int = 512

# 相邻文本块之间的重叠字符数（防止上下文在句子边界被截断）
CHUNK_OVERLAP: int = 128

# 分块分隔符（按优先级从高到低排列）
# 设计理由："\n\n" 优先分隔段落，"\n" 分隔行，"。" "！" "？" 分隔中文句子
CHUNK_SEPARATORS: list = ["\n\n", "\n", "。", "！", "？", "；", " ", ""]

# ============================================================
# ChromaDB 向量数据库
# ============================================================

# 持久化存储目录（绝对不可动内部结构）
CHROMA_PERSIST_DIR: str = os.getenv(
    "CHROMA_PERSIST_DIR",
    str(Path(__file__).resolve().parent / "chroma_data")
)

# Collection 名称（绝对不可修改）
COLLECTION_NAME: str = "doc_master"

# ============================================================
# 混合检索权重（固定，不可修改默认值）
# ============================================================

# 向量检索权重（语义理解）
VECTOR_WEIGHT: float = 0.7

# 关键词检索权重（BM25，长尾词汇命中）
KEYWORD_WEIGHT: float = 0.3

# ============================================================
# 文件上传与清理
# ============================================================

# 临时上传文件存储目录
TEMP_UPLOAD_DIR: str = os.getenv("RAG_TEMP_UPLOAD_DIR", "/tmp/doc_uploads")

# 定时清理间隔（分钟）
CLEANUP_INTERVAL_MINUTES: int = 30

# 临时文件最大保留时间（分钟）
FILE_MAX_AGE_MINUTES: int = 60
