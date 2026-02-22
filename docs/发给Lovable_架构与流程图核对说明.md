# 本元养生 · 架构与流程图 核对说明（发给 Lovable）

我们根据当前仓库中的实际代码，对你们提供的「用户主流程、数据架构、组件依赖」等 6 张 Mermaid 图做了逐项核对。整体产品意图和结构一致，下面列出需要**与你们确认或统一**的差异，请直接回复每条的结论（以文档为准 / 以实现为准 / 需再讨论）。

---

## Lovable 已逐条回复（2026-02-21，统一以实现为准）

| # | 结论 | 说明 |
|---|------|------|
| 1 | **以实现为准** | /calm 是练功**后**静心再去觉察，流程改为 F → J → L |
| 2 | **以 Tab 为准** | 不需要独立路由，去掉 F → K |
| 3 | **以实现为准** | 暂仅首页进设置，去掉 I → M（后续可补） |
| 4 | **以实现为准** | 键名 `benyuan_logs` |
| 5 | **以实现为准** | 键名 `benyuan_plan` |
| 6 | **以实现为准** | Reflection.tsx 写入觉察数据 |
| 7 | **补充** | 加入 `benyuan_settings` |
| 8 | **以实现为准** | 修正首页子组件归属 |
| 9 | **本地生成，API 为后续** | fetchMorningMessage 标注「待对接」 |

**已按上述结论更新**：`docs/architecture.md`、`docs/本元养生_架构与流程图.md` 为 Lovable × Cursor 核对后统一版本。

**Lovable 确认**：Cursor 的反馈确认了所有 9 条结论与 Lovable 上一轮回复完全一致，文档已对齐，无需额外修改。双方现在基于同一份 `docs/architecture.md` 作为事实来源，可以继续推进后续工作了。✅  

**Lovable 确认（3、流程图/说明）**：无其他流程图/说明需同步；`docs/architecture.md` 的 6 张图即为当前全部架构文档。✅

---

---

## 一、用户主流程

### 1. 静心转场（/calm）的时机与出口

- **你们图中**：炼体 →「练功**前**」→ /calm → 再回到炼体（J → F）。
- **当前实现**：`CalmTransition.tsx` 仅在约 5.5 秒后执行 `navigate('/reflection')`，没有回到炼体；且 `Practice.tsx` 内没有任何 `navigate('/calm')` 的入口。

**请确认**：  
- 若设计是「练功**后**静心再去做觉察」→ 我们按**实现**更新流程图（已按此修正）。  
- 若设计是「练功**前**先静心再回炼体」→ 请在 Practice 中增加进入 `/calm` 的入口，并在静心结束后 `navigate('/practice')` 回到炼体。

---

### 2. 练功计划（/practice/plan）的入口

- **你们图中**：炼体页有入口进入「练功计划」独立页（F → K）。
- **当前实现**：Practice 页只有三个 Tab（今日安排 / 我的计划 / 动作库），没有 `navigate('/practice/plan')` 的按钮。

**请确认**：  
- 若需要**独立页**「练功计划」→ 请在 Practice 页内增加一个按钮，点击后 `navigate('/practice/plan')`。  
- 若当前设计就是**仅用 Tab「我的计划」**、不需要独立路由 → 我们按实现更新流程图，不再画 F → K。

---

### 3. 设置（/settings）在「归元」页的入口

- **你们图中**：归元（Records）页也有入口到设置（I → M）。
- **当前实现**：Records 页已提供的代码里没有看到进入设置的入口，仅首页有设置入口。

**请确认**：  
- 若产品要求「归元页也能进设置」→ 请在 Records 页增加设置入口（如 header 或底部区域）。  
- 若设计就是「仅首页进设置」→ 我们按实现更新流程图，去掉 I → M。

---

## 二、数据架构（localStorage）

### 4. 每日觉察数据的键名

- **你们图中**：`benyuan_daily_logs`。
- **当前实现**：`benyuan_logs`（在 Index、Reflection、Records 等中均为此键）。

**请确认**：以哪边为准？  
- 若以**实现**为准 → 我们文档中已改为 `benyuan_logs`。  
- 若以**文档**为准 → 请将代码中所有 `benyuan_logs` 重命名为 `benyuan_daily_logs`。

---

### 5. 练功计划的键名

- **你们图中**：`benyuan_practice_plan`。
- **当前实现**：`benyuan_plan`（Practice.tsx、PracticePlan.tsx 均使用此键）。

**请确认**：以哪边为准？  
- 若以**实现**为准 → 我们文档中已改为 `benyuan_plan`。  
- 若以**文档**为准 → 请将代码中 `benyuan_plan` 重命名为 `benyuan_practice_plan`。

---

### 6. 每日觉察的写入组件

- **你们图中**：由 **FeelingSlider.tsx** 写入身心评分。
- **当前实现**：由 **Reflection.tsx**（觉察详情页）在用户提交「身体感受 + 心理状态」时写入 `benyuan_logs`，没有单独的 FeelingSlider 页面组件。

**请确认**：  
- 若以**实现**为准 → 我们文档中已改为「Reflection.tsx → benyuan_logs」。  
- 若存在独立的 FeelingSlider 组件/页面而当前仓库未包含 → 请说明其与 Reflection 的关系，我们再对齐文档。

---

### 7. 设置相关数据

- **你们图中**：未体现「时段与提醒」等设置数据。
- **当前实现**：存在 `benyuan_settings`（Settings.tsx 读写），包含各时段开关与时间、提醒提前量等。

**请确认**：是否需要在数据架构图中**补充** `benyuan_settings` 及 Settings.tsx 的写入/读取？我们已按实现补入，若你们同意则保留。

---

## 三、组件依赖关系

### 8. 首页（Index）的子组件

- **你们图中**：Index 依赖 VitalityOrb、FeelingSlider、DailyQuestion、QuickReflection、SafetyTip、LifestyleReminder。
- **当前实现**：Index 使用 LifestyleReminder、MLLMBadge，以及内联的 ProgressDot；**没有** VitalityOrb、FeelingSlider；DailyQuestion 在 **Reflection.tsx**，QuickReflection 在 **Practice.tsx**。

**请确认**：  
- 若以**实现**为准 → 我们文档中已按实际归属修正（首页仅 LifestyleReminder、MLLMBadge 等；DailyQuestion → Reflection；QuickReflection → Practice）。  
- 若产品设计上确实应有 VitalityOrb / FeelingSlider 等 → 请说明预期交互与所在页面，我们可再对齐文档或补实现。

---

### 9. 首页晨间心语与 AI 接口

- **你们图中**：Index 通过 fetchMorningMessage 调用 API。
- **当前实现**：首页晨间心语由本地函数 `getMorningMessage()` 生成，未调用后端 API。

**请确认**：  
- 若当前阶段就是**本地生成**、API 为后续扩展 → 我们保留图中「未来可接 fetchMorningMessage」的说明即可。  
- 若近期就要接 API → 请确认接口契约后我们在文档中标注「已对接」或「待对接」。

---

## 四、请回复方式建议

可直接按编号回复，例如：

- **1**：以实现为准 / 我们加「练功前静心」入口并改 CalmTransition 回到炼体  
- **2**：在 Practice 加「练功计划」按钮 / 不需要独立页，以 Tab 为准  
- **3**：在 Records 加设置入口 / 仅首页进设置  
- **4–7**：以实现为准 / 以文档为准（若以文档为准请说明键名与组件名）  
- **8–9**：以实现为准 / 需要补充或调整（请简要说明）

我们收到回复后，会把「架构与流程图」文档和 Cursor 引用版本统一成与你们确认后的结论。谢谢。
