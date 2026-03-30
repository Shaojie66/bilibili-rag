# BiliMind · bilibili-rag

## 项目概述

Forked from [via007/bilibili-rag](https://github.com/via007/bilibili-rag). B站收藏夹转可对话知识库。

**启动后端**: `cd /Users/chenshaojie/Downloads/bilibili-rag-main && python -m uvicorn app.main:app --reload`
**启动前端**: `cd /Users/chenshaojie/Downloads/bilibili-rag-main/frontend && npm run dev`

## 技术栈

- 前端: Next.js 16 + React 19 + Tailwind v4 + TypeScript
- 后端: FastAPI + LangChain + ChromaDB + SQLite

## 设计系统

| 令牌 | 色值 | 用途 |
|------|------|------|
| `--ink` | `#1b1713` | 主文字 |
| `--paper` | `#f7f1e8` | 背景 |
| `--accent` | `#d98b2b` | 强调色 |
| `--teal` | `#2f7c78` | 辅助色 |
| `--border` | `#dccbb4` | 边框 |

字体: ZCOOL XiaoWei（标题）+ Noto Sans SC（正文）

## 自然语言工作流

当你进入这个项目，直接说话就行，AI 会按以下逻辑处理：

### 说"帮我看看前端有什么问题"
→ 自动运行 `/audit` 扫描前端（Accessibility / Performance / Responsive / Theming / Anti-Patterns 5维度）
→ 给你评分 + 问题列表 + 推荐修复命令
→ 问你是否要修复

### 说"修一下"或"fix it"
→ 按 P1 优先顺序修复所有问题
→ 每个修复独立 commit
→ 修完自动跑 `/qa` 验证

### 说"跑一下测试"或"test it"
→ 检查后端是否运行
→ 未运行则启动后端 + 前端
→ 跑 `/qa` 浏览器测试
→ 给你健康评分

### 说"提交"或"commit"
→ 检查未提交改动
→ 自动写 commit message（描述改动内容）
→ push 到 github.com/Shaojie66/bilibili-rag

### 说"美化一下 README"
→ 改进 README 排版、结构、内容
→ 自动 commit + push

## 代码规范

- 优先 Edit 而非 Write，保持改动最小化
- 每个 P1 修复独立 commit
- commit message 格式: `fix(audit): 问题描述`
- 提交前确认无 console errors
