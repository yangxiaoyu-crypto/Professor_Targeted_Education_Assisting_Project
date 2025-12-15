/**
 * 知识库API服务
 * 基于 api.js 扩展，调用后端向量数据库服务
 */
import axios from 'axios';

// 知识库服务地址
const KNOWLEDGE_SERVICE_URL = 'http://localhost:5001';

// 创建专用的axios实例
const knowledgeClient = axios.create({
  baseURL: KNOWLEDGE_SERVICE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 响应拦截器
knowledgeClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('Knowledge API Error:', error);
    return Promise.reject(error);
  }
);

/**
 * 知识库服务
 */
export const knowledgeService = {
  /**
   * 搜索知识库
   * @param {Object} params - 搜索参数
   * @param {string} params.query - 搜索关键词
   * @param {number} params.topK - 返回结果数量，默认3
   * @returns {Promise<Array>} 搜索结果列表
   */
  search: async ({ query, topK = 3 }) => {
    try {
      const response = await knowledgeClient.post('/api/knowledge/search', {
        query,
        top_k: topK,
      });
      return response.results || [];
    } catch (error) {
      console.error('知识库搜索失败:', error);
      throw error;
    }
  },

  /**
   * 获取知识库统计信息
   * @returns {Promise<Object>} 统计信息
   */
  getStats: async () => {
    try {
      const response = await knowledgeClient.get('/api/knowledge/stats');
      return response.stats || {};
    } catch (error) {
      console.error('获取知识库统计失败:', error);
      throw error;
    }
  },

  /**
   * 重建知识库索引
   * @returns {Promise<Object>} 重建结果
   */
  rebuildIndex: async () => {
    try {
      const response = await knowledgeClient.post('/api/knowledge/rebuild');
      return response;
    } catch (error) {
      console.error('重建知识库失败:', error);
      throw error;
    }
  },

  /**
   * 健康检查
   * @returns {Promise<boolean>} 服务是否可用
   */
  healthCheck: async () => {
    try {
      const response = await knowledgeClient.get('/health');
      return response.status === 'ok';
    } catch (error) {
      return false;
    }
  },
};

export default knowledgeService;
