// 环境配置
export const config = {
  APP_NAME: "教学智能助手",
  API_GATEWAY_URL: "http://10.102.32.223:8080",
  VLLM_BASE_URL: "http://10.102.32.223:8000/v1",
  SDU_BASE_URL: "http://10.2.8.77:3000/v1",
  EMBEDDING_BASE_URL: "http://10.2.8.77:3000/v1/embeddings",
  ENABLE_DEV_PROXY: true,
  
  // 知识库路径
  KNOWLEDGE_BASE_PATH: "../知识库（仅按格式分类）"
};

export default config;

