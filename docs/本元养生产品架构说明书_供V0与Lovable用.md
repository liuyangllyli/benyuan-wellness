# 本元养生（BenYuan Wellness）· 产品架构说明书

**项目名称**：本元养生（中文）/ BenYuan Wellness（英文）  
**版本**：开发前确认版 · 与 Lovable UI 对齐 · 2026-02-21  
**用途**：开发前确认「做什么」的单一事实来源；与 `docs/architecture.md`、`docs/reference/每页功能与逻辑要点.md` 一致，确保 Cursor 实现与 Lovable 参考原型在页面、流程、数据上一致。

---

## 使用说明

- **产品架构说明书**（本文）：规定**产品范围、页面、流程、各页必备要素与数据**，与 Lovable 已实现的 UI 一致。
- **技术架构说明**（`docs/本元养生_技术架构说明.md`）：规定**技术栈与实现方式**（uni-app、先本地后 Supabase 等）。
- 实现时请同时遵守本文与技术架构说明。
- **优先级**：如有冲突，**键名/路径以 `docs/key-code-index.md` 为准**；**流程图/页面关系以 `docs/architecture.md` 为准**；**各页功能以本文第三节为准**。

---

## 一、产品定位与原则

### 1.1 核心定位

本元养生是以**「生活节律」**为轴心的健康管理应用，持续回答用户：**「当下，我最适合为身体做的一件事是什么？」**

### 1.2 核心原则

- **先体验，后注册**：匿名即可完成首次炼体与觉察，数据先存本地，再择机迁移。**MVP 阶段不实现登录/迁移页面**；注册引导仅作为 Reflection 完成页的轻提示占位（文案/入口保留，功能后接 Supabase）。
- **以一天时间轴为主线**：关键页体现当前时段/时辰、当前或即将的任务、今日安排或今日进度。
- **闭环觉察**：炼体/饮食后有反馈收束，觉察数据写入 `benyuan_logs`，形成可回顾的档案。

### 1.3 与 Lovable UI 的对应

本文中的**页面清单、路由、数据读写、出口、全局与页面级组件**均与 Lovable 参考原型及 `docs/architecture.md`、`docs/reference/每页功能与逻辑要点.md` 对齐，作为实现时的产品依据。

---

## 二、用户主流程（与 architecture.md 一致）

- **首次打开**：根据 `benyuan_onboarded` 判断 → 未完成则进入 `/onboarding` 新手引导 → 引导结束可进入 `/assessment` 体质测评或直接 `/` 首页；已完成则进入首页 `/`。
- **首页（当下）**：可进入炼体 `/practice`、食养 `/diet`、明理 `/knowledge`、归元 `/records`、设置 `/settings`；可进入觉察 `/reflection`。
- **炼体**：练功完成后进入静心转场 `/calm`，约 5.5s 自动跳转至觉察 `/reflection`。
- **归元**：可进入觉察 `/reflection`。
- **设置**：目前仅从首页进入；归元页暂无设置入口。

> 练功计划以 Practice 页内 Tab「我的计划」管理，**无独立路由入口**（`/practice/plan` 路由存在但不作为主导航）。  
> **硬约束**：`/practice/plan` 仅作为开发/调试或未来扩展保留；**MVP 不在任何页面提供显式入口**，用户只通过 `/practice` 的 Tab「我的计划」管理计划。

---

## 三、页面清单与各页必备要素

以下与 `docs/reference/每页功能与逻辑要点.md` 一致，实现时按此还原功能与数据流。

### 3.1 首页（当下）Index

| 项 | 内容 |
|----|------|
| **路由** | `/` |
| **功能** | 时段问候、时辰与节气条、晨间心语（可本地生成或后续接 AI）、今日进度（食养/炼体/觉察）、核心推荐卡（按时辰+体质+昨日体感）、今日进度圆点、日常作息提醒、今日心语、记录入口、设置入口；首次/未测评时有引导卡片或入口。 |
| **数据读** | `benyuan_profile`、`benyuan_logs`（昨日体感、连续天数、今日是否已觉察）、`benyuan_onboarded`、完成统计（食养/炼体）、节气与时辰。 |
| **出口** | `/settings`、`/assessment`、`/practice`、`/reflection`、`/diet`、`/records`。 |
| **子组件** | LifestyleReminder（时辰养生提醒）、MLLMBadge（多模态 AI 能力标记）。 |
| **逻辑要点** | getMorningMessage、getSmartRecommendation（按时段/体质/低能量推荐食养或炼体）；月度复测满 30 天可提醒去 `/assessment`。 |

### 3.2 新手引导 Onboarding

