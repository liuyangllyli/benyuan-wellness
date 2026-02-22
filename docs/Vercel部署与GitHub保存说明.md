# 第一次：把 Cursor 的代码保存到 GitHub + 用 Vercel 部署

## 一、Cursor 里的内容要不要自己保存到 GitHub？

**要。** Cursor 不会自动帮你提交、推送到 GitHub。你在 Cursor 里改的代码只在你本机，**需要你自己「提交 + 推送」** 才会到 GitHub。

---

## 二、把当前项目保存到 GitHub（第一次）

### 1. 在 Cursor 里提交并推送

1. 左侧点 **「源代码管理」** 图标（或按 `Ctrl+Shift+G`）。
2. 在「更改」列表里会看到未提交的文件（如 `app/`、`docs/` 等）。
3. 在上方输入框写一句说明，例如：`首次提交：体质测评与部署配置`。
4. 点 **「提交」**（✓ 或 Commit）。
5. 再点 **「同步更改」** 或 **「推送到」**（Push），把提交推送到 GitHub。

若提示要配置 Git 用户，在终端执行（把名字和邮箱改成你的）：

```bash
git config --global user.name "你的名字"
git config --global user.email "你的邮箱@example.com"
```

若推送时提示「没有上游分支」，选 **「发布分支」** 或执行：

```bash
git push -u origin main
```

### 2. 到 GitHub 上确认

打开：**https://github.com/liuyangllyli/benyuan-wellness**  
能看到刚推送的 `app`、`docs` 等文件夹，说明已经保存到 GitHub。

---

## 三、用 Vercel 部署（第一次）

### 1. 注册 / 登录 Vercel

- 打开：**https://vercel.com**
- 点 **Sign Up**，选择 **Continue with GitHub**，用你的 GitHub 账号授权。

### 2. 从 GitHub 导入项目

1. 登录后点 **Add New… → Project**。
2. 在 **Import Git Repository** 里找到 **liuyangllyli/benyuan-wellness**，点 **Import**。

### 3. 配置构建设置（重要）

在 **Configure Project** 页面里：

| 项 | 填什么 |
|----|--------|
| **Root Directory** | 点 **Edit**，填 `app`（表示从仓库里的 `app` 文件夹开始构建）。 |
| **Framework Preset** | 选 **Other** 或 **Vite**（若没有 Vite 就选 Other）。 |
| **Build Command** | 填 `npm run build:h5` |
| **Output Directory** | 填 `dist/build/h5`（uni-app H5 默认输出目录） |
| **Install Command** | 留空或默认 `npm install` 即可 |

然后点 **Deploy**。

### 4. 等部署完成

一般 1～2 分钟。完成后会显示一个链接，例如：

**https://benyuan-wellness-xxx.vercel.app**

这个链接就是你的 H5 访问地址，可以发给自己或伙伴在手机/电脑打开。

### 5. 以后更新怎么同步

之后你在 Cursor 里改完代码：

1. 在 Cursor 里 **提交**（Commit）并 **推送到 GitHub**（Push）。
2. Vercel 会自动检测到 GitHub 更新并重新部署，过几分钟用同一个链接打开就是新版本。

---

## 四、小结

- **保存到 GitHub**：在 Cursor 里用「源代码管理」做 **提交 + 推送**，需要你自己操作。
- **Vercel 部署**：用 GitHub 账号登录 Vercel → 导入 `benyuan-wellness` → Root 填 `app`，Build 填 `npm run build:h5`，Output 填 `dist/build/h5` → Deploy，拿到链接即可。
