# 本元养生（BenYuan Wellness）· Lovable UI 与 uni-app 落地对照

**项目名称**：本元养生（中文）/ BenYuan Wellness（英文）  
**用途**：实现 uni-app 时，对照「参考原型（Lovable/React）」与「uni-app 中怎么做」，避免遗漏或做错。

---

## 一、路由与页面

| Lovable 侧（参考） | 在 uni-app 中的落地方式 |
|-------------------|--------------------------|
| 路由：React Router，路径 `/`、`/assessment`、`/practice`… | `pages.json` 的 `pages` 与 `tabBar.list`，路径与 key-code-index 一致：`/pages/index/index`、`/pages/assessment/assessment`… |
| 页面：Index.tsx, Assessment.tsx, Practice.tsx… | 对应 `pages/index/index.vue`、`pages/assessment/assessment.vue`、`pages/practice/practice.vue`…，逻辑用 Vue3 重写 |
| 首页 `/` | `pages/index/index.vue`，作为 tabBar 第一项 |
| 新手引导 `/onboarding` | `pages/onboarding/onboarding.vue`，非 tabBar |
| 体质测评 `/assessment` | `pages/assessment/assessment.vue` |
| 炼体 `/practice` | `pages/practice/practice.vue`，tabBar |
| 食养 `/diet` | `pages/diet/diet.vue`，tabBar |
| 明理 `/knowledge` | `pages/knowledge/knowledge.vue`，tabBar |
| 归元 `/records` | `pages/records/records.vue`，tabBar |
| 觉察 `/reflection` | `pages/reflection/reflection.vue`，非 tabBar |
| 静心转场 `/calm` | `pages/calm/calm.vue`，练功后进入，约 5.5s 后跳转 `/reflection` |
| 设置 `/settings` | `pages/settings/settings.vue`，非 tabBar，目前仅首页入口 |

---

## 二、数据与存储

| Lovable 侧（参考） | 在 uni-app 中的落地方式 |
|-------------------|--------------------------|
| localStorage 键 `benyuan_profile`、`benyuan_logs`、`benyuan_plan`… | `uni.setStorageSync` / `uni.getStorageSync`，**键名完全一致**（见 `docs/key-code-index.md` 第 8 节） |
| 体质档案、觉察日志、练功计划、引导完成、设置 | 同上，键名：`benyuan_profile`、`benyuan_logs`、`benyuan_plan`、`benyuan_onboarded`、`benyuan_settings`、`benyuan_diet_feelings`、`benyuan_today` |

---

## 三、全局与导航

| Lovable 侧（参考） | 在 uni-app 中的落地方式 |
|-------------------|--------------------------|
| 底部导航 BottomNav，6 个 tab | `pages.json` 的 `tabBar` 配置 5～6 个 tab（首页、炼体、食养、明理、归元；设置通常不放进 tabBar，从首页进） |
| 部分路由隐藏底部导航（如 onboarding、calm） | 在对应页面隐藏 tabBar：`uni.hideTabBar()` / 或通过自定义 tabBar 按路由判断显隐 |
| 右下角悬浮「老师」入口 | 全局组件或 layout，在需要的页面引入，点击跳转问答或弹窗 |

---

## 四、流程与跳转

| Lovable 侧（参考） | 在 uni-app 中的落地方式 |
|-------------------|--------------------------|
| 首次打开 → 判断 `benyuan_onboarded` → 未完成进 `/onboarding` | 在 App.vue 或首页 onLaunch/onShow 里读 `benyuan_onboarded`，未完成则 `uni.reLaunch({ url: '/pages/onboarding/onboarding' })` |
| 练功后 → `/calm` → 约 5.5s 自动 → `/reflection` | 从炼体页「完成练习」后 `uni.navigateTo('/pages/calm/calm')`；calm 页用定时器 5.5s 后 `uni.redirectTo` 或 `navigateTo` 到 reflection |
| 静心转场 `/calm` 仅练功后使用 | 不放在 tabBar，仅由炼体页或完成练习入口跳转 |

---

## 五、实现时还要对照的文档

- **路由与页面列表、localStorage 键名**：`docs/key-code-index.md`（第 2 节页面、第 8 节键名）
- **用户主流程、数据写读关系**：`docs/architecture.md`
- **每页功能、数据读写、出口**：`docs/reference/每页功能与逻辑要点.md`

实现某一页时，把本文件与上述三个文档一起给 Cursor/AI，即可按「参考原型」在 uni-app 里一致落地。