| 项 | 内容 |
|----|------|
| **路由** | `/onboarding` |
| **功能** | 3 步引导（本元 → 身·气·神 → 开始归元之路），最后一步可「了解自己」或「先逛一逛」。 |
| **数据写** | `benyuan_onboarded = 'true'`。 |
| **出口** | 「了解自己」→ `/assessment`；「先逛一逛」→ `/`。 |

### 3.3 观己（体质测评）Assessment

| 项 | 内容 |
|----|------|
| **路由** | `/assessment` |
| **功能** | 两 Tab：体质测评（9 题）、身体测试（5 题 + 疼痛部位多选）；完成后展示体质结果（饮食指导）或身体结果（炼体指导），可「继续身体测试」或「返回首页」/「立即开始炼体」。 |
| **数据写** | `benyuan_profile`（constitutionAnswers、constitutionType、bodyAnswers、painTags、timestamp）。 |
| **出口** | `/`、`/practice`（身体结果页）。 |
| **逻辑要点** | getConstitutionResult、getDietGuide、getBodyTestResult、getPracticeGuide（与 profile-utils 一致）。 |

### 3.4 炼体 Practice

| 项 | 内容 |
|----|------|
| **路由** | `/practice` |
| **功能** | 三 Tab：今日安排、我的计划、动作库；今日安排含时辰建议、今日练习列表、完成打勾、老师点评/问答入口；详情浮层「完成练习」→ 弹出 QuickReflection。 |
| **数据读** | `benyuan_profile`、`benyuan_plan`、getTodaySchedule；**写**：今日完成记录（如 markComplete / benyuan_today）。 |
| **出口** | `/`。 |
| **子组件** | SanJieTag、QuickReflection。 |
| **逻辑要点** | 练功计划以 Tab 为准，无独立路由入口；完成练习（markComplete）后：**先弹 QuickReflection（可选）→ 再进入 `/calm` → 自动跳 `/reflection`**；若用户跳过静心则直接进入 `/reflection`。 |

### 3.5 练功计划 PracticePlan

| 项 | 内容 |
|----|------|
| **路由** | `/practice/plan` |
| **功能** | 两 Tab：动作库、我的计划；与 Practice 共用 `benyuan_plan`，可增删计划项、分享。以 Practice 页内 Tab 为准，无独立主导航入口。 |
| **出口** | `/practice`。 |

### 3.6 食养 Diet

| 项 | 内容 |
|----|------|
| **路由** | `/diet` |
| **功能** | 体质饮食概览、今日三餐时间线、每餐详情（食谱、食材、步骤、中医建议）、「已完成这一餐」→ 餐后感受浮层（不适/一般/舒适/满足），写入饮食反馈。 |
| **数据读** | `benyuan_profile`、getTopRatedRecipes；**写**：`benyuan_diet_feelings`、完成标记。 |
| **出口** | `/`。 |
| **子组件** | SanJieTag。 |

### 3.7 明理（知识）Knowledge

| 项 | 内容 |
|----|------|
| **路由** | `/knowledge` |
| **功能** | 两 Tab：知识库（分类、搜索、节气+心语、文章列表）、我的专属（体质档案匹配的个性化文章）；无档案时引导去 `/assessment`。 |
| **数据读** | `benyuan_profile`、节气、每日心语；静态文章数据。 |
| **出口** | `/assessment`（我的专属未建档案时）。 |

### 3.8 归元（记录）Records

| 项 | 内容 |
|----|------|
| **路由** | `/records` |
| **功能** | 三 Tab：归元镜（同心圆、归元心语、觉察天数/次数/归元度、逆熵轨迹图、周报/体质漂移/社群统计）、归途（里程碑时间线）、觉察录（按日期分组的 benyuan_logs）；空状态引导去 `/reflection`。 |
| **数据读** | `benyuan_logs`。 |
| **出口** | `/reflection`（空状态）。 |
| **子组件** | ConstitutionDrift、CommunityStats、WeeklyReport（**AI stub：仅占位/本地模拟，后续再接接口**）。 |

### 3.9 觉察详情 Reflection

| 项 | 内容 |
|----|------|
| **路由** | `/reflection` |
| **功能** | 两步：身体感受（5 档）、心理状态（5 档）；提交后写入 `benyuan_logs`，展示完成页（双维度反馈、今日小结、可选注册引导）→「回到首页」。 |
| **数据写** | `benyuan_logs`（bodyFeeling、mindFeeling、timestamp）。 |
| **出口** | `/`、或上一步返回。 |
| **子组件** | DailyQuestion。 |

### 3.10 静心转场 CalmTransition

| 项 | 内容 |
|----|------|
| **路由** | `/calm` |
| **功能** | 练功后静心过渡；约 5.5s 自动跳 `/reflection`，可「跳过」立即跳。 |
| **出口** | `/reflection`。 |

