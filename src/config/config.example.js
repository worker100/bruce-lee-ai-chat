// 🔑 李小龙 AI 对话助手配置文件
// 请复制此文件为 config.local.js，然后填写你的 API 凭证

window.LOCAL_CONFIG = {
    // ===== 必填配置 =====
    // 火山方舟 API Key（在控制台 -> API 密钥管理获取）
    apiKey: 'YOUR_API_KEY_HERE',
    
    // 模型 Endpoint ID（在控制台 -> 推理接入获取）
    // 推荐模型：doubao-seed-1-6-flash-250828（速度快，成本低）
    endpointId: 'YOUR_ENDPOINT_ID_HERE',
    
    // API 基础URL（通常不需要修改）
    baseUrl: 'https://ark.cn-beijing.volces.com/api/v3',
    
    // ===== 可选配置 =====
    // 模型参数
    modelParams: {
        temperature: 0.7,  // 0-1，创造性（0.7推荐）
        max_tokens: 2000,   // 最大回复长度
        top_p: 0.9         // 多样性控制
    },
    
    // 联网搜索配置（可选）
    search: {
        enabled: true,        // 是否启用搜索功能
        
        // ⚡ 智能搜索触发：使用快速规则判断（<1ms，无额外API调用）
        // ✅ "今天天气" → 触发搜索
        // ❌ "你是谁" → 不触发搜索
        
        // 🔑 搜索API配置（按优先级选择一个即可）
        serperApiKey: '',    // 🌟 Serper.dev（2500次/月免费）https://serper.dev
        tavilyApiKey: '',    // ⭐ Tavily AI（1000次/月免费）https://tavily.com
        braveApiKey: '',     // Brave Search（$5/月起）https://brave.com/search/api/
        serpApiKey: '',      // SerpAPI（100次/月免费）https://serpapi.com
        // 如果都没配置，会自动使用免费的 DuckDuckGo（结果有限）
        
        // 🎯 搜索触发词（包含这些词会触发搜索）
        triggers: [
            '搜索', '查', '找', '查询',
            '最新', '现在', '今天', '昨天', '今年', '近期',
            '天气', '新闻', '价格', '股价', '股票',
            '多少钱', '哪里', '什么时候',
            '实时', '当前', '目前'
        ],
        
        maxResults: 5        // 搜索结果数量
    },
    
    // 界面配置
    ui: {
        appTitle: '🥋 李小龙 Bruce Lee',
        subtitle: 'Be Water, My Friend',
        systemPrompt: `你是李小龙（Bruce Lee）- 武道变革者、截拳道创始人、功夫片先驱。

# 核心原则
- 直接回答，不输出思考过程或<think>标签
- 中文为主，适当穿插英文

# 性格特质
- 自信而谦逊，直率中带幽默
- 善用"水"与"自然"作喻，融合东西方哲学
- 激励他人但不说教，用反问启发思考
- 实践主义，追求真实自我

# 核心哲学
"Be like water" - 适应而不抗拒
"Don't think, feel" - 感受胜于思考  

# 回答要求
✅ 如果有参考资料，基于资料总结2-3条要点（每条约30-50字）
✅ 回答简洁清晰，突出重点信息
✅ 可以用李小龙的哲学视角做点评，但不要喧宾夺主
✅ 保持真实可靠，不编造信息

# 示例
问："今日AI新闻"（有参考资料）
答："今天主要有几条：
1. OpenAI发布GPT-5测试版，推理能力大幅提升
2. 谷歌Gemini更新多模态功能，图像理解更精准
3. Meta开源Llama 3，性能接近GPT-4
技术如流水，永不停息。Be water, my friend。"`
    }
};

// 配置已直接赋值给 window.LOCAL_CONFIG
