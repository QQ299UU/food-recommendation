
# 🍜 美食推荐应用 - 免费部署教程

完全免费！无需信用卡！

---

## 📋 准备工作

你需要以下账号（都是免费的）：
1. **GitHub** 账号 - https://github.com
2. **Vercel** 账号 - https://vercel.com（前端托管）
3. **Render** 账号 - https://render.com（后端托管）

---

## 🚀 第一步：上传代码到 GitHub

### 1.1 安装 Git（如果还没有）
下载地址：https://git-scm.com/download/win

### 1.2 创建 GitHub 仓库
1. 打开 https://github.com/new
2. 仓库名：`food-recommendation`
3. 选择 **Public** 或 **Private**（都可以）
4. **不要**勾选 "Initialize this repository"
5. 点击 "Create repository"

### 1.3 上传代码
在项目目录打开 PowerShell 或 CMD，依次执行：

```bash
# 1. 初始化 Git
git init

# 2. 添加所有文件
git add .

# 3. 提交
git commit -m "initial commit"

# 4. 关联到你的 GitHub 仓库（替换为你的用户名）
git remote add origin https://github.com/你的用户名/food-recommendation.git

# 5. 推送到 GitHub
git branch -M main
git push -u origin main
```

---

## 🔧 第二步：部署后端到 Render

### 2.1 准备后端启动脚本
让我们修改 `package.json`，添加一个生产环境启动脚本：

在 `package.json` 的 `scripts` 部分添加：
```json
"start": "tsx api/server.ts"
```

### 2.2 部署到 Render
1. 登录 https://render.com
2. 点击 "New" → "Web Service"
3. 连接你的 GitHub 账号，选择 `food-recommendation` 仓库
4. 配置：
   - **Name**: `food-recommendation-api`（记住这个名字！）
   - **Region**: 选一个靠近你的（如 Singapore）
   - **Branch**: `main`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: 选择 **Free**
5. 点击 "Create Web Service"
6. 等待部署完成（约 2-5 分钟）

### 2.3 获取后端地址
部署成功后，你会看到一个地址，比如：
`https://food-recommendation-api.onrender.com`

**把这个地址复制下来，下一步要用！**

---

## 🎨 第三步：部署前端到 Vercel

### 3.1 配置前端 API 地址
打开 `src/lib/config.ts`，修改第二行：

```typescript
export const API_BASE_URL = 
  import.meta.env.VITE_API_URL || 
  (import.meta.env.DEV 
    ? 'http://localhost:3001' 
    : 'https://food-recommendation-api.onrender.com');
```

把 `https://food-recommendation-api.onrender.com` 替换成你 Render 的实际地址！

然后重新提交到 GitHub：
```bash
git add .
git commit -m "update api endpoint"
git push
```

### 3.2 部署到 Vercel
1. 登录 https://vercel.com
2. 点击 "New Project"
3. 导入你的 `food-recommendation` 仓库
4. 配置：
   - **Project Name**: `food-recommendation`
   - **Framework Preset**: `Vite`
   - **Root Directory**: 保持默认
   - **Environment Variables**（可选）：可以添加 `VITE_API_URL` 指向你的 Render 地址
5. 点击 "Deploy"
6. 等待部署完成（约 1-2 分钟）

### 3.3 完成！
部署成功后，你会得到一个类似这样的地址：
`https://food-recommendation.vercel.app`

这就是你的网站！🎉

---

## 📌 重要提示

### SQLite 的限制
Render 的免费方案文件系统是**临时的**（重启后数据会丢失）。

如果需要持久化数据，有两个选择：
1. 升级 Render 付费方案（$7/月起）
2. 改用 PostgreSQL（Render 也有免费的 PostgreSQL 数据库）

### 冷启动问题
Render 免费版如果 15 分钟没有请求会休眠，第一次访问可能需要 10-30 秒启动。

---

## 🎯 备选方案

### 如果不想用 Render，也可以用这些免费方案：
1. **Railway** - https://railway.app（有 500 小时/月免费）
2. **Cyclic** - https://www.cyclic.sh
3. **Fly.io** - https://fly.io（有免费额度）

---

## 💡 需要帮助？
如果遇到问题，检查：
1. GitHub 代码是否是最新的
2. Render 的部署日志（有红色错误提示）
3. Vercel 的部署日志

祝你部署顺利！🍜🎉

