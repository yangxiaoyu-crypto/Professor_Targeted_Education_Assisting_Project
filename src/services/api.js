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

// 本地 LLM API (使用服务器的模型)
export const llmService = {
  // 调用 DeepSeek 或其他模型
  generate: async (prompt, options = {}) => {
    try {
      const response = await axios.post(
        `${config.VLLM_BASE_URL}/chat/completions`,
        {
          model: options.model || 'deepseek-chat',
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
          max_tokens: options.maxTokens || 2000,
        },
        {
          headers: {
            'Content-Type': 'application/json',
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
      const response = await fetch(`${config.VLLM_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: options.model || 'deepseek-chat',
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

export default apiClient;

