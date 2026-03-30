# BiliMind · bilibili-rag

## 项目概述

Forked from [via007/bilibili-rag](https://github.com/via007/bilibili-rag). B站收藏夹转可对话知识库。

**启动**: `python -m uvicorn app.main:app --reload` (后端) + `cd frontend && npm run dev` (前端)

## 技术栈

- 前端: Next.js 16 + React 19 + Tailwind v4 + TypeScript
- 后端: FastAPI + LangChain + ChromaDB + SQLite

## 前端审计工作流

### 审计流程
```
/audit bilibili-rag-main     # → 5 维度评分（Accessibility/Performance/Responsive/Theming/Anti-Pattern）
                           # → P0-P3 问题列表
                           # → 推荐修复命令

# 修复 P1 问题后:
/qa bilibili-rag-main      # → 浏览器 QA 测试（需要先启动前端）
                           # → 健康评分 100/100 目标
```

### 审计评分参考
- 18-20 Excellent | 14-17 Good | 10-13 Acceptable | 6-9 Poor | 0-5 Critical

### 审计维度
| 维度 | 检查重点 |
|------|---------|
| Accessibility | alt文本、对比度(4.5:1)、键盘导航、ARIA |
| Performance | SSR、流式渲染(~60fps)、代码分割 |
| Responsive | 375/768/1024px断点、touch target |
| Theming | CSS令牌、dark mode |
| Anti-Patterns | AI审美痕迹、硬编码颜色 |

### 审计→修复→提交标准流程
1. `/audit` 扫描 → 记录 P1/P2 问题
2. 修复 P1 问题（Edit 工具）
3. `/qa` 验证修复 → 健康评分回升
4. `git add` + `git commit -m "fix(audit): ..."` + `git push`

## 设计系统

```css
--ink: #1b1713     /* 主文字 */
--paper: #f7f1e8   /* 背景 */
--accent: #d98b2b   /* 强调色 */
--teal: #2f7c78     /* 辅助色 */
--border: #dccbb4   /* 边框 */
```

字体: ZCOOL XiaoWei（标题）+ Noto Sans SC（正文）

## 代码规范

- 优先 Edit 而非 Write，保持原子提交
- 每个 P1 修复独立 commit
- commit message: `fix(audit): ISSUE-NNN — 简短描述`
- 无 git repo（已初始化为 git repo）
