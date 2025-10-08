# API配置说明

## 当前情况

项目已经开发完成，但需要配置AI大模型API才能使用。由于项目需求中提到使用DeepSeek等大模型，您需要选择一种API方案。

## 🚀 推荐方案（按难度排序）

### 方案一：使用DeepSeek API（推荐）✨

**优点**：
- 价格便宜
- 中文效果好
- 有免费额度
- 项目需求中提到

**步骤**：

1. **注册DeepSeek账号**
   - 访问：https://platform.deepseek.com/
   - 注册账号并登录

2. **获取API密钥**
   - 进入API Keys页面
   - 创建新的API Key
   - 复制保存API Key

3. **修改配置**

编辑 `src/config/env.js`：
```javascript
export const config = {
  APP_NAME: "教学智能助手",
  
  // DeepSeek配置
  DEEPSEEK_API_KEY: "sk-xxxxxxxxxxxxxxxx", // 填入您的API Key
  DEEPSEEK_BASE_URL: "https://api.deepseek.com/v1",
  
  // 或使用环境变量（更安全）
  // API_KEY: import.meta.env.VITE_DEEPSEEK_API_KEY,
  
  KNOWLEDGE_BASE_PATH: "../知识库（仅按格式分类）"
};
```

4. **修改API调用**

编辑 `src/services/api.js`，将 `llmService.generate` 函数修改为：
```javascript
export const llmService = {
  generate: async (prompt, options = {}) => {
    try {
      const response = await axios.post(
        `https://api.deepseek.com/v1/chat/completions`,
        {
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: options.systemPrompt || '你是一个专业的教学设计助手。',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: options.temperature || 0.7,
          max_tokens: options.maxTokens || 2000,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.DEEPSEEK_API_KEY}`,
          },
        }
      );
      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('DeepSeek API Error:', error);
      throw error;
    }
  },
  
  // ... 其他代码保持不变
};
```

---

### 方案二：使用OpenAI API

**优点**：
- 效果好
- 文档完善
- 社区支持多

**缺点**：
- 需要国际信用卡
- 价格较贵

**配置**：
```javascript
// src/config/env.js
export const config = {
  OPENAI_API_KEY: "sk-xxxxxxxxxxxxxxxx",
  OPENAI_BASE_URL: "https://api.openai.com/v1",
};

// src/services/api.js 修改为调用OpenAI API
```

---

### 方案三：使用国内大模型API

#### 3.1 百度文心一言
- 网址：https://cloud.baidu.com/product/wenxinworkshop
- 有免费额度
- 中文效果好

#### 3.2 阿里通义千问
- 网址：https://help.aliyun.com/zh/dashscope/
- 有免费额度

#### 3.3 智谱清言（GLM）
- 网址：https://open.bigmodel.cn/
- 有免费额度

**配置方式类似DeepSeek**

---

### 方案四：本地部署大模型（高级）

**适合情况**：
- 有服务器资源
- 需要数据隐私
- 长期大量使用

**需要**：
1. GPU服务器（推荐4090或A100）
2. 部署Ollama或vLLM
3. 下载开源模型（Qwen、Llama等）

**步骤**：
```bash
# 1. 安装Ollama
curl -fsSL https://ollama.com/install.sh | sh

# 2. 下载模型
ollama pull qwen2.5:14b

# 3. 启动服务
ollama serve

# 4. 修改前端配置指向本地
# http://localhost:11434/v1
```

---

## 📝 快速开始（使用DeepSeek）

### 1. 获取API Key
访问 https://platform.deepseek.com/ 注册并获取API Key

### 2. 创建环境变量文件
在项目根目录创建 `.env.local` 文件：
```
VITE_DEEPSEEK_API_KEY=sk-your-api-key-here
```

### 3. 修改配置文件
编辑 `src/config/env.js`：
```javascript
export const config = {
  APP_NAME: "教学智能助手",
  DEEPSEEK_API_KEY: import.meta.env.VITE_DEEPSEEK_API_KEY,
  DEEPSEEK_BASE_URL: "https://api.deepseek.com/v1",
  KNOWLEDGE_BASE_PATH: "../知识库（仅按格式分类）"
};
```

### 4. 更新API服务
编辑 `src/services/api.js`，修改调用地址为DeepSeek API

### 5. 启动项目
```bash
npm install
npm run dev
```

---

## 🔒 安全提示

1. **不要将API Key提交到Git**
   - 使用环境变量
   - .env.local 已在 .gitignore 中

2. **API Key保护**
   ```javascript
   // ✅ 正确：使用环境变量
   const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY;
   
   // ❌ 错误：硬编码在代码中
   const apiKey = "sk-xxxxxxxxxxxx";
   ```

3. **限制API使用**
   - 在API平台设置使用限额
   - 监控API调用情况

---

## 💰 费用说明

### DeepSeek价格（参考）
- 输入：¥1 / 1M tokens
- 输出：¥2 / 1M tokens
- 新用户有免费额度

### 预估成本
- 生成一次课程大纲：约 0.05-0.1元
- 一天使用50次：约 2.5-5元
- 一个月：约 75-150元

---

## 🛠️ 代码修改示例

### 完整的api.js修改（DeepSeek版本）

```javascript
import axios from 'axios';
import config from '../config/env';

export const llmService = {
  generate: async (prompt, options = {}) => {
    try {
      const response = await axios.post(
        'https://api.deepseek.com/v1/chat/completions',
        {
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: options.systemPrompt || '你是一个专业的教学设计助手。',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: options.temperature || 0.7,
          max_tokens: options.maxTokens || 2000,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_DEEPSEEK_API_KEY}`,
          },
        }
      );
      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  streamGenerate: async (prompt, options = {}, onChunk) => {
    try {
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: options.systemPrompt || '你是一个专业的教学设计助手。',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: options.temperature || 0.7,
          max_tokens: options.maxTokens || 2000,
          stream: true,
        }),
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter((line) => line.trim() !== '');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices[0]?.delta?.content;
              if (content && onChunk) {
                onChunk(content);
              }
            } catch (e) {
              console.error('Parse error:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('Stream API Error:', error);
      throw error;
    }
  },
};

export default llmService;
```

---

## ✅ 检查清单

配置完成后，确认：

- [ ] 已获取API Key
- [ ] 已创建 .env.local 文件
- [ ] 已修改 src/config/env.js
- [ ] 已更新 src/services/api.js
- [ ] 已运行 npm install
- [ ] 已测试API调用是否成功

---

## 🐛 常见问题

### Q1: API调用失败
**检查**：
- API Key是否正确
- 网络是否可访问API
- 是否有余额/配额

### Q2: 流式输出不工作
**检查**：
- API是否支持stream模式
- fetch API是否正确处理
- 浏览器兼容性

### Q3: CORS错误
**解决**：
- 使用Vite的proxy功能
- 或在后端添加CORS头

---

## 📞 获取帮助

1. **API文档**：
   - DeepSeek: https://platform.deepseek.com/docs
   - OpenAI: https://platform.openai.com/docs

2. **项目文档**：
   - README.md
   - 使用说明.md

3. **联系支持**

---

**配置完成后，您的教学智能助手就可以正常使用了！** 🎓

