# 测评 Excel → 代码 约定

**用途**：把您在 Excel 里的测评题目与算分逻辑，对齐成代码中的单一事实来源，后续维护只改代码、Excel 仅作设计参考。

---

## 一、您怎么提供 Excel 内容最合适

任选一种即可，**推荐方式 1 或 2**。

### 方式 1：直接粘贴表格（最快）

在 Excel 里选中要提供的区域 → **复制** → 到 Cursor 对话里 **粘贴**。

- 粘贴后通常是「制表符分隔」的文本，我能据此还原表格并写成代码。
- 若表格很长，可**分几次贴**：先「体质测评 9 题」，再「身体测试 5 题」，再「算分/映射规则」。

### 方式 2：导出 CSV 放到项目里

1. 在 Excel 中 **另存为 → CSV (逗号分隔)**，存到项目里，例如：
   - `docs/assessment-constitution.csv`（体质 9 题）
   - `docs/assessment-body.csv`（身体测试 5 题）
   - `docs/assessment-rules.csv`（算分与体质/饮食/炼体映射，若有单独表）
2. 在对话里告诉我文件路径，例如：`docs/assessment-constitution.csv`，我会读取并转成代码。

### 方式 3：用文字 + 小表格说明结构

若表头或规则较复杂，可先发一段说明，例如：

- 「体质表：每行一道题，列有 题号、题目、选项1、选项2…选项5，每个选项对应一个体质类型或分值」
- 「算分规则：取各体质得分最高的一项为 primary，若并列则…」
- 再粘贴关键几行示例或完整数据。

---

## 二、我需要您提供的两类信息

### 1. 题目与选项（用于界面展示与存答案）

| 内容 | 说明 | 代码落点 |
|------|------|----------|
| **体质测评 9 题** | 每题的题干 + 若干选项；若选项对应「体质倾向」或「分值」，请标明 | `src/lib/assessment-data.ts` → `CONSTITUTION_QUESTIONS` |
| **身体测试 5 题** | 题干 + 选项（若选项有分值或等级请标明） | `src/lib/assessment-data.ts` → `BODY_QUESTIONS` |
| **疼痛部位多选** | 可选部位列表（如：肩、颈、腰…） | `src/lib/assessment-data.ts` → `PAIN_TAGS_OPTIONS` |

### 2. 算分与映射逻辑（用于从答案得出结果并写 benyuan_profile）

| 内容 | 说明 | 代码落点 |
|------|------|----------|
| **体质算分规则** | 如何从 9 题选项得到「体质类型」（如：平和质、阳虚质…）；是否取最高分、是否有阈值、是否允许多体质 | `src/lib/profile-utils.ts` → `getConstitutionResult()` |
| **身体测试算分/结果** | 5 题 + 疼痛部位如何得到「身体结果」或等级（用于炼体指导） | `src/lib/profile-utils.ts` → `getBodyTestResult()` |
| **体质 → 饮食指导** | 每种体质对应的一段「饮食建议」文案（或规则描述） | `src/lib/profile-utils.ts` → `getDietGuide(constitutionType)` |
| **身体结果 → 炼体指导** | 身体测试/疼痛结果对应的一段「炼体建议」文案 | `src/lib/profile-utils.ts` → `getPracticeGuide(bodyResult, painTags?)` |

若 Excel 里是「公式」或「对照表」（例如某 Sheet 是「体质类型 — 饮食指导」两列），请按上面方式 1/2/3 把**输入→输出**的对应关系发给我，我会在代码里实现成函数。

---

## 三、代码里的存放位置（单一事实来源）

| 文件 | 职责 |
|------|------|
| `app/src/lib/assessment-data.ts` | **题目与选项**：体质 9 题、身体 5 题、疼痛部位列表；仅数据，无逻辑。 |
| `app/src/lib/profile-utils.ts` | **算分与推荐**：`getConstitutionResult`、`getBodyTestResult`、`getDietGuide`、`getPracticeGuide`；读写 `benyuan_profile` 的格式也在此约定。 |

本地存储 `benyuan_profile` 的字段与 key-code-index 一致：

- `constitutionAnswers`：体质 9 题答案（如 `[0,1,2,...]` 或 `[{ questionId, optionId }]`，按您 Excel 设计）
- `constitutionType`：算分得到的体质类型（字符串，如 `"平和质"`）
- `bodyAnswers`：身体 5 题答案
- `painTags`：选中的疼痛部位数组（如 `["肩","腰"]`）
- `timestamp`：最近一次测评完成时间

您提供 Excel 后，我会把上述两文件从「占位」填成与您设计一致的题目与逻辑；后续若改规则，只改这两个文件即可。

---

## 四、提供顺序建议

1. 先发 **体质 9 题**（题干 + 选项 + 选项对应体质或分值）→ 我写好题目数据与体质算分。
2. 再发 **身体测试 5 题 + 疼痛部位**（若有）→ 我补全题目与身体结果逻辑。
3. 最后发 **体质→饮食、身体→炼体** 的文案或对照表 → 我补全 `getDietGuide` / `getPracticeGuide`。

若您一次性有完整 Excel，也可以全部贴出或导出 CSV 后告诉我路径，我按同一约定一次性落代码。
