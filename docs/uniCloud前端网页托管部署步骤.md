# uniCloud 前端网页托管 · 部署步骤（审核通过后）

你已在 uniCloud 开通服务空间 **benyuan-wellness**，且「前端网页托管」显示**已开通**。按下面步骤上传 H5 即可用国内网络访问。

---

## 第一步：本地打包 H5

在 Cursor 终端执行（在项目根目录或 `app` 目录下均可）：

```bash
cd app
npm run build:h5
```

看到 **DONE  Build complete.** 后，打包结果在：

**`C:\Users\liuya\Documents\GitHub\benyuan-wellness\app\dist\build\h5`**

用资源管理器打开该文件夹，确认里面有 **index.html** 和 **assets**、**static** 等子文件夹（或类似结构）。

---

## 第二步：打开 uniCloud 前端网页托管

1. 浏览器打开：**https://unicloud.dcloud.net.cn**
2. 登录后，在 **服务空间列表** 里点击你的服务空间 **benyuan-wellness**（不要点「变配」「详情」，要点空间名称进入）。
3. 进入该空间后，在左侧菜单找到并点击 **「前端网页托管」**。

---

## 第三步：上传打包好的文件

1. 在「前端网页托管」页面，找到 **上传** 或 **上传文件/上传目录** 的入口。
2. 选择 **上传目录**（或「上传文件夹」）：
   - 选中的目录必须是 **`app\dist\build\h5`** 这一层，即**根目录下直接是 index.html** 的那一层。
3. 上传时若提示「是否包含根目录」：
   - 选 **不包含根目录** 或 **只上传子内容**，保证上传后托管根目录下就是 index.html。
4. 上传完成后，页面会显示**默认域名**（测试域名），形如 `https://xxx.bspapp.com` 或类似。  
   **该链接即为你的 H5 访问地址**，用国内网络在手机或电脑浏览器打开即可。

---

## 第四步：以后更新怎么同步

每次改完代码并想更新线上版本时：

1. 在 Cursor 里执行：`cd app` → `npm run build:h5`
2. 打开 uniCloud 控制台 → 服务空间 benyuan-wellness → 前端网页托管
3. **先删除**之前上传的旧文件（或使用「覆盖上传」），再**重新上传** `app\dist\build\h5` 下的全部内容。

---

## 小结

| 步骤 | 操作 |
|------|------|
| 1 | 本地 `cd app` → `npm run build:h5` |
| 2 | 打开 unicloud.dcloud.net.cn → 进入服务空间 benyuan-wellness → 前端网页托管 |
| 3 | 上传目录 `app\dist\build\h5`（根目录为 index.html 的那一层） |
| 4 | 用控制台显示的默认域名在手机/电脑访问 |

若控制台里「前端网页托管」的界面与上述描述不一致（例如没有「上传目录」只有「上传文件」），可逐文件选中 `h5` 目录下所有内容后上传，或截图当前页面再对照调整。
