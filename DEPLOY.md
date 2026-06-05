# 上线部署说明

这个项目已经准备成可以部署到 Vercel 的版本。

上线后会有两种保存模式：

- 云端同步：所有朋友打开同一个网址，会看到同一份内容库。
- 本机保存：如果还没连接 Vercel Blob，内容只保存在当前浏览器。

## 需要准备

1. 一个 Vercel 账号
2. 电脑有 Node.js / npm
3. 这个项目文件夹：`/Users/haombp14/Documents/Hao`

## 第一次部署

在终端进入项目文件夹：

```bash
cd /Users/haombp14/Documents/Hao
```

安装依赖：

```bash
npm install
```

登录 Vercel：

```bash
npx vercel login
```

部署到公网：

```bash
npx vercel --prod
```

部署完成后，Vercel 会给你一个公开网址，可以直接发给朋友。

## 开启云端记忆

为了让朋友看到同一份内容库，需要连接 Vercel Blob。

1. 打开 Vercel Dashboard
2. 进入这个项目
3. 找到 Storage
4. 创建或连接 Blob Store
5. 确认项目环境变量里有 `BLOB_READ_WRITE_TOKEN`
6. 重新部署一次：

```bash
npx vercel --prod
```

完成后，网站内容库会显示「云端同步已连接」。

## 使用方式

1. 打开公开网址
2. 在「内容库」新增产品或活动
3. 点击「保存到内容库」
4. 朋友刷新同一个网址后，会看到更新后的内容库
5. 再选择月份、活动和频率，生成整个月内容策划

## 注意

- 还没连接 Blob Store 时，网站仍可用，但只会本机保存。
- 连接 Blob Store 后，新增、编辑、删除内容都会保存到云端。
- 任何拿到网址的人都可以编辑内容库；如果之后需要，我可以再加密码保护。

## 用 GitHub Pages 开公开网址

GitHub Pages 可以免费开公开网页，但它只支持静态网页。

这代表：

- 朋友可以打开你的公开网址使用网站。
- 新增产品、编辑内容库仍然可以用。
- 内容会保存在每个人自己的浏览器。
- 如果要所有朋友共享同一份内容库，需要再接 Vercel Blob、Supabase、Firebase 或其他数据库。

### GitHub Pages 上传步骤

1. 打开 GitHub
2. 创建一个新的 repository，例如：`sothys-content-planner`
3. 上传整个项目文件夹里的文件
4. 到 repository 的 Settings
5. 打开 Pages
6. Source 选择 GitHub Actions
7. 回到 Actions，等待 `Deploy GitHub Pages` 跑完

完成后，网址通常会是：

```text
https://你的GitHub用户名.github.io/sothys-content-planner/
```

例如：

```text
https://zhenbeauty.github.io/sothys-content-planner/
```

如果你之后要共享同一份内容库，我建议使用 GitHub repository + Vercel 部署。GitHub 负责放代码，Vercel 负责公开网站和云端记忆。
