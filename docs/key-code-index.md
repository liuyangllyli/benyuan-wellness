# 本元养生（BenYuan Wellness）· 关键代码索引

**最后对齐日期**：2026-02-21

> 本文档列出 Cursor 侧需要对照、迁移或联调的所有关键文件路径及职责说明。  
> 路径与 `docs/architecture.md` 完全一致。

---

## 1. 路由与入口

| 路径 | 职责 |
|------|------|
| `src/App.tsx` | 路由定义（Routes/Route）、InkTransition 水墨转场、全局布局（BottomNav + FloatingTeacher） |

## 2. 页面（与路由一一对应）

| 路径 | 路由 | 职责 |
|------|------|------|
| `src/pages/Index.tsx` | `/` | 首页·当下（时段问候、今日进度、晨间心语） |
| `src/pages/Onboarding.tsx` | `/onboarding` | 新手引导（首次使用流程） |
| `src/pages/Assessment.tsx` | `/assessment` | 观己·体质测评（写入 `benyuan_profile`） |
| `src/pages/Practice.tsx` | `/practice` | 炼体·练功（含 Tab：今日安排/我的计划/动作库） |
| `src/pages/PracticePlan.tsx` | `/practice/plan` | 练功计划（路由存在但无独立入口，以 Practice Tab 为准） |
| `src/pages/Diet.tsx` | `/diet` | 食养（体质饮食推荐 + 餐后感受反馈） |
| `src/pages/Knowledge.tsx` | `/knowledge` | 明理·知识库 |
| `src/pages/Records.tsx` | `/records` | 归元·记录与趋势（周报、体质漂移、社群统计） |
| `src/pages/Reflection.tsx` | `/reflection` | 觉察详情（身心评分，写入 `benyuan_logs`） |
| `src/pages/CalmTransition.tsx` | `/calm` | 静心转场（练功后，5.5s 自动跳转 `/reflection`） |
| `src/pages/Settings.tsx` | `/settings` | 设置（时段开关、提醒，读写 `benyuan_settings`） |
| `src/pages/NotFound.tsx` | `*` | 404 页面 |

## 3. 全局组件（非路由）

| 路径 | 职责 |
|------|------|
| `src/components/BottomNav.tsx` | 6 标签底部导航，`hiddenRoutes` 控制 onboarding/calm 时隐藏 |
| `src/components/FloatingTeacher.tsx` | 右下角 AI 老师悬浮问答入口（调用 `fetchTeacherReply`） |

## 4. 页面级子组件

| 路径 | 所属页面 | 职责 |
|------|----------|------|
| `src/components/LifestyleReminder.tsx` | Index | 时辰养生提醒 |
| `src/components/MLLMBadge.tsx` | Index | 多模态 AI 能力标记（绿=可用/红=规划） |
| `src/components/SanJieTag.tsx` | Practice, Diet | 三节（节气/时辰/体质）标签 |
| `src/components/QuickReflection.tsx` | Practice | 练功后快速觉察入口 |
| `src/components/DailyQuestion.tsx` | Reflection | 每日觉察问题 |
| `src/components/ConstitutionDrift.tsx` | Records | 体质漂移趋势（AI stub） |
| `src/components/CommunityStats.tsx` | Records | 社群匿名统计（AI stub） |
| `src/components/WeeklyReport.tsx` | Records | AI 周报叙事（AI stub） |
| `src/components/FeelingSlider.tsx` | （未使用） | 感受滑块，当前无页面引用 |
| `src/components/VitalityOrb.tsx` | （未使用） | 活力球，当前无页面引用 |
| `src/components/SafetyTip.tsx` | （未使用） | 安全提示，当前无页面引用 |

## 5. 核心 lib（逻辑与契约）

| 路径 | 职责 |
|------|------|
| `src/lib/api-contracts.ts` | 6 个 AI 接口 stub + TypeScript 类型 + DB schema 注释 |
| `src/lib/profile-utils.ts` | 体质判定算法、饮食/炼体推荐、localStorage 统一读写层 |
| `src/lib/time-utils.ts` | 十二时辰、7 时段、今日安排、完成统计、每日名言 |
| `src/lib/solar-terms.ts` | 24 节气日期计算、当前节气、五运六气 |
| `src/lib/sounds.ts` | Web Audio API 音效（playComplete、playBrush、haptic 等） |
| `src/lib/utils.ts` | 通用工具函数（cn 等） |

## 6. 设计系统与入口

| 路径 | 职责 |
|------|------|
| `src/index.css` | Tailwind CSS 变量、水墨动画关键帧、色彩体系（HSL tokens） |
| `src/main.tsx` | React 应用挂载入口 |
| `tailwind.config.ts` | Tailwind 扩展配置（语义色、字体、动画） |
| `components.json` | shadcn/ui 组件配置 |

## 7. 文档

| 路径 | 职责 |
|------|------|
| `docs/architecture.md` | 架构与流程图（6 张 Mermaid，本元养生统一版） |
| `docs/routes.md` | 路由↔源文件映射清单 |
| `docs/key-code-index.md` | 本文件：关键代码索引 |

## 8. localStorage 键名索引

| 键名 | 写入方 | 读取方 | 说明 |
|------|--------|--------|------|
| `benyuan_profile` | Assessment.tsx | Index, Practice, Diet, profile-utils | 体质档案 |
| `benyuan_logs` | Reflection.tsx | Records, WeeklyReport, Index | 每日觉察日志 |
| `benyuan_diet_feelings` | Diet.tsx | Diet, profile-utils | 饮食反馈评分 |
| `benyuan_plan` | PracticePlan.tsx | Practice | 自定义练功计划 |
| `benyuan_onboarded` | Onboarding.tsx | Index（首次判断） | 引导完成标记 |
| `benyuan_settings` | Settings.tsx | Settings | 时段开关与提醒设置 |
| `benyuan_today` | time-utils.ts | Index, time-utils | 今日任务完成记录 |

---

> **获取方式**：本索引由 Lovable 提供，路径为其仓库内实际结构。**当前 Cursor 所在仓库（如 GitHub healthapp）若尚未同步 Lovable 项目，则上述路径需在「将 Lovable 项目同步到本仓」之后方可直接访问。** 同步前可据此表核对需迁移或对照的文件清单。
