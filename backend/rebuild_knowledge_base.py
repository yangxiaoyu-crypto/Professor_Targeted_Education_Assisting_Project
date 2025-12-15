#!/usr/bin/env python3
"""
重建知识库索引脚本
包含所有知识库文件和ISW手册
"""
import os
import sys
from pathlib import Path
from vector_store import VectorStore
from document_processor import DocumentProcessor

def rebuild_knowledge_base():
    """重建知识库索引"""
    print("=" * 60)
    print("开始重建知识库索引")
    print("=" * 60)
    
    # 初始化向量数据库
    print("\n[1/4] 初始化向量数据库...")
    vector_store = VectorStore(
        persist_directory="./chroma_db",
        collection_name="teaching_knowledge_base"
    )
    
    # 清空现有数据
    print("[2/4] 清空现有索引...")
    vector_store.clear_collection()
    
    # 处理知识库文件
    print("[3/4] 处理知识库文件...")
    # 知识库文件夹在项目根目录中，而不是在public文件夹中
    knowledge_base_path = Path(__file__).parent.parent.parent / "知识库（仅按格式分类）"
    
    if not knowledge_base_path.exists():
        print(f"错误: 知识库路径不存在 {knowledge_base_path}")
        return False
    
    processor = DocumentProcessor(chunk_size=800, chunk_overlap=150)
    documents = processor.process_directory(str(knowledge_base_path))
    
    if documents:
        print(f"处理了 {len(documents)} 个文档块")
        print("[4/4] 向量化并保存到数据库...")
        vector_store.add_documents(documents)
        print("\n✓ 知识库索引构建完成！")
        
        # 显示统计信息
        stats = vector_store.get_collection_stats()
        print("\n" + "=" * 60)
        print("知识库统计信息:")
        print(f"  - 文档块总数: {stats['document_count']}")
        print(f"  - 集合名称: {stats['collection_name']}")
        print("=" * 60)
        
        return True
    else:
        print("错误: 未找到可处理的文档")
        return False

if __name__ == "__main__":
    try:
        success = rebuild_knowledge_base()
        sys.exit(0 if success else 1)
    except Exception as e:
        print(f"\n错误: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
