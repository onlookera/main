import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite 构建配置 — DocMaster 前端
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // 开发环境 API 代理 → 后端 FastAPI (端口 8000)
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        // Vite 代理默认有 100MB 请求体限制，这里提升到 2GB
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq, req) => {
            // 大文件上传：移除默认的 body 大小限制
            req.setMaxListeners(0);
          });
        },
      },
    },
    // Connect 中间件的请求体大小限制（默认 100MB）
    fs: {
      strict: false,
    },
  },
});
