# 本元养生（BenYuan Wellness）· uni-app

Vue3 + uni-app，一套代码支持 **APP** 与 **微信小程序**，当前阶段以本地存储为主。

## 与文档对应

- **路由 / 页面**：与 `docs/key-code-index.md`、`docs/architecture.md` 一致。
- **tabBar**：此刻 → 知己 → 炼体 → 食养 → 明理 → 归元（6 个 tab，与 Lovable 一致；第一屏为首页·此刻）。
- **本地存储键名**：见 `docs/key-code-index.md` 第 8 节（如 `benyuan_profile`、`benyuan_logs` 等）。

## 开发

```bash
cd app
npm install
npm run dev:h5        # H5
npm run dev:mp-weixin # 微信小程序（需微信开发者工具）
```

## 目录说明

- `src/pages.json`：页面列表与 tabBar 配置（6 个 tab + 6 个非 tab 页）。
- `src/pages/index/`：首页·此刻（第一屏）；首次打开未引导时自动跳转 onboarding。
- `src/pages/assessment/`、`practice/`、`diet/`、`knowledge/`、`records/`：知己、炼体、食养、明理、归元。
- `src/pages/onboarding/`、`reflection/`、`calm/`、`settings/`、`practice-plan/`、`notfound/`：新手引导、觉察、静心转场、设置、炼体计划、404。
- `src/static/tabbar/`：tabBar 图标占位，后续可替换为设计稿图标。
- `docs/实现计划.md`：与 Lovable 一致的实现顺序与路由对照，便于在 Cursor 中逐页打磨。

更多产品与技术约定见仓库根目录 `docs/`。
