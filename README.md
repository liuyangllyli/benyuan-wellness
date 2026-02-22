# 本元养生（BenYuan Wellness）

**项目名称**：本元养生（中文）/ BenYuan Wellness（英文）

基于传统中医理论的健康管理应用，支持 APP + 微信小程序（uni-app），涵盖体质测评、炼体、食养、觉察与归元记录等闭环。

---

## 文档与实现

- **所有项目文档与落地说明**见 **[docs/](./docs/)**，新开 Chat 时请优先引用 **[docs/README.md](./docs/README.md)** 获取文档索引。
- **技术架构**：见 [docs/本元养生_技术架构说明.md](./docs/本元养生_技术架构说明.md)（uni-app、Supabase、规则在代码中实现）。
- **产品架构与流程**：见 [docs/architecture.md](./docs/architecture.md)。
- **关键代码索引与本地存储键名**：见 [docs/key-code-index.md](./docs/key-code-index.md)。

---

## 当前状态

- 本仓库为 **Cursor 侧实现** 的文档与代码库；参考原型（Web 版）的 UI 与业务逻辑已整理在 `docs/` 与 `docs/reference/`，用于在 uni-app 中还原。
- 技术栈（目标）：**uni-app**（客户端）+ **Supabase**（后端，MVP）；规则逻辑在代码中实现，Excel 仅作设计对照。

---

## 快速开始（当前仓若为 React 演示）
    
若当前仓库仍为旧版 React 演示，可先查阅文档后再初始化 uni-app 工程（见 [docs/Lovable与Cursor交接说明_与下一步开发建议.md](./docs/Lovable与Cursor交接说明_与下一步开发建议.md)）。

```bash
npm install
npm run dev
```

---

**何时与 GitHub 同步**：见 [docs/何时与GitHub同步.md](./docs/何时与GitHub同步.md)。
