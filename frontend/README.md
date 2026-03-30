# 前端 — BiliMind 收藏夹知识库

> 来自 [via007/bilibili-rag](https://github.com/via007/bilibili-rag) 的分支 · 本分支包含前端质量审计与修复

## 技术栈

- **Next.js 16** (App Router + Turbopack)
- **React 19**
- **Tailwind CSS v4**
- **TypeScript**

## 开发

```bash
npm install
npm run dev
```

访问 http://localhost:3000

## 目录结构

```
frontend/
├── app/                  # Next.js App Router
│   ├── page.tsx          # 主页面（SSR Server Component）
│   ├── HomeClient.tsx     # 交互逻辑（Client Component）
│   ├── layout.tsx        # Root Layout
│   └── globals.css       # 全局样式 + 设计系统
├── components/           # UI 组件
│   ├── ChatPanel.tsx         # 对话面板（流式 SSE）
│   ├── SourcesPanel.tsx     # 收藏夹侧边栏
│   ├── LoginModal.tsx       # B站扫码登录
│   ├── DemoFlowModal.tsx    # 检索流程演示
│   └── OrganizePreviewModal.tsx  # 一键整理预览
└── lib/
    └── api.ts           # API 客户端
```

## 设计系统

使用 CSS 自定义属性定义设计令牌：

| 令牌 | 值 | 用途 |
|------|-----|------|
| `--ink` | `#1b1713` | 主文字 |
| `--paper` | `#f7f1e8` | 背景 |
| `--accent` | `#d98b2b` | 强调色 |
| `--teal` | `#2f7c78` | 辅助色 |
| `--border` | `#dccbb4` | 边框 |

字体：ZCOOL XiaoWei（标题） + Noto Sans SC（正文）

## 本分支修复内容

- QR 码图片动态 alt 文本（无障碍）
- 用户信息区文字对比度修复（WCAG AA）
- 流式对话 RAF 批量状态更新（性能）
- SSR 拆分：page.tsx 改为 Server Component
- 收藏夹展开按钮键盘可访问（WCAG）
- 移除 next.config.ts 废弃的 env 配置
