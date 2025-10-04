# 🥋 李小龙 AI 对话助手

**Be Water, My Friend**

一个功能完整的 AI 对话助手，采用李小龙哲学风格回复

## 🌟 功能特性

- 🤖 **AI 智能对话** - 基于火山方舟 API，支持多轮上下文
- ⚡ **流式输出** - 逐字显示回复，体验如ChatGPT般流畅
- 🎤 **语音识别** - 语音转文字，支持中文
- 🌐 **联网搜索** - 智能检测并自动搜索实时信息
- 📝 **Markdown渲染** - 支持代码块、列表、加粗等格式
- 🥋 **李小龙风格** - 独特的哲学化回复风格
- 🎨 **现代化界面** - 豆包/ChatGPT风格设计
- 📱 **移动端友好** - 完美适配手机和平板
- 🌓 **主题切换** - 支持深色/浅色主题
- 💬 **多对话管理** - 支持多个对话同时管理

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone <your-repo-url>
cd bruce-lee-ai-chat-new
```

### 2. 配置 API

**方法1：复制配置文件（推荐）**

```bash
# 复制配置模板
cp src/config/config.example.js src/config/config.local.js

# 编辑 config.local.js，填写你的 API 凭证
```

在 `config.local.js` 中填写：

```javascript
apiKey: '你的火山方舟API_Key',
endpointId: 'doubao-seed-1-6-flash-250828',

// 可选：配置搜索 API
search: {
    serperApiKey: '你的Serper_API_Key',  // 或其他搜索引擎
}
```

**方法2：使用 npm 脚本（可选）**

```bash
npm install
npm start  # 启动本地服务器 http://localhost:3000
```

### 3. 运行

双击 `src/index.html` 或使用本地服务器：

```bash
# Python
python -m http.server 8000

# Node.js  
npx serve src
```

### 3. 使用

#### 基本对话
1. 在输入框输入问题，按回车发送
2. AI会直接回答（不联网）

#### 联网搜索
1. 点击输入框下方的 **"联网搜索"** 按钮开启
2. 按钮变成 **"搜索已开启"** 表示已启用
3. 现在问实时问题会自动联网：
   - ✅ "今天天气怎么样？" → 自动搜索
   - ✅ "搜索最新AI新闻" → 自动搜索
   - ❌ "你是谁？" → 不搜索，直接回答
4. 再次点击按钮可关闭搜索

#### 其他功能
- 点击麦克风进行语音输入
- 点击月亮/太阳图标切换主题
- 点击侧边栏按钮管理多个对话

## 📖 详细文档

### 获取 API 凭证

#### 🔥 火山方舟 API（必填）

1. 访问 [火山方舟控制台](https://console.volcengine.com/ark)
2. 左侧菜单 → **API 密钥管理** → 创建API密钥
3. 左侧菜单 → **推理接入** → 复制Endpoint ID
4. 确保模型状态为"运行中"
5. 将凭证填入 `src/config/config.local.js`

#### 🔍 搜索引擎 API（可选）

选择以下任意一个即可：

- **Serper.dev**（推荐）：[注册](https://serper.dev) → 获取 API Key → 2500次/月免费
- **Tavily AI**（推荐）：[注册](https://tavily.com) → 获取 API Key → 1000次/月免费
- 不配置则使用免费的 DuckDuckGo（结果较少）

**⚠️ 安全提示**

- ✅ `config.local.js` 和 `.env` 已在 `.gitignore` 中，不会被 git 追踪
- ✅ 请勿将包含 API Key 的文件上传到公开仓库
- ✅ 参考 `config.example.js` 作为公开的配置模板

### 联网搜索配置

#### ⚡ 智能搜索触发

**重要**：联网搜索功能需要点击"联网搜索"按钮开启！

- ❌ **按钮关闭**（默认）：所有问题直接由AI回答，不联网
- ✅ **按钮开启**：智能判断问题是否需要搜索
  - 自动排除：问候语、自我介绍、写代码等明显不需要搜索的问题
  - 自动触发：包含"搜索"、"今天"、"天气"、"新闻"等关键词的问题
  - 快速响应：使用规则判断（<1ms），无额外API调用

#### 🔍 支持的搜索引擎

项目支持多个搜索引擎，**按优先级自动选择**：

| 搜索引擎 | 免费额度 | 优点 | 注册地址 |
|---------|---------|------|---------|
| **Serper.dev** ⭐ | 2500次/月 | Google搜索结果，稳定快速 | [注册](https://serper.dev) |
| **Tavily AI** ⭐ | 1000次/月 | 专为AI设计，自动提取内容 | [注册](https://tavily.com) |
| **Brave Search** | 无免费额度 | 隐私友好，质量好（$5/月起） | [注册](https://brave.com/search/api/) |
| **SerpAPI** | 100次/月 | 功能强大，支持多平台 | [注册](https://serpapi.com) |
| **DuckDuckGo** | 完全免费 | 无需配置，但结果有限 | 无需注册 |

**配置方法**：在 `config.local.js` 中填写任意一个API Key即可

```javascript
search: {
    serperApiKey: '你的API_KEY',  // Serper（推荐）
    tavilyApiKey: '你的API_KEY',  // 或 Tavily（推荐）
    // braveApiKey: '',
    // serpApiKey: '',
}
```

如果不配置任何API Key，系统会自动使用免费的DuckDuckGo。

## 🎨 自定义

### 修改AI风格

编辑 `config.local.js` 的 `systemPrompt`：

```javascript
ui: {
    systemPrompt: `你现在是XXX，你的特点是...`
}
```

### 修改主题色

编辑 `src/css/styles.css`：

```css
:root {
    --accent-color: #10a37f;  /* 改成你喜欢的颜色 */
}
```

## 🐛 故障排查

### API调用失败

1. 检查API Key和Endpoint ID是否正确
2. 确认模型状态为"运行中"
3. 打开F12查看详细错误信息

### 语音功能不可用

- 使用Chrome或Edge浏览器
- 允许麦克风权限
- 确保在HTTPS或localhost环境

## 📝 项目结构

```
bruce-lee-ai-chat/
├── src/
│   ├── index.html          # 主页面
│   ├── css/
│   │   └── styles.css      # 样式文件
│   ├── js/
│   │   └── app.js          # 主应用
│   └── config/
│       └── config.local.js # 配置文件
└── README.md               # 本文件
```

## 📄 许可证

MIT License

## 🙏 致谢

- 火山方舟 API 提供 AI 能力
- 李小龙先生的武术哲学启发

---

**⭐ 如果这个项目对你有帮助，请给个 Star！**

**Be water, my friend!** 🥋💧
