# 当前页面展示与 Lovable 一致性检查

**项目名称**：本元养生 / BenYuan Wellness  
**对照依据**：`docs/reference/每页功能与逻辑要点.md`、`docs/本元养生产品架构说明书_供V0与Lovable用.md`、`docs/Lovable_UI与uni-app落地对照.md`

---

## 一、当前各页实际展示（可预览内容）

在 `app` 目录运行 `npm run dev:h5`，浏览器打开后可按下列路径查看。

| 页面 | 路径 / 入口 | 当前展示内容 |
|------|-------------|--------------|
| **首页（当下）** | tab 第一项 `/pages/index/index` | 标题「当下」+ 一句描述「首页·当下 · 与 key-code-index、architecture 一致」；**逻辑**：首次打开（未 onboarded 且无 profile、无 logs）会 `reLaunch` 到 onboarding。 |
| **新手引导** | 首次打开自动跳转，或直接访问 `/pages/onboarding/onboarding` | **已实现**：3 步（本元 → 身·气·神 → 开始归元之路）、步骤点、最后一步「了解自己」「先逛一逛」；写 `benyuan_onboarded`，出口 → 体质测评或首页。 |
| **观己** | tab「观己」`/pages/assessment/assessment` | **占位**：标题「观己」+「体质测评 · 身体测试（写入 benyuan_profile）」。 |
| **炼体** | tab「炼体」`/pages/practice/practice` | **占位**：标题「炼体」+「练功计划 · 今日安排 · 动作库」。 |
| **食养** | tab「食养」`/pages/diet/diet` | **占位**：标题「食养」+「体质饮食 · 今日三餐 · 餐后感受」。 |
| **明理** | tab「明理」`/pages/knowledge/knowledge` | **占位**：标题「明理」+「知识库 · 我的专属」。 |
| **归元** | tab「归元」`/pages/records/records` | **占位**：标题「归元」+「归元镜 · 归途 · 觉察录」。 |
| **觉察** | 无 tab，需从首页/归元等入口跳转 ` /pages/reflection/reflection` | **占位**：标题「觉察与收束」+「身心评分，写入 benyuan_logs」。 |
| **静心转场** | 练功后跳转 ` /pages/calm/calm` | **占位**：标题「静心转场」+「约 5.5s 自动跳转觉察」；**未实现**：5.5s 定时跳 `/reflection`。 |
| **设置** | 无 tab，需从首页入口 ` /pages/settings/settings` | **占位**：标题「我的偏好」+「时段与提醒，读写 benyuan_settings」。 |
| **炼体计划** | ` /pages/practice-plan/practice-plan`（无 tab，从炼体页进） | **占位**：标题「炼体计划」+「动作库 + 我的计划，共用 benyuan_plan」。 |
| **404** | 任意未配置路径 → ` /pages/notfound/notfound` | **已实现**：显示「404」「页面不存在」+ 按钮「返回首页」→ `reLaunch` 到首页。 |

---

## 二、与 Lovable 一致性结论

### 2.1 已与 Lovable 对齐的部分

| 项目 | Lovable 要求 | 当前实现 | 说明 |
|------|--------------|----------|------|
| **路由与页面结构** | 6 个 tab + onboarding/reflection/calm/settings/practice-plan/notfound | ✅ | `pages.json` 与 key-code-index、Lovable_UI与uni-app落地对照 一致。 |
| **首次打开逻辑** | 未 onboarded 且无档案、无日志 → 进 onboarding | ✅ | 首页 `onMounted` 判断并 `reLaunch` 到 onboarding。 |
| **Onboarding 功能** | 3 步（本元 → 身·气·神 → 开始归元之路），最后「了解自己」/「先逛一逛」 | ✅ | 三步文案与出口、写 `benyuan_onboarded` 均一致。 |
| **Onboarding 出口** | 「了解自己」→ `/assessment`；「先逛一逛」→ `/` | ✅ | 使用 `reLaunch` 到对应页面路径。 |
| **404** | 展示 404，可返回首页 | ✅ | 有返回首页按钮并跳转。 |
| **tabBar 隐藏** | onboarding、calm 不显示底部导航 | ✅ | 二者均为非 tab 页，本身无 tabBar；与「方案 A」一致。 |
| **存储键名** | benyuan_profile、benyuan_logs、benyuan_onboarded 等 | ✅ | 已用键名与 key-code-index 一致（onboarding 已写 benyuan_onboarded）。 |

### 2.2 尚未实现（与 Lovable 的差异）

以下为**功能/展示**层面的差异，不是路由或键名错误。

