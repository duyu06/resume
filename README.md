# 张滨文｜AI 产品与技术作品集

基于 React、TypeScript、Vite、Tailwind CSS 和 Framer Motion 构建的个人简历与项目作品集网站。

## 本地运行

```bash
npm install
npm run dev
```

## 构建

```bash
npm run build
```

GitHub Pages 部署路径为 `/resume/`，配置见 `vite.config.ts`。

## MaxKB 智能问答接入

网站已内置 MaxKB 浮窗组件：

- 右下角显示“问问我的 AI 助手”；
- 桌面端以居中浮窗打开；
- 移动端以接近全屏的抽屉打开；
- 支持按 `Esc`、点击遮罩、关闭按钮退出；
- 支持在新窗口打开 MaxKB；
- 前端不保存 MaxKB API Key。

### 1. 在 MaxKB 中创建智能体

建议建立“张滨文 AI 简历助手”，并上传以下知识内容：

- PDF / Markdown 简历；
- 果漾 AI 多模态平台项目说明；
- AI 电商主图生成器需求与流程；
- RPA 自动化流程说明；
- 数字人模型微调评测文档；
- Open WebUI、本地推理与监控项目说明；
- 求职方向、意向城市和联系方式。

### 2. 获取嵌入地址

在 MaxKB 的智能体概览中打开“嵌入第三方”，复制全屏模式或公开访问地址。

### 3. 本地配置

复制 `.env.example` 为 `.env.local`：

```bash
cp .env.example .env.local
```

填写：

```env
VITE_MAXKB_EMBED_URL=https://your-maxkb.example.com/ui/chat/your-public-id
```

未配置该变量时，网站不会显示 MaxKB 浮窗入口。

### 4. GitHub Pages 配置

进入仓库：

`Settings → Secrets and variables → Actions → Variables`

创建仓库变量：

- Name：`MAXKB_EMBED_URL`
- Value：MaxKB 智能体公开访问或嵌入地址

部署工作流会将它注入为 `VITE_MAXKB_EMBED_URL`。

## 安全说明

MaxKB 公开访问地址可以放在前端环境变量中，但 API Key 不应提交到仓库，也不应直接用于浏览器请求。需要使用 API Key 自定义聊天界面时，应增加服务端代理或 Serverless Function。