### 3.11 设置 Settings

| 项 | 内容 |
|----|------|
| **路由** | `/settings` |
| **功能** | 我的时段（各时段开关与时间）、提醒提前量、重新测评入口。 |
| **数据读写** | `benyuan_settings`。 |
| **出口** | `/`、`/assessment`。 |

### 3.12 404 NotFound

| 项 | 内容 |
|----|------|
| **路由** | `*` |
| **功能** | 展示 404，链接回 `/`。 |

---

## 四、全局组件与数据（与 key-code-index、architecture 一致）

### 4.1 全局组件

| 组件 | 职责 |
|------|------|
| **BottomNav** | 6 标签（当下/观己/炼体/食养/明理/归元）；在 `/onboarding`、`/calm` 等路由时隐藏。 |
| **FloatingTeacher** | 右下角 AI 老师悬浮问答入口，调用 fetchTeacherReply（当前可 stub）。 |

### 4.2 页面级子组件归属

| 子组件 | 所属页面 | 职责 |
|--------|----------|------|
| LifestyleReminder | Index | 时辰养生提醒 |
| MLLMBadge | Index | 多模态 AI 能力标记 |
| SanJieTag | Practice, Diet | 三节（节气/时辰/体质）标签 |
| QuickReflection | Practice | 练功后快速觉察入口 |
| DailyQuestion | Reflection | 每日觉察问题 |
| ConstitutionDrift | Records | 体质漂移趋势（**AI stub：仅占位/本地模拟，后续再接接口**） |
| CommunityStats | Records | 社群匿名统计（**AI stub：仅占位/本地模拟，后续再接接口**） |
| WeeklyReport | Records | AI 周报叙事（**AI stub：仅占位/本地模拟，后续再接接口**） |

### 4.3 localStorage 键名（与 key-code-index 第 8 节一致）

| 键名 | 写入方 | 读取方 | 说明 |
|------|--------|--------|------|
| benyuan_profile | Assessment | Index, Practice, Diet, profile-utils | 体质档案 |
| benyuan_logs | Reflection | Records, WeeklyReport, Index | 每日觉察日志 |
| benyuan_diet_feelings | Diet | Diet, profile-utils | 饮食反馈 |
| benyuan_plan | PracticePlan | Practice | 练功计划 |
| benyuan_onboarded | Onboarding | Index（首次判断） | 引导完成标记 |
| benyuan_settings | Settings | Settings | 时段与提醒设置 |
| benyuan_today | time-utils | Index, time-utils | 今日任务完成记录 |

> **写入约定**：`benyuan_today` 由 `markComplete()` 统一更新（Diet/Practice 完成时调用），Index 仅做读取汇总展示；避免各页重复实现完成逻辑。

---

## 五、UI 呈现原则（与 Lovable 一天式用户旅程一致）

以下为所有关键页的共同约束，与 Lovable 参考原型一致：

1. **以一天时间轴为主线**  
   首页、饮食、炼体等页需体现：**当前时段/时辰**、**当前或即将的任务**、**今日安排或今日进度**。

2. **当前时辰 + 养生建议**  
   关键页顶部或首屏应有：当前时辰（如午时 11:00–13:00）、对应脏腑或简短养生建议。

3. **下一个提醒 / 即将开始**  
   首页有「下一个提醒」；饮食页有「即将到来」的下一餐；炼体页有「即将开始」的下一项练习，并带时间与主按钮。

4. **今日安排 / 今日进度**  
   首页或相关页有：今日任务列表及完成状态；可选今日进度（饮食/运动/觉察等）。

5. **风格**  
   简洁、克制、偏东方/中医养生气质；不制造焦虑，不堆砌功能。

---

## 六、文档对应关系

| 文档 | 用途 |
|------|------|
| **本文** | 产品架构说明书：与 Lovable UI 一致的产品范围、页面、流程、各页必备要素与数据 |
| `docs/architecture.md` | 用户主流程、数据架构、组件依赖、AI 契约等（Mermaid 图与本文一致） |
| `docs/reference/每页功能与逻辑要点.md` | 各页功能、数据读写、出口、逻辑要点（与本文第三节一一对应） |
| `docs/key-code-index.md` | 路由、页面路径、组件路径、**localStorage 键名**（实现时路径与键名以此为准） |
| `docs/本元养生_技术架构说明.md` | 技术栈与实现方式（uni-app、先本地后 Supabase） |

---

> **开发前确认**：实现前请确认本文与 `docs/本元养生_技术架构说明.md` 已阅读；实现时产品侧以本文 + `docs/key-code-index.md` 为准，技术侧以技术架构说明为准。
