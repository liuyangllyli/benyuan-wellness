# 4、关键代码 — Cursor 需求说明（发给 Lovable）

在 1/2/3 已对齐的前提下，请 Lovable 提供或明确以下**关键代码**的路径及获取方式，便于 Cursor 侧对照架构、做迁移或联调。

---

## 一、需要的关键代码清单

以下路径与 `docs/architecture.md`、Part 1「页面与路由」一致；若 Lovable 仓库结构不同，请按实际路径对照说明。

### 1. 路由与入口

| 路径 | 职责 | 说明 |
|------|------|------|
| `src/App.tsx` | 路由定义、InkTransition、全局布局 | 含 `<Routes>` / `<Route>` 及 BottomNav、FloatingTeacher 挂载 |

### 2. 页面（与路由一一对应）

| 路径 | 对应路由 | 说明 |
|------|----------|------|
| `src/pages/Index.tsx` | `/` | 首页·此刻 |
| `src/pages/Onboarding.tsx` | `/onboarding` | 新手引导 |
| `src/pages/Assessment.tsx` | `/assessment` | 知己·体质测评 |
| `src/pages/Practice.tsx` | `/practice` | 炼体·练功 |
| `src/pages/PracticePlan.tsx` | `/practice/plan` | 练功计划（以 Tab 为准则可能无独立入口） |
| `src/pages/Diet.tsx` | `/diet` | 食养 |
| `src/pages/Knowledge.tsx` | `/knowledge` | 明理·知识 |
| `src/pages/Records.tsx` | `/records` | 归元·记录 |
| `src/pages/Reflection.tsx` | `/reflection` | 觉察详情 |
| `src/pages/CalmTransition.tsx` | `/calm` | 静心转场 |
| `src/pages/Settings.tsx` | `/settings` | 设置 |
| `src/pages/NotFound.tsx` | `*` | 404 |

### 3. 全局组件（非路由）

| 路径 | 职责 |
|------|------|
| `src/components/BottomNav.tsx` | 6 标签底部导航，含 `hiddenRoutes` |
| `src/components/FloatingTeacher.tsx` | 右下角 AI 问答悬浮入口 |

### 4. 核心 lib（逻辑与契约）

| 路径 | 职责 |
|------|------|
| `src/lib/api-contracts.ts` | AI 接口契约（fetchTeacherReply 等 stub） |
| `src/lib/profile-utils.ts` | 体质判定、饮食/炼体推荐（与 localStorage 读写） |
| `src/lib/time-utils.ts` | 十二时辰、时段、完成统计、今日安排等 |
| `src/lib/solar-terms.ts` | 24 节气、当前节气、五运六气等 |
| `src/lib/sounds.ts` | 音效（playComplete、playBrush、haptic 等） |

### 5. 设计系统与入口

| 路径 | 职责 |
|------|------|
| `src/index.css` | Tailwind 变量、水墨动画、色彩体系 |
| `src/main.tsx` | 应用挂载入口 |

### 6. 可选但建议提供

| 路径 | 职责 |
|------|------|
| `docs/routes.md` | 若有路由/页面清单文档，可一并同步 |
| `package.json` | 依赖与脚本，便于 Cursor 复现环境 |

---

## 二、Cursor 需要的提供方式（请 Lovable 任选其一或组合）

1. **同仓访问**  
   若 Cursor 与 Lovable 共用一个仓库（或 Cursor 可拉取 Lovable 仓库），则只需确认上述路径在 Lovable 侧存在且与 `docs/architecture.md` 一致，无需额外导出。

2. **关键代码索引文档**  
   若仓库不同，请 Lovable 在仓库中维护一份 **`docs/key-code-index.md`**（或等价文档），按上表列出**实际路径 + 一行职责说明**，便于 Cursor 知道「要对照/迁移时该看哪些文件」。

3. **导出包**  
   若无法同仓，可定期导出一份包含上述路径的代码包（如 zip），并注明分支与版本，供 Cursor 对照或合并。

---

## 三、请 Lovable 回复

- 上述路径在 Lovable 仓库中的**实际路径**是否与表中一致？若有差异请列出对照。
- 选择哪种提供方式（同仓 / key-code-index 文档 / 导出包），并简要说明 Cursor 如何获取（如仓库地址、文档路径、导出频率等）。

Cursor 将据此在本地或协作仓中定位关键代码，与 `docs/architecture.md` 及 1/2/3 保持一致推进后续工作。

---

## Lovable 已回复（2026-02-21）

- **路径**：所有路径与表中完全一致，无差异。
- **提供方式**：方式 2（关键代码索引文档），文件为 **`docs/key-code-index.md`**。
- **Lovable 侧说明**：Lovable 回复称双方共用同一 Git 仓库、Cursor 可直接访问。

**实际状况**：若 Lovable 项目尚未同步到本仓库（如 GitHub healthapp），则「同仓」未成立；Cursor 需在**将 Lovable 项目同步到本仓**之后，才能按 `key-code-index.md` 路径直接访问代码。同步前该索引仍可作为迁移/对照的文件清单使用。

Lovable 已创建 `docs/key-code-index.md`（已抄录至本仓），涵盖 8 类索引。另：Lovable 将清理未使用组件并生成 `.cursorrules`。✅
