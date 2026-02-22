# 本元养生（BenYuan Wellness）项目文档索引

**项目名称**：本元养生（中文）/ BenYuan Wellness（英文）  
**用途**：本仓库为 Cursor 侧实现 APP + 微信小程序的唯一文档与代码来源；所有总结文档与参考均存放于此，新开 Chat 时可直接引用本目录。

---

## 一、必读（落地基石）

| 文档 | 说明 |
|------|------|
| [定稿文件清单.md](./定稿文件清单.md) | **定稿文件清单**：当前已定稿的全部文件一览（本清单） |
| [本元养生_技术架构说明.md](./本元养生_技术架构说明.md) | **技术架构**：uni-app、Supabase、规则在代码中实现；含技术架构流程图（系统分层、规则与内容、匿名迁移） |
| [architecture.md](./architecture.md) | **产品架构**：用户主流程、数据架构、组件依赖、AI 接口契约、数据飞轮、关键文件索引（6 张 Mermaid） |
| [key-code-index.md](./key-code-index.md) | **关键代码索引**：路由/页面/组件/lib/设计系统/文档路径及 localStorage 键名（实现时对照用） |

---

## 二、产品与设计

| 文档 | 说明 |
|------|------|
| [本元养生_V0与Lovable_提示词手册.md](./本元养生_V0与Lovable_提示词手册.md) | 产品提示词手册（原供 V0/Lovable 生成 UI 原型） |
| [本元养生产品架构说明书_供V0与Lovable用.md](./本元养生产品架构说明书_供V0与Lovable用.md) | 产品架构说明书（UI 呈现原则与各页必备要素） |
| [本元养生技术架构定稿版.md](./本元养生技术架构定稿版.md) | 技术架构定稿（规则方案 B、数据表、匿名迁移等） |

---

## 三、参考原型与落地

| 文档 | 说明 |
|------|------|
| [Cursor新手开发指南.md](./Cursor新手开发指南.md) | **新手必读**：在 Cursor 里用 uni-app 开发的步骤、每页如何引用文档、实现顺序与提交建议 |
| [Lovable_UI与uni-app落地对照.md](./Lovable_UI与uni-app落地对照.md) | **落地对照**：Lovable 路由/存储/导航在 uni-app 中的对应写法（实现时与 key-code-index 一起用） |
| [reference/每页功能与逻辑要点.md](./reference/每页功能与逻辑要点.md) | **参考原型**：各页功能、数据读写、入口出口、逻辑要点（实现 uni-app 时按此还原） |
| [reference/README.md](./reference/README.md) | 参考目录说明（UI 与业务逻辑参考来源与用法） |
| [本元养生_架构与流程图.md](./本元养生_架构与流程图.md) | 与 architecture.md 内容一致，便于多处引用 |

---

## 四、协作与历史（发给外部或存档）

| 文档 | 说明 |
|------|------|
| [发给Lovable_架构与流程图核对说明.md](./发给Lovable_架构与流程图核对说明.md) | 与参考原型方核对架构与流程图的说明及回复记录 |
| [发给Lovable_关键代码需求说明.md](./发给Lovable_关键代码需求说明.md) | 关键代码需求与回复记录 |
| [Lovable与Cursor交接说明_与下一步开发建议.md](./Lovable与Cursor交接说明_与下一步开发建议.md) | 交接结论与下一步开发建议（命名、文档、GitHub 同步等） |

---

## 五、规范与操作

| 文档 | 说明 |
|------|------|
| [何时与GitHub同步.md](./何时与GitHub同步.md) | 何时提交、推送、与 GitHub 同步的简要指南 |

---

## 新开 Chat 时建议

1. 说明项目：**本元养生（BenYuan Wellness）**，实现 APP + 微信小程序，技术栈 uni-app。
2. **新手第一次开发**：先读 `@docs/Cursor新手开发指南.md`，按其中顺序初始化 uni-app 再逐页实现。
3. 引用文档：`@docs/README.md` 或直接 `@docs/本元养生_技术架构说明.md`、`@docs/architecture.md`、`@docs/key-code-index.md`。
4. 实现某页时：同时打开 `docs/architecture.md`、`docs/key-code-index.md`、`docs/Lovable_UI与uni-app落地对照.md`，以及 `docs/reference/每页功能与逻辑要点.md` 对应章节。
