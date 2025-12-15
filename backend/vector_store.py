"""
向量数据库管理 - 使用ChromaDB
"""
import os
from typing import List, Dict, Optional

# 设置Hugging Face镜像（必须在导入模型库之前）
os.environ['HF_ENDPOINT'] = 'https://hf-mirror.com'

import chromadb
from sentence_transformers import SentenceTransformer


class VectorStore:
    """向量数据库管理类"""
    
    def __init__(self, persist_directory="./chroma_db", collection_name="knowledge_base"):
        """
        初始化向量数据库
        
        Args:
            persist_directory: 数据库持久化目录
            collection_name: 集合名称
        """
        self.persist_directory = persist_directory
        self.collection_name = collection_name
        
        # 初始化ChromaDB客户端（使用新接口 PersistentClient）
        self.client = chromadb.PersistentClient(path=persist_directory)
        
        # 加载中文embedding模型
        print("加载embedding模型...")
        self.embedding_model = SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')
        print("模型加载完成")
        
        # 获取或创建集合（新版API）
        self.collection = self.client.get_or_create_collection(
            name=collection_name,
            metadata={"description": "教学知识库"}
        )
        print(f"集合已就绪: {collection_name}")
    
    def add_documents(self, documents: List[Dict]) -> None:
        """
        添加文档到向量数据库
        
        Args:
            documents: 文档列表，每个文档包含content和metadata
        """
        if not documents:
            return
        
        print(f"开始向量化 {len(documents)} 个文档...")
        
        # 提取文本内容
        texts = [doc["content"] for doc in documents]
        metadatas = [doc["metadata"] for doc in documents]
        
        # 生成唯一ID
        ids = [f"{doc['metadata']['source']}_{doc['metadata']['chunk_id']}" 
               for doc in documents]
        
        # 生成embeddings（批量处理）
        batch_size = 32
        for i in range(0, len(texts), batch_size):
            batch_texts = texts[i:i+batch_size]
            batch_ids = ids[i:i+batch_size]
            batch_metadatas = metadatas[i:i+batch_size]
            
            embeddings = self.embedding_model.encode(batch_texts).tolist()
            
            # 添加到数据库
            self.collection.add(
                embeddings=embeddings,
                documents=batch_texts,
                metadatas=batch_metadatas,
                ids=batch_ids
            )
            
            print(f"已处理 {min(i+batch_size, len(texts))}/{len(texts)} 个文档")
        
        # PersistentClient 会自动持久化，无需显式调用 persist()
        print("向量数据库更新完成")
    
    def search(self, query: str, top_k: int = 3) -> List[Dict]:
        """
        搜索相关文档
        
        Args:
            query: 查询文本
            top_k: 返回top k个结果
            
        Returns:
            相关文档列表
        """
        # 生成查询向量
        query_embedding = self.embedding_model.encode([query]).tolist()
        
        # 搜索
        results = self.collection.query(
            query_embeddings=query_embedding,
            n_results=top_k
        )
        
        # 格式化结果
        documents = []
        if results['documents'] and results['documents'][0]:
            for i in range(len(results['documents'][0])):
                documents.append({
                    "content": results['documents'][0][i],
                    "metadata": results['metadatas'][0][i],
                    "distance": results['distances'][0][i] if 'distances' in results else None
                })
        
        return documents
    
    def get_collection_stats(self) -> Dict:
        """获取集合统计信息"""
        count = self.collection.count()
        return {
            "collection_name": self.collection_name,
            "document_count": count,
            "persist_directory": self.persist_directory
        }
    
    def clear_collection(self) -> None:
        """清空集合"""
        self.client.delete_collection(name=self.collection_name)
        self.collection = self.client.create_collection(
            name=self.collection_name,
            metadata={"description": "教学知识库"}
        )
        print(f"集合 {self.collection_name} 已清空")


if __name__ == "__main__":
    # 测试代码
    from document_processor import DocumentProcessor
    
    # 初始化
    processor = DocumentProcessor()
    vector_store = VectorStore()
    
    # 检查是否已有数据
    stats = vector_store.get_collection_stats()
    print(f"当前数据库状态: {stats}")
    
    if stats['document_count'] == 0:
        print("\n开始构建知识库...")
        # 处理文档
        knowledge_base_path = "../知识库（仅按格式分类）"
        documents = processor.process_directory(knowledge_base_path)
        
        # 添加到向量数据库
        vector_store.add_documents(documents)
        print("\n知识库构建完成！")
    
    # 测试搜索
    print("\n测试搜索功能:")
    query = "如何设计课程大纲"
    results = vector_store.search(query, top_k=3)
    
    for i, result in enumerate(results, 1):
        print(f"\n结果 {i}:")
        print(f"来源: {result['metadata']['source']}")
        print(f"相似度: {result['distance']:.4f}")
        print(f"内容预览: {result['content'][:150]}...")