| 页面 | Lovable 应有功能/展示 | 当前状态 | 建议 |
|------|------------------------|----------|------|
| **首页 Index** | 时段问候、时辰与节气条、晨间心语、今日进度、推荐卡、入口到各页等 | 仅标题 + 一句描述 | 按实现计划逐步补：问候、进度、入口等。 |
| **观己 Assessment** | 两 Tab：体质 9 题、身体测试 5 题 + 疼痛多选；结果页（饮食/炼体指导）、出口首页或炼体 | 占位 | 下一阶段实现：题目、结果、写 benyuan_profile。 |
| **炼体 Practice** | 三 Tab：今日安排、我的计划、动作库；完成练习 → 静心 → 觉察 | 占位 | 实现计划第 4 项。 |
| **食养 Diet** | 饮食概览、三餐时间线、餐后感受、写 benyuan_diet_feelings | 占位 | 实现计划第 5 项。 |
| **明理 Knowledge** | 两 Tab：知识库、我的专属；无档案引导测评 | 占位 | 实现计划第 6 项。 |
| **归元 Records** | 三 Tab：归元镜、归途、觉察录；读 benyuan_logs | 占位 | 实现计划第 7 项。 |
| **觉察 Reflection** | 身体感受 5 档 + 心理 5 档，提交写 benyuan_logs，完成页回首页 | 占位 | 实现计划第 8 项。 |
| **静心 Calm** | 约 5.5s 自动跳 `/reflection`，可「跳过」 | 仅占位文案，无定时与跳转 | 补定时器 + 跳转 + 跳过按钮。 |
| **设置 Settings** | 我的时段、提醒提前量、重新测评；读写 benyuan_settings | 占位 | 实现计划第 10 项。 |
| **炼体计划 PracticePlan** | 与炼体「我的计划」共用 benyuan_plan，两 Tab | 占位 | 实现计划第 11 项。 |
| **全局** | BottomNav 6 标签 | ✅ 已由 pages.json tabBar 提供 | — |
| **全局** | 右下角 FloatingTeacher（AI 问答） | 未实现 | 可选，按需在 layout 或各页加。 |

### 2.3 小结

- **与 Lovable 已一致**：路由与页面清单、首次打开与引导流程、Onboarding 三步与双出口、404、tabBar 与隐藏方式、使用的存储键名。
- **尚未一致**：除 Onboarding 与 404 外，其余页目前均为占位；需按 `app/docs/实现计划.md` 顺序逐页实现功能与数据流，才能与 Lovable 参考原型在「功能与数据」上对齐。文档允许样式不必像素级一致，重点是对齐功能和数据。

---

## 三、如何本地预览当前页面

### 3.1 启动步骤（必做）

1. 打开**命令行/终端**（Cursor 里即左侧/底部的 Terminal，Windows 上多为 PowerShell）。
2. 进入项目下的 `app` 目录：
   ```bash
   cd C:\Users\liuya\Documents\GitHub\benyuan-wellness\app
   ```
3. 执行：
   ```bash
   npm run dev:h5
   ```
4. **不要关掉这个终端窗口**，开发服务会一直在这里运行。
5. **固定地址**：项目已配置为始终使用端口 **5179**。在浏览器中打开：
   ```text
   http://localhost:5179/
   ```

### 3.2 若出现「无法访问此网站 / ERR_CONNECTION_REFUSED」或 Network 里 status 0、Provisional headers

- **原因**：开发服务没在运行，或浏览器打开了错误端口。Response status 0、0 B transferred、Provisional headers 都说明**本机没有程序在该端口提供响应**（连接被拒绝）。
- **处理**：
  1. 确认已在 `app` 目录执行过 `npm run dev:h5`，且**该终端窗口没有关闭**。
  2. **只打开** `http://localhost:5179/`（端口已固定为 5179）。
  3. 若终端报错「Port 5179 is already in use」：关掉其他占用该端口的终端或程序，再重新执行 `npm run dev:h5`。
  4. 本问题与 CORS 无关，是**服务未在对应端口启动**导致的连接失败。

浏览器打开终端提示的地址后：

- **看引导**：清除该站点本地存储（或无痕窗口）后刷新，会先进入 Onboarding，可走完三步并点「了解自己」或「先逛一逛」。
- **看首页**：完成引导或直接访问首页路径，可见「当下」占位内容。
- **看各 tab**：底部 6 个 tab 可切换到观己、炼体、食养、明理、归元。
- **看非 tab 页**：需在地址栏改路径，例如 `/pages/reflection/reflection`、`/pages/calm/calm`、`/pages/settings/settings`、`/pages/notfound/notfound`（或任意不存在路径看 404）。

---

> 本文档由 Cursor 根据当前代码与 docs 下产品/参考文档生成，用于「先看目前页面 + 与 Lovable 一致性检查」。后续每实现一页，可更新本表对应行。
