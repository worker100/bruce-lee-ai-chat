# 🔐 安全指南

## ⚠️ 上传到 GitHub 前的安全检查清单

### ✅ 已完成的安全措施

- [x] **`.gitignore` 已配置**：自动忽略包含密钥的文件
- [x] **`config.local.js` 被忽略**：包含你的真实 API Key
- [x] **`.env` 被忽略**：环境变量文件不会上传
- [x] **`config.example.js` 已创建**：公开的配置模板

### 📋 上传前验证步骤

#### 1. 验证敏感文件被忽略

```bash
# 运行此命令，确保输出显示这些文件被忽略
git check-ignore -v src/config/config.local.js
git check-ignore -v .env

# 预期输出类似：
# .gitignore:2:src/config/config.local.js    src/config/config.local.js
# .gitignore:3:.env    .env
```

#### 2. 检查待提交文件

```bash
git status

# 确保以下文件 **不在** 列表中：
# ❌ src/config/config.local.js
# ❌ .env
# ❌ 任何包含 API Key 的文件
```

#### 3. 检查文件内容（最终确认）

```bash
# 搜索所有待提交文件中是否包含真实的 API Key
git add .
git diff --cached | grep -i "your_api_key_here"   # 替换为你的 API Key 的一部分

# 如果有输出，说明密钥泄漏了！立即停止并检查！
```

## 🚨 如果不小心上传了密钥

### 立即行动步骤

1. **撤销 Git 历史中的敏感信息**
   ```bash
   # 从 Git 历史中完全删除文件
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch src/config/config.local.js" \
     --prune-empty --tag-name-filter cat -- --all
   
   # 强制推送（如果已经推送到 GitHub）
   git push origin --force --all
   ```

2. **立即更换所有泄漏的 API Key**
   - 火山方舟：删除旧 API Key，创建新的
   - Serper.dev：重新生成 API Key
   - Tavily AI：重新生成 API Key

3. **检查 GitHub 泄漏记录**
   - 即使删除了文件，GitHub 可能仍有缓存
   - 考虑将仓库设为私有或删除后重新创建

## 📁 安全的文件结构

### ✅ 会上传到 GitHub（公开安全）

```
bruce-lee-ai-chat-new/
├── .gitignore                    ✅ 忽略规则
├── README.md                     ✅ 项目说明
├── SECURITY.md                   ✅ 安全指南
├── package.json                  ✅ 依赖配置
├── src/
│   ├── index.html                ✅ 主页面
│   ├── css/styles.css            ✅ 样式
│   ├── js/app.js                 ✅ 应用代码
│   └── config/
│       └── config.example.js     ✅ 配置模板（不含真实密钥）
```

### ❌ 不会上传到 GitHub（包含密钥）

```
bruce-lee-ai-chat-new/
├── .env                          ❌ 环境变量（包含密钥）
└── src/config/
    └── config.local.js           ❌ 本地配置（包含真实密钥）
```

## 🔒 最佳实践

1. **双重检查**：上传前总是运行 `git status` 和 `git diff --cached`
2. **使用工具**：安装 [git-secrets](https://github.com/awslabs/git-secrets) 自动检测密钥
3. **环境隔离**：开发/测试/生产使用不同的 API Key
4. **定期轮换**：每3-6个月更换一次 API Key
5. **权限最小化**：为不同项目使用独立的 API Key

## 📞 紧急联系方式

- 火山方舟控制台：https://console.volcengine.com/ark
- GitHub 安全建议：https://docs.github.com/en/authentication/keeping-your-account-and-data-secure

---

**Remember: 一旦密钥泄漏，即使删除也可能被他人获取。预防永远好于补救！**

