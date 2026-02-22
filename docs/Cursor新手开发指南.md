# 本元养生（BenYuan Wellness）· Cursor 新手开发指南

**项目名称**：本元养生（中文）/ BenYuan Wellness（英文）  
**适用**：第一次在 Cursor 里用 uni-app 实现本项目的同学。项目较复杂，按本文顺序做可减少返工。

---

## 一、开发前心里有数

### 1. 我们要做什么

- **产品**：基于中医理论的健康管理应用，包含体质测评、炼体、食养、觉察与归元记录等闭环。
- **形态**：APP + 微信小程序（一套代码）。
- **技术栈**：
  - 客户端：**uni-app**（Vue 语法）。
  - 数据：**先本地**（uni-app 的本地存储，键名见 `docs/key-code-index.md` 第 8 节），后续再接 Supabase。
- **参考**：Lovable 的 Web 原型只做「UI 与业务逻辑参考」，不把 React 代码拷进仓；在 Cursor 里用 uni-app **按文档重新实现**。

### 2. 文档放在哪里、先看什么

| 用途 | 文档 |
|------|------|
| 文档总索引 | `docs/README.md` |
| 用户流程、数据流、组件关系 | `docs/architecture.md` |
| 路由/页面/组件/键名 | `docs/key-code-index.md` |
| 参考原型 → uni-app 怎么对应 | `docs/Lovable_UI与uni-app落地对照.md` |
| 每页要做什么、读写什么 | `docs/reference/每页功能与逻辑要点.md` |
| 技术架构（规则、后端、视频） | `docs/本元养生技术架构定稿版.md` |
| 开发时用代理导致 localhost 打不开 | `docs/开发环境_网络与代理设置.md` |

新开一个 Chat 时，可以说：**「请先读 @docs/README.md 和 @docs/architecture.md，我们要用 uni-app 实现本元养生。」**

---

## 二、推荐开发顺序（按步做即可）

1. **开发前确认两份文档**（约 10 分钟）  
   - **产品架构说明书**：打开 `docs/本元养生产品架构说明书_供V0与Lovable用.md`，确认产品范围、页面、流程、各页必备要素与 Lovable UI 一致，作为「做什么」的依据。  
   - **技术架构说明**：打开 `docs/本元养生_技术架构说明.md`，确认技术栈（uni-app、先本地后 Supabase、键名与 key-code-index 一致等），作为「用什么、怎么实现」的依据。有变化先改文档再开发。

2. **准备好「Lovable → uni-app」对照表**（已写好）  
   使用 `docs/Lovable_UI与uni-app落地对照.md`，实现每一页时对照「参考原型里是什么 → 在 uni-app 里怎么做」。

3. **在仓库里初始化 uni-app 项目**（第一次必做）  
   在仓库根目录下新建一个目录（如 `app/` 或 `uni-app/`），用 **uni-app 官方 CLI** 或 **HBuilderX** 创建一个标准 uni-app 项目并放进该目录。  
   - 若你希望 Cursor 直接生成：在 Chat 里说：「请根据 `docs/architecture.md` 和 `docs/key-code-index.md`，在当前仓库下创建 `app/` 目录，用 uni-app 官方模板初始化一个 Vue3 项目，并配置好 pages.json 的 tabBar 与第一屏首页路由。」

4. **按页面顺序实现，并反复对照文档**  
   建议实现顺序（按依赖与主流程）：  
   **首页（当下）→ 新手引导 / 体质测评 → 炼体 → 食养 → 觉察 / 归元 → 静心转场 → 设置**。  
   每做一页前，在 Cursor 里打开或引用下面三个文档，再发一条「实现某某页」的指令（见下一节）。

5. **不把 Lovable 的 React 代码拷进仓**  
   需要参考某页的交互或逻辑时，把该页的**片段**粘贴到对话里，说：「请按这个交互和逻辑，用 uni-app 实现一版。」

---

## 三、在 Cursor 里具体怎么操作（每做一页都这样）

### 每次实现「某一页」时的固定套路

1. **在对话里引用文档**（让 AI 有统一依据）  
   在输入框里 @ 下面三个文件（或复制路径给 AI）：
   - `docs/architecture.md`（流程与数据）
   - `docs/key-code-index.md`（页面与存储、键名）
   - `docs/Lovable_UI与uni-app落地对照.md`（Lovable → uni-app 的对应）

2. **可选：再引用「这一页」的说明**  
   打开 `docs/reference/每页功能与逻辑要点.md`，找到对应章节（如「1. 首页（当下）Index」），在对话里说：「同时按照 `docs/reference/每页功能与逻辑要点.md` 里「首页」的要点实现。」

3. **发一条清晰的实现指令**  
   示例（首页）：
   - 「根据 @docs/architecture.md、@docs/key-code-index.md 和 @docs/Lovable_UI与uni-app落地对照.md，用 uni-app 实现**首页（当下）**，先只用本地存储，键名用 key-code-index 第 8 节的。」
   - 其他页把「首页（当下）」换成「新手引导」「体质测评」「炼体」「食养」「觉察」「归元」「静心转场」「设置」即可。

4. **做完一页再下一页**  
   跑通当前页（能点进、能读写本地存储、和文档一致）后，再让 Cursor 实现下一页，避免一次改太多难以排查。

---

## 四、项目较复杂，可以这样拆解

- **先跑通主流程**：首页 → 引导 → 测评 → 炼体 → 觉察 → 归元，再补食养、明理、设置、静心转场等。
- **先本地、后接口**：所有「晨间心语」「AI 周报」等先做本地 mock 或 stub，键名和 `key-code-index` 一致，后续再接 Supabase/Edge Function。
- **规则逻辑在代码里**：体质评分、饮食/炼体推荐等按《本元养生技术架构定稿版》在代码中实现，不依赖 Excel 导出流水线。

---

## 五、遇到问题怎么办、何时提交

- **报错或行为与文档不符**：把报错信息或「期望 vs 实际」贴到对话里，并再次 @ 相关文档（如 `architecture.md`、`key-code-index.md`），让 AI 按文档修正。
- **不确定某功能该怎么做**：先查 `docs/reference/每页功能与逻辑要点.md` 和 `docs/architecture.md`，再在对话里问：「根据 architecture 的流程图，某某功能应该在哪一页、写哪个键？」
- **何时提交与推送**：完成一个逻辑单元（例如「首页可进、能读 benyuan_profile」或「测评页写完并写入 benyuan_profile」）后，做一次 `git add`、`git commit`；需要备份或协作时再 `git push`。详细节奏见 `docs/何时与GitHub同步.md`。

---

## 六、小结

| 步骤 | 做什么 |
|------|--------|
| 1 | 确认技术栈（定稿版文档），准备好对照表（已有） |
| 2 | 在仓库里初始化 uni-app 项目（如 `app/`） |
| 3 | 按「首页 → 引导/测评 → 炼体 → … → 设置」顺序，一页一页实现 |
| 4 | 每页前 @ architecture + key-code-index + Lovable 对照表，必要时 @ 每页功能与逻辑要点 |
| 5 | 先本地存储、键名按 key-code-index，后续再接 Supabase |

按这个顺序在 Cursor 里开发，文档和实现会保持一致，后面扩展或交接都更容易。  
**项目名称**：本元养生 / BenYuan Wellness。
