"""
知识库RAG服务 - Flask API

知识库包含内容:
- 教学资源库（128个PDF + 25个DOC/DOCX文件）
- ISW手册2021版中文译稿

功能:
- 语义搜索知识库
- 获取统计信息
- 重建索引
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from pathlib import Path
from vector_store import VectorStore
from document_processor import DocumentProcessor

app = Flask(__name__)
CORS(app)  # 允许跨域请求

# 初始化向量数据库
vector_store = None

def init_vector_store():
    """初始化向量数据库"""
    global vector_store
    if vector_store is None:
        print("初始化向量数据库...")
        vector_store = VectorStore(
            persist_directory="./chroma_db",
            collection_name="teaching_knowledge_base"
        )
        
        # 检查是否需要构建索引
        stats = vector_store.get_collection_stats()
        if stats['document_count'] == 0:
            print("知识库为空，开始构建索引...")
            build_knowledge_base()
        else:
            print(f"知识库已就绪，包含 {stats['document_count']} 个文档块")


def build_knowledge_base():
    """构建知识库索引"""
    global vector_store
    
    # 知识库路径（在项目根目录中）
    knowledge_base_path = Path(__file__).parent.parent.parent / "知识库（仅按格式分类）"
    
    if not knowledge_base_path.exists():
        print(f"警告: 知识库路径不存在 {knowledge_base_path}")
        return
    
    # 处理文档
    processor = DocumentProcessor(chunk_size=800, chunk_overlap=150)
    documents = processor.process_directory(str(knowledge_base_path))
    
    if documents:
        print(f"处理了 {len(documents)} 个文档块，开始向量化...")
        vector_store.add_documents(documents)
        print("知识库索引构建完成！")
    else:
        print("未找到可处理的文档")


@app.route('/health', methods=['GET'])
def health_check():
    """健康检查"""
    return jsonify({"status": "ok", "service": "knowledge_service"})


@app.route('/api/knowledge/search', methods=['POST'])
def search_knowledge():
    """
    搜索知识库
    
    请求体:
    {
        "query": "搜索关键词",
        "top_k": 3  // 可选，默认3
    }
    """
    try:
        data = request.json
        query = data.get('query', '')
        top_k = data.get('top_k', 3)
        
        if not query:
            return jsonify({"error": "query参数不能为空"}), 400
        
        # 搜索
        results = vector_store.search(query, top_k=top_k)
        
        # 格式化返回
        formatted_results = []
        for result in results:
            # 距离越小越相似，直接返回距离值（负数表示更相似）
            # 或者可以转换为相似度分数（可选）
            distance = result.get('distance', 0)
            formatted_results.append({
                "content": result['content'],
                "source": result['metadata']['source'],
                "file_path": result['metadata'].get('file_path', ''),
                "chunk_id": result['metadata'].get('chunk_id', 0),
                "distance": distance,  # 保留原始距离
                "similarity": max(0, 1 / (1 + abs(distance))) if distance is not None else 1.0  # 转换为0-1分数
            })
        
        return jsonify({
            "success": True,
            "query": query,
            "results": formatted_results,
            "count": len(formatted_results)
        })
    
    except Exception as e:
        print(f"搜索错误: {e}")
        return jsonify({"error": str(e)}), 500


@app.route('/api/knowledge/stats', methods=['GET'])
def get_stats():
    """获取知识库统计信息"""
    try:
        stats = vector_store.get_collection_stats()
        return jsonify({
            "success": True,
            "stats": stats
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/knowledge/rebuild', methods=['POST'])
def rebuild_index():
    """重建知识库索引"""
    try:
        # 清空现有数据
        vector_store.clear_collection()
        
        # 重新构建
        build_knowledge_base()
        
        stats = vector_store.get_collection_stats()
        return jsonify({
            "success": True,
            "message": "知识库重建完成",
            "stats": stats
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    # 启动时初始化
    init_vector_store()
    
    # 启动服务
    print("\n知识库服务启动在 http://localhost:5001")
    print("API端点:")
    print("  - POST /api/knowledge/search  搜索知识库")
    print("  - GET  /api/knowledge/stats   获取统计信息")
    print("  - POST /api/knowledge/rebuild 重建索引")
    
    app.run(host='0.0.0.0', port=5001, debug=True)
