# 本元养生（BenYuan Wellness）· 交接说明与下一步开发建议

## 一、你的理解是对的 ✅

**结论：不需要把 Lovable 的项目同步到 GitHub。**

- **Lovable 做的是什么**：用他们自己的技术栈（如 React + Vite + TypeScript）把本元养生的 **UI 样子** 和 **业务逻辑** 做成了一个可用的 Web 原型。
- **你在 Cursor 要做的是什么**：用**另一套技术栈**（按《本元养生技术架构定稿版》是 **uni-app**）真正实现 **APP + 微信小程序**，并可选接 Supabase 等后端。
- **两边的代码不是同一套**：Lovable 的 React 代码不会直接跑在 APP/小程序里，所以不需要、也不应该把 Lovable 的整仓同步到你的 GitHub。
- **你只需要**：把 Lovable 里「长什么样、流程怎么走、数据写哪里」通过**复制粘贴代码或截图/说明**给 Cursor 做**参考**即可。  
  我们前面已经通过「贴代码 + 架构图 + key-code-index」把 UI 和业务逻辑都对齐过了，这些就是 Cursor 的**设计参考**，而不是要合并的代码库。

所以：**Lovable 的产出 = UI 与业务逻辑的参考；在 Cursor 里用 uni-app 按文档和参考重新实现即可，无需同步 Lovable 仓库。**

---

## 二、开发前建议：先做一次「产品/技术文档对齐」

在 Cursor 里动手写 uni-app 之前，建议**先更新/对齐一次产品与技术说明**，确保「Lovable 的 UI 与业务逻辑」能**用你选的技术栈合理落地**。这样后面让 Cursor 或 Claude 实现某一页时，才有统一依据。

建议做两件小事（不必一次做完，可以分两次）：

### 1. 确认并固定「目标技术栈」（写进文档）

- 客户端：**uni-app**（APP + 微信小程序）—— 《本元养生技术架构定稿版》已写。
- 数据：先本地（uni-app 的本地存储，对应 Lovable 的 localStorage 键名，见 `docs/key-code-index.md` 第 8 节）；后续再接 Supabase。
- 若你有改动（比如先只做小程序、或换后端），在 `docs/本元养生技术架构定稿版.md` 里改清楚，并注明「当前实现以本文为准」。

### 2. 写一份「Lovable UI → 技术落地对照」（新建一页即可）

- **目的**：让 Cursor/Claude 在写 uni-app 时知道：Lovable 的每一块界面/流程，在 uni-app 里对应怎么做。
- **内容可以很简单**，例如一个表格：

| Lovable 侧（参考） | 在 uni-app 中的落地方式 |
|-------------------|--------------------------|
| 路由：React Router，路径 /、/assessment… | uni-app 的 pages.json + 页面路径，保持同一套路径名 |
| 页面：Index.tsx, Assessment.tsx… | 对应 pages/index、pages/assessment…，逻辑用 Vue 或你选的语法重写 |
| 数据：localStorage 键 benyuan_profile、benyuan_logs… | uni.setStorageSync / getStorageSync，键名保持一致（见 key-code-index 第 8 节） |
| 底部导航 BottomNav | uni-app 的 tabBar 或自定义 tabBar 组件 |
| 静心转场 /calm → /reflection | 同上，用页面路径 + 定时跳转实现 |

- 可以新建 `docs/Lovable_UI与uni-app落地对照.md`，把上面表格写进去，后面每实现一页就对照一次。  
- **不必写得很长**：先覆盖「路由/页面/存储/主流程」，细节在开发时再补。

做完这两点，再开始写代码，就不容易出现「文档说一套、实现做另一套」的问题。

---

## 三、用 Cursor 还是 Claude Code？建议先用 Cursor

- **Cursor**：你现在的环境，已经包含这个仓库、所有 docs、以及我们聊过的 Lovable 页面与流程。适合**直接在本仓里写 uni-app、按文档实现每一页**，问「根据 architecture.md 实现首页」即可。
- **Claude Code**：能力类似，但通常是另一个入口/环境；对你来说多一个地方要同步上下文，容易乱。

**建议**：下一步开发**优先用 Cursor**，在一个地方完成「文档 + 代码 + 对话」。等你在 Cursor 里把 uni-app 项目结构和前几页都跑通后，若遇到非常独立的任务（例如只跑脚本、只改后端），再考虑用 Claude Code 做补充。

---

## 四、建议的下一步操作顺序（新手可照做）

1. **定技术栈并写进文档**  
   打开 `docs/本元养生技术架构定稿版.md`，确认「客户端 = uni-app、先本地后 Supabase」等描述是否和你的决定一致；若有变化就改一句说明，保存。

2. **新建「Lovable UI → 技术落地」对照表**  
   新建 `docs/Lovable_UI与uni-app落地对照.md`，把「路由 / 页面 / 存储 / 主流程」的对应关系写进去（可先写上面表格那几行），保存。

3. **在 Cursor 里初始化 uni-app 项目**  
   在当前仓库里新建一个目录（例如 `app/` 或 `uni-app/`），用 HBuilderX 或 CLI 创建一个标准 uni-app 项目，放进该目录；或直接让 Cursor 根据官方模板生成。保证 Cursor 能打开并编辑这个 uni-app 工程。

4. **按页面顺序实现，并反复对照文档**  
   实现顺序建议：**首页（此刻）→ 新手引导/测评 → 炼体 → 食养 → 觉察/归元 → 设置**。每做一页前，让 Cursor 打开：
   - `docs/architecture.md`（流程与数据）
   - `docs/key-code-index.md`（页面与存储）
   - `docs/Lovable_UI与uni-app落地对照.md`（Lovable → uni-app 的对应）
   然后说：「根据这三个文档，实现首页（此刻），用 uni-app，先本地存储」。

5. **Lovable 的「代码」只当参考，不拷进仓**  
   不需要把 Lovable 的 React 代码拷到 GitHub；需要时可以把某一段（例如某页的布局或逻辑）粘贴到对话里，说「请按这个交互和逻辑，用 uni-app 实现一版」。

---

## 五、小结

| 问题 | 结论 |
|------|------|
| 要不要把 Lovable 同步到 GitHub？ | **不需要**。Lovable 只是 UI 与业务逻辑的参考。 |
| 怎么把参考原型的 UI 给 Cursor 用？ | 已经通过「贴代码 + 架构图 + key-code-index」对齐；之后若要补充，复制粘贴片段即可。 |
| 开发前要不要再更新产品/技术文档？ | **建议要**：确认技术栈 + 写一份「参考原型 → uni-app 落地对照」。 |
| 用 Cursor 还是 Claude Code？ | **建议先用 Cursor** 做完整实现，一个地方管文档和代码。 |

按上面顺序做，就可以在 Cursor 里安心用 uni-app 实现 APP + 微信小程序，并保证参考原型的 UI 和业务逻辑能合理落地。**项目名称**：本元养生 / BenYuan Wellness。若你愿意，我可以再帮你写一版 `docs/Lovable_UI与uni-app落地对照.md` 的初始内容（直接可粘贴进文件）。
