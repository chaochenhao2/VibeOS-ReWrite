# VibeOS — Windows XP 风格 AI 桌面

一个怀旧的 Web 桌面模拟器，外观和交互还原 Windows XP 的经典体验，并集成 AI 大模型驱动搜索和内容生成。

## 功能亮点

- 🖥️ **经典 XP 界面**：任务栏、开始菜单、系统托盘、Bliss 壁纸，像素级还原。
- 🔍 **AI 搜索引擎**：在开始菜单中打开搜索，输入任何问题，由大模型返回结构化结果列表（图标、标题、简介）。
- 🌐 **Internet Explorer 浏览器**：点击搜索结果，会打开一个完整的 IE 窗口，AI 自动生成详细文章，支持 Markdown 渲染。
- 🪟 **完整窗口管理**：窗口可拖拽、最大化、最小化、关闭，多窗口可叠放，任务栏按钮切换。
- ⏻ **关机/重启**：开始菜单中的关机会弹出确认对话框，模拟真正的关机动画，点击黑屏可“重新启动”。
- 🔒 **安全架构**：前端仅调用本地后端 API，API 密钥保存在 `.env` 中，不暴露到浏览器。

## 项目结构

```
VibeOS/
├── .env                 # 环境变量（AI 密钥、开关等）
├── package.json         # 项目依赖与启动脚本
├── server.js            # Express 后端，负责 AI 调用代理
└── public/
    └── index.html       # 前端 XP 界面（纯 HTML/CSS/JS）
```

## 快速开始

### 1. 安装依赖
确保已安装 Node.js (v16+)，然后在项目根目录执行：

```bash
npm install
```

### 2. 启动服务
```bash
npm start
```

访问 [http://localhost:3000](http://localhost:3000)，即可看到桌面。

### 3. 体验 AI 功能

- **默认状态**：`.env` 中 `ENABLE_AI=false`，系统使用内置模拟数据，所有交互均可完整演示。
- **启用真实 AI**：编辑 `.env`，将 `ENABLE_AI` 改为 `true` 并填入你的 API 配置：
  ```env
  ENABLE_AI=true
  API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
  API_URL=https://api.openai.com/v1/chat/completions
  API_MODEL=gpt-3.5-turbo
  ```
  重启服务，搜索和浏览器内容将由 AI 实时生成。

支持的 API 格式：**OpenAI Chat Completions** 兼容接口（包括 Azure OpenAI、本地部署的 oobabooga、vLLM 等）。

## 操作指南

- **开始菜单**：点击左下角绿色“开始”按钮。
  - **搜索**：打开搜索框，输入问题（如“What is Apple company”），等待 AI 返回结果。
  - **Internet Explorer**：打开一个空白 IE 窗口。
  - **关机**：弹出关机确认框。
- **搜索结果**：点击任意结果项，自动打开 IE 窗口并加载 AI 生成的详细内容。
- **窗口操作**：拖拽标题栏移动窗口，点击右上角按钮最小化/最大化/关闭。最小化的窗口会缩小到任务栏，点击即可恢复。
- **快捷键**：`F3` 或 `Ctrl+Shift+F` 快速打开搜索。

## 常见问题

**Q: 为什么不直接在前端调用 AI API？**  
A: 出于安全考虑，API 密钥不应暴露在客户端。后端代理模式只负责转发请求，密钥只存在于服务器 `.env` 中。

**Q: 支持其他大模型吗？**  
A: 只要兼容 OpenAI Chat Completions 格式即可。修改 `.env` 中的 `API_URL` 和 `API_MODEL` 即可切换。

**Q: 模拟数据可以自定义吗？**  
A: 可以，模拟数据逻辑在 `server.js` 的 `getMockSearchResults` 和 `getMockContent` 函数中，按需修改。

## 技术栈

- **前端**：原生 HTML/CSS/JS，无框架，Markdown 渲染使用 [marked](https://github.com/markedjs/marked)
- **后端**：Node.js + Express
- **AI 接口**：OpenAI Chat Completions (兼容)

---

*Windows XP 是微软公司的商标，本作品仅为怀旧风格模拟，不涉及任何商业用途。*
```
