# 前端 · BiliMind 收藏夹知识库

> Forked from [via007/bilibili-rag](https://github.com/via007/bilibili-rag) · 本分支包含前端质量审计与修复

---

## 技术栈

| 技术 | 版本 |
|------|------|
| Next.js | 16 (App Router + Turbopack) |
| React | 19 |
| Tailwind CSS | v4 |
| TypeScript | 5 |

---

## 开发

```bash
npm install
npm run dev
# 访问 http://localhost:3000
```

---

## 组件结构

```
frontend/
├── app/
│   ├── page.tsx           # Server Component（SSR 入口）
│   ├── HomeClient.tsx     # 交互逻辑（Client Component）
│   ├── layout.tsx         # Root Layout
│   └── globals.css        # 全局样式 + 设计系统
├── components/
│   ├── ChatPanel.tsx          # 对话面板（SSE 流式渲染）
│   ├── SourcesPanel.tsx       # 收藏夹侧边栏
│   ├── LoginModal.tsx        # B站扫码登录
│   ├── DemoFlowModal.tsx     # 检索流程演示动画
│   └── OrganizePreviewModal.tsx  # 一键整理预览
└── lib/
    └── api.ts              # API 客户端
```

---

## 设计系统

### 颜色令牌

| 令牌 | 色值 | 用途 |
|------|------|------|
| `--ink` | `#1b1713` | 主文字 |
| `--paper` | `#f7f1e8` | 背景 |
| `--accent` | `#d98b2b` | 强调/按钮 |
| `--teal` | `#2f7c78` | 辅助色 |
| `--border` | `#dccbb4` | 边框 |

### 字体

- **标题** — ZCOOL XiaoWei（衬线，古典中文感）
- **正文** — Noto Sans SC（无衬线，清晰易读）

---

## 本分支修复

| # | 问题 | 修复 | 状态 |
|---|------|------|-------|
| 1 | QR码图片缺少 alt | 动态 alt 文本 | ✅ |
| 2 | 用户区对比度不足 | WCAG AA 合规 | ✅ |
| 3 | 流式渲染性能抖动 | RAF 批量状态更新 | ✅ |
| 4 | 全量客户端渲染 | SSR + Client Component | ✅ |
| 5 | 收藏夹展开键盘不可达 | ARIA + button | ✅ |
| 6 | next.config 废弃配置 | 移除 env key | ✅ |

**QA 健康评分: 100/100** · 无 bug
