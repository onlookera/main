/**
 * 智能 RAG 知识库 — 主页面
 * 左侧：文档上传与管理区
 * 右侧：问答对话区
 */

import React, { useState, useCallback } from 'react';
import {
  Typography, Card, Space, Input, Button, List, Tag, Divider,
  message, Spin, Empty, Alert, Tabs,
} from 'antd';
import {
  SendOutlined, UploadOutlined, DeleteOutlined,
  RobotOutlined, FileTextOutlined, InboxOutlined,
} from '@ant-design/icons';
import axios from 'axios';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

// 从环境变量或默认值获取 API Base URL
const API_BASE = (import.meta as any).env?.VITE_API_BASE || '/api/v1';

/** 创建带 API Key 的 Axios 实例 */
const ragApi = axios.create({
  baseURL: API_BASE,
  timeout: 600000,
  headers: {
    'x-api-key': localStorage.getItem('rag_api_key') || 'rag-dev-key-change-me',
  },
});

interface DocInfo {
  document_id: string;
  source: string;
  chunks_count: number;
  uploaded_at: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  sources?: { content: string; source: string; score: number }[];
}

const RAGPage: React.FC = () => {
  // 文档管理状态
  const [docs, setDocs] = useState<DocInfo[]>([]);
  const [docsLoading, setDocsLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // 对话状态
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [question, setQuestion] = useState('');
  const [asking, setAsking] = useState(false);
  const [topK, setTopK] = useState(5);

  // API Key
  const [apiKey, setApiKey] = useState(
    localStorage.getItem('rag_api_key') || 'rag-dev-key-change-me'
  );

  /** 保存 API Key */
  const saveApiKey = useCallback((key: string) => {
    setApiKey(key);
    localStorage.setItem('rag_api_key', key);
    ragApi.defaults.headers['x-api-key'] = key;
  }, []);

  /** 刷新文档列表 */
  const refreshDocs = useCallback(async () => {
    setDocsLoading(true);
    try {
      const { data } = await ragApi.get('/documents');
      setDocs(data.documents || []);
    } catch (err: any) {
      const detail = err?.response?.data?.detail || err.message;
      if (err?.response?.status === 403) {
        message.warning('API Key 无效，请在顶部设置中修改');
      } else {
        message.error('获取文档列表失败: ' + detail);
      }
    } finally {
      setDocsLoading(false);
    }
  }, []);

  /** 上传文档 */
  const handleUpload = useCallback(async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await ragApi.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      message.success(`文档 "${file.name}" 上传成功，共 ${data.chunks_count} 个文本块`);
      refreshDocs();
    } catch (err: any) {
      const detail = err?.response?.data?.detail || err.message;
      message.error('上传失败: ' + detail);
    } finally {
      setUploading(false);
    }
  }, [refreshDocs]);

  /** 删除文档 */
  const handleDelete = useCallback(async (docId: string) => {
    try {
      await ragApi.delete(`/documents/${docId}`);
      message.success('文档已删除');
      refreshDocs();
    } catch (err: any) {
      message.error('删除失败: ' + (err?.response?.data?.detail || err.message));
    }
  }, [refreshDocs]);

  /** 提问 */
  const handleAsk = useCallback(async () => {
    if (!question.trim()) return;

    const userMsg: ChatMessage = { role: 'user', content: question };
    setMessages((prev) => [...prev, userMsg]);
    setQuestion('');
    setAsking(true);

    try {
      const { data } = await ragApi.post('/query', { question: userMsg.content, top_k: topK });
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.answer, sources: data.sources },
      ]);
    } catch (err: any) {
      const detail = err?.response?.data?.detail || err.message;
      message.error('问答失败: ' + detail);
    } finally {
      setAsking(false);
    }
  }, [question, topK]);

  // 首次加载文档列表
  React.useEffect(() => {
    refreshDocs();
  }, [refreshDocs]);

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '16px 0' }}>
      <Title level={3} style={{ fontWeight: 700 }}>
        <RobotOutlined style={{ color: '#4F46E5', marginRight: 8 }} />
        智能 RAG 知识库
      </Title>
      <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>
        上传 PDF/Word 文档 → 自动解析并建立索引 → 基于文档内容智能问答
      </Text>

      {/* API Key 设置 */}
      <Alert
        type="info"
        message={
          <Space>
            <span>API Key：</span>
            <Input.Password
              size="small"
              value={apiKey}
              onChange={(e) => saveApiKey(e.target.value)}
              style={{ width: 280 }}
              placeholder="输入 RAG API Key"
            />
            <Text type="secondary" style={{ fontSize: 11 }}>
              默认: rag-dev-key-change-me
            </Text>
          </Space>
        }
        style={{ marginBottom: 16 }}
      />

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        {/* 左侧：文档管理 */}
        <Card
          title={
            <Space>
              <FileTextOutlined />
              <span>知识库文档</span>
              <Tag color="blue">{docs.length} 篇</Tag>
            </Space>
          }
          style={{ flex: '1 1 380px', minWidth: 300 }}
          extra={
            <label
              style={{
                cursor: 'pointer',
                color: '#4F46E5',
                fontWeight: 600,
                fontSize: 13,
              }}
            >
              <UploadOutlined /> 上传文档
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                style={{ display: 'none' }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleUpload(file);
                  e.target.value = '';
                }}
              />
            </label>
          }
        >
          {uploading && (
            <div style={{ textAlign: 'center', padding: 20 }}>
              <Spin tip="正在解析文档..." />
            </div>
          )}

          {docs.length === 0 && !docsLoading ? (
            <Empty
              description="暂无知识库文档"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            >
              <Text type="secondary">上传 PDF 或 Word 文档建立知识库</Text>
            </Empty>
          ) : (
            <List
              loading={docsLoading}
              dataSource={docs}
              renderItem={(doc) => (
                <List.Item
                  actions={[
                    <Button
                      key="del"
                      type="text"
                      danger
                      size="small"
                      icon={<DeleteOutlined />}
                      onClick={() => handleDelete(doc.document_id)}
                    />,
                  ]}
                >
                  <List.Item.Meta
                    title={<Text ellipsis style={{ maxWidth: 220 }}>{doc.source}</Text>}
                    description={`${doc.chunks_count} 个文本块 · ${doc.uploaded_at?.slice(0, 10)}`}
                  />
                </List.Item>
              )}
            />
          )}
        </Card>

        {/* 右侧：对话 */}
        <Card
          title={
            <Space>
              <RobotOutlined style={{ color: '#4F46E5' }} />
              <span>智能问答</span>
              <Text type="secondary" style={{ fontSize: 11, marginLeft: 8 }}>
                top_k:
                <Input
                  size="small"
                  type="number"
                  min={1}
                  max={20}
                  value={topK}
                  onChange={(e) => setTopK(Number(e.target.value) || 5)}
                  style={{ width: 50, marginLeft: 4 }}
                />
              </Text>
            </Space>
          }
          style={{ flex: '1 1 480px', minWidth: 350 }}
        >
          {/* 消息列表 */}
          <div
            style={{
              minHeight: 300,
              maxHeight: 500,
              overflowY: 'auto',
              marginBottom: 16,
              padding: '0 8px',
            }}
          >
            {messages.length === 0 && (
              <div style={{ textAlign: 'center', padding: 60 }}>
                <InboxOutlined style={{ fontSize: 48, color: '#e2e8f0' }} />
                <div style={{ marginTop: 12, color: '#94a3b8' }}>
                  上传文档后，在此输入问题获取答案
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  marginBottom: 16,
                  padding: '12px 16px',
                  borderRadius: 10,
                  background: msg.role === 'user' ? '#EEF2FF' : '#F8FAFC',
                  border: msg.role === 'user' ? '1px solid #C7D2FE' : '1px solid #E2E8F0',
                }}
              >
                <Text strong style={{ fontSize: 12, color: '#64748B' }}>
                  {msg.role === 'user' ? '🧑 你' : '🤖 AI 助手'}
                </Text>
                <Paragraph style={{ marginTop: 4, marginBottom: 0, whiteSpace: 'pre-wrap' }}>
                  {msg.content}
                </Paragraph>
                {msg.sources && msg.sources.length > 0 && (
                  <div style={{ marginTop: 8 }}>
                    <Text type="secondary" style={{ fontSize: 11 }}>
                      参考来源：
                    </Text>
                    {msg.sources.slice(0, 3).map((s, j) => (
                      <Tag key={j} color="geekblue" style={{ fontSize: 10, marginTop: 2 }}>
                        {s.source} ({(s.score * 100).toFixed(0)}%)
                      </Tag>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {asking && (
              <div style={{ textAlign: 'center', padding: 8 }}>
                <Spin size="small" /> <Text type="secondary">AI 正在思考...</Text>
              </div>
            )}
          </div>

          {/* 输入区 */}
          <Space.Compact style={{ width: '100%' }}>
            <TextArea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onPressEnter={(e) => {
                if (!e.shiftKey) {
                  e.preventDefault();
                  handleAsk();
                }
              }}
              placeholder="输入问题，基于已上传的文档获取答案..."
              rows={2}
              style={{ flex: 1 }}
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              loading={asking}
              onClick={handleAsk}
              disabled={!question.trim()}
              style={{ height: 'auto', minWidth: 60 }}
            />
          </Space.Compact>
        </Card>
      </div>
    </div>
  );
};

export default RAGPage;
