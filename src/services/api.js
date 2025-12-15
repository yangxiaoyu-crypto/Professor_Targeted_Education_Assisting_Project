import axios from 'axios';
import config from '../config/env';

// 创建 axios 实例
const apiClient = axios.create({
  baseURL: config.ENABLE_DEV_PROXY ? '/api' : config.API_GATEWAY_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    // 可以在这里添加token等认证信息
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// AI 服务 API
export const aiService = {
  // 生成课程大纲
  generateSyllabus: async (courseInfo) => {
    return apiClient.post('/generate-syllabus', courseInfo);
  },

  // 参与式学习方案
  generateParticipativeLearning: async (data) => {
    return apiClient.post('/participative-learning', data);
  },

  // 学习目标撰写
  generateLearningObjectives: async (data) => {
    return apiClient.post('/learning-objectives', data);
  },

  // 学生评估方案
  generateAssessment: async (data) => {
    return apiClient.post('/student-assessment', data);
  },

  // 课程思政内容
  generateIdeologicalContent: async (data) => {
    return apiClient.post('/ideological-education', data);
  },

  // 课程比较
  compareCourses: async (courses) => {
    return apiClient.post('/compare-courses', { courses });
  },

  // 优化建议
  getOptimizationSuggestions: async (syllabusId) => {
    return apiClient.get(`/optimization-suggestions/${syllabusId}`);
  },

  // 聊天对话
  chat: async (message, context) => {
    return apiClient.post('/chat', { message, context });
  },
};

// 本地 LLM API (使用火山方舟豆包)
export const llmService = {
  // 调用火山方舟豆包模型
  generate: async (prompt, options = {}) => {
    try {
      const response = await axios.post(
        `${config.ARK_BASE_URL}/chat/completions`,
        {
          model: config.ARK_MODEL_ID, // 使用火山方舟模型ID
          messages: [
            {
              role: 'system',
              content: options.systemPrompt || '你是一个专业的教学设计助手，帮助大学教授设计课程和教学活动。',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: options.temperature || 0.7,
          max_tokens: options.maxTokens || 8000, // 增加到8000，确保课程大纲等长内容能完整生成
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.ARK_API_KEY}`, // 添加火山方舟认证
          },
        }
      );
      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('LLM API Error:', error);
      throw error;
    }
  },

  // 流式生成
  streamGenerate: async (prompt, options = {}, onChunk) => {
    try {
      // 调试日志
      console.log('🔑 API配置检查:', {
        baseUrl: config.ARK_BASE_URL,
        modelId: config.ARK_MODEL_ID,
        hasApiKey: !!config.ARK_API_KEY,
        apiKeyPrefix: config.ARK_API_KEY?.substring(0, 8) + '...',
      });

      const requestBody = {
        model: config.ARK_MODEL_ID, // 使用火山方舟模型ID
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
        max_tokens: options.maxTokens || 8000, // 增加到8000，确保课程大纲等长内容能完整生成
        stream: true,
      };

      console.log('📤 发送请求:', {
        url: `${config.ARK_BASE_URL}/chat/completions`,
        model: requestBody.model,
        messageCount: requestBody.messages.length,
      });

      const response = await fetch(`${config.ARK_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.ARK_API_KEY}`, // 添加火山方舟认证
        },
        body: JSON.stringify(requestBody),
      });

      console.log('📥 响应状态:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API错误响应:', errorText);
        throw new Error(`API请求失败 (${response.status}): ${errorText}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = ''; // 缓存不完整的数据
      let chunkCount = 0;

      console.log('📖 开始读取流式数据...');

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          console.log('✅ 流式数据读取完成，共接收', chunkCount, '个数据块');
          break;
        }

        // 将新数据追加到缓冲区
        buffer += decoder.decode(value, { stream: true });
        
        // 按行分割
        const lines = buffer.split('\n');
        
        // 保留最后一行（可能不完整）
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (!trimmedLine || !trimmedLine.startsWith('data: ')) continue;

          const data = trimmedLine.slice(6);
          if (data === '[DONE]') {
            console.log('🏁 收到结束标记');
            continue;
          }

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices[0]?.delta?.content;
            if (content) {
              chunkCount++;
              if (chunkCount <= 3) {
                console.log('📝 收到内容块:', content.substring(0, 50));
              }
              if (onChunk) {
                onChunk(content);
              }
            }
          } catch (e) {
            console.warn('⚠️ 解析流数据失败:', e.message, '原始数据:', data.substring(0, 100));
          }
        }
      }
    } catch (error) {
      console.error('Stream API Error:', error);
      throw error;
    }
  },
};

export default apiClient;

