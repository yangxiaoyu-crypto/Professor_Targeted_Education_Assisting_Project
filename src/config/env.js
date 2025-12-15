// 环境配置
export const config = {
  APP_NAME: "教学智能助手",
  
  // 火山方舟豆包 API 配置（当前使用）
  ARK_API_KEY: import.meta.env.VITE_ARK_API_KEY,
  ARK_MODEL_ID: import.meta.env.VITE_ARK_MODEL_ID || "doubao-seed-1-6-250615",
  ARK_BASE_URL: import.meta.env.VITE_ARK_BASE_URL || "https://ark.cn-beijing.volces.com/api/v3",
  
  // 原学校服务器配置（备用）
  API_GATEWAY_URL: "http://10.102.32.223:8080",
  VLLM_BASE_URL: "http://10.102.32.223:8000/v1",
  SDU_BASE_URL: "http://10.2.8.77:3000/v1",
  EMBEDDING_BASE_URL: "http://10.2.8.77:3000/v1/embeddings",
  ENABLE_DEV_PROXY: false, // 改为 false，因为现在直接调用火山方舟
  
  // 知识库路径
  KNOWLEDGE_BASE_PATH: "../知识库（仅按格式分类）"
};

export default config;

