# VibeOS-ReWrite — Windows XP 风格 AI 桌面

一个怀旧的 Web 桌面模拟器，外观和交互还原 Windows XP 的经典体验，集成 AI 大模型驱动的搜索与实时 HTML 页面生成。

## 功能亮点

- 🖥️ **经典 XP 界面**：任务栏、开始菜单、系统托盘、Bliss 壁纸，像素级还原。
- 🔍 **AI 搜索**：在开始菜单中打开搜索，由大模型返回结构化结果列表。
- 🌐 **AI 生成 HTML 页面**：点击搜索结果或输入指令，AI 流式生成完整可交互的 HTML 页面，在 XP 风格窗口中展示。
- 🪟 **完整窗口管理**：窗口可拖拽、最大化、最小化、关闭，多窗口叠放，任务栏按钮切换。
- ⏻ **关机动画**：XP 风格关机确认对话框与关机动画。
- 🔒 **安全架构**：API 密钥保存在 `.env` 中，后端代理转发，不暴露到浏览器。

## 项目结构

```
VibeOS-ReWrite/
├── .env                 # 环境变量（AI 密钥、开关等）
├── package.json         # 项目依赖与启动脚本
├── server.js            # Express 后端，负责 AI 调用代理
└── public/
    └── index.html       # 前端 XP 界面（纯 HTML/CSS/JS）
```

## 快速开始

### 1. 安装依赖
```bash
npm install
```

### 2. 启动服务
```bash
npm start
```
访问 http://localhost:3000 即可看到桌面。

### 3. 启用 AI 功能
编辑 `.env`，配置你的 API 信息后重启服务：

```env
ENABLE_AI=true
API_KEY=sk-your-key
API_URL=https://your-api-endpoint/v1/chat/completions
API_MODEL=your-model
```

支持任何 OpenAI Chat Completions 兼容接口。

## 操作指南

- **开始菜单**：点击左下角绿色"开始"按钮 → 搜索 / 关机
- **搜索**：输入问题，AI 返回结果列表，点击打开 HTML 窗口
- **窗口操作**：拖拽标题栏移动，右上角最小化/最大化/关闭
- **输入指令**：在窗口底部输入框输入指令，AI 实时更新页面内容

## 技术栈

- **前端**：原生 HTML/CSS/JS，零依赖
- **后端**：Node.js + Express + dotenv
- **AI 接口**：OpenAI Chat Completions（兼容），流式生成

---

*Windows XP 是微软公司的商标，本作品仅为怀旧风格模拟，不涉及任何商业用途。*
```
