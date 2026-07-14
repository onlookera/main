# DocMaster API 接口文档

> 完整 Swagger UI 文档：启动后端后访问 http://127.0.0.1:8000/docs

---

## 接口概览

| 方法 | 端点 | 说明 |
|------|------|------|
| `POST` | `/api/upload` | 上传文件 |
| `POST` | `/api/convert` | 启动转换 |
| `GET` | `/api/status/{task_id}` | 查询进度 |
| `GET` | `/api/download/{task_id}` | 下载结果 |
| `DELETE` | `/api/files/{task_id}` | 清理文件 |
| `GET` | `/health` | 健康检查 |

---

## 1. 文件上传

**请求:**
```
POST /api/upload
Content-Type: multipart/form-data

file: <binary>
```

**响应 (200):**
```json
{
  "task_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "filename": "报告.pdf",
  "size": 2048576
}
```

**错误 (400):**
```json
{
  "detail": "不支持的文件格式，请上传 PDF/Word/PPT 文件"
}
```

---

## 2. 启动转换

**请求:**
```
POST /api/convert
Content-Type: application/json

{
  "task_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "conversion_type": "pdf_to_word"
}
```

**conversion_type 可选值:**
| 值 | 说明 |
|----|------|
| `pdf_to_word` | PDF → Word |
| `pdf_to_ppt` | PDF → PPT |
| `word_to_pdf` | Word → PDF |
| `ppt_to_pdf` | PPT → PDF |
| `ppt_to_word` | PPT → Word |
| `pdf_split` | PDF 拆分 |

---

## 3. 查询进度

**请求:**
```
GET /api/status/{task_id}
```

**响应 (进行中):**
```json
{
  "task_id": "a1b2c3d4-...",
  "status": "processing",
  "progress": 45,
  "filename": "报告.pdf",
  "conversion_type": "pdf_to_word",
  "output_filename": null,
  "error_message": null,
  "created_at": "2026-07-14T14:30:00+00:00"
}
```

**响应 (完成):**
```json
{
  "task_id": "a1b2c3d4-...",
  "status": "completed",
  "progress": 100,
  "filename": "报告.pdf",
  "conversion_type": "pdf_to_word",
  "output_filename": "报告_已转换.docx",
  "error_message": null,
  "created_at": "2026-07-14T14:30:00+00:00"
}
```

---

## 4. 下载文件

**请求:**
```
GET /api/download/{task_id}
```

**响应:** 二进制文件流，`Content-Disposition: attachment`

---

## 5. 清理文件

**请求:**
```
DELETE /api/files/{task_id}
```

**响应:**
```json
{
  "task_id": "a1b2c3d4-...",
  "cleaned": true,
  "message": "已清理完成"
}
```
