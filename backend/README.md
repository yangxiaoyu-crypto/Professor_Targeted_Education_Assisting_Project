# 知识库向量数据库服务

基于 ChromaDB 和 LangChain 的 RAG（检索增强生成）服务，为前端提供知识库检索能力。

## 功能特性

- ✅ 支持 PDF 和 DOC/DOCX 文档解析
- ✅ 中文文本向量化（使用 paraphrase-multilingual-MiniLM-L12-v2）
- ✅ 语义相似度搜索
- ✅ 自动文档分块和索引
- ✅ RESTful API 接口

## 快速开始

### 1. 安装依赖

```bash
cd backend
pip install -r requirements.txt
```

推荐使用清华镜像加速：
```bash
pip install -r requirements.txt -i https://pypi.tuna.tsinghua.edu.cn/simple
```

### 2. 启动服务

**Windows:**
```bash
start_service.bat
```

**Linux/Mac:**
```bash
python knowledge_service.py
```

服务将在 `http://localhost:5001` 启动

### 3. 首次运行

首次启动时，服务会自动：
1. 扫描 `../知识库（仅按格式分类）` 目录
2. 解析所有 PDF 和 DOC 文件
3. 生成向量索引并持久化到 `./chroma_db`

**注意：** 首次索引可能需要 5-15 分钟（取决于文档数量）

## API 接口

### 1. 搜索知识库

**请求:**
```http
POST /api/knowledge/search
Content-Type: application/json

{
  "query": "如何设计课程大纲",
  "top_k": 3
}
```

**响应:**
```json
{
  "success": true,
  "query": "如何设计课程大纲",
  "results": [
    {
      "content": "课程大纲设计的关键要素包括...",
      "source": "课程设计指南.pdf",
      "file_path": "...",
      "chunk_id": 5,
      "similarity": 0.85
    }
  ],
  "count": 3
}
```

### 2. 获取统计信息

**请求:**
```http
GET /api/knowledge/stats
```

**响应:**
```json
{
  "success": true,
  "stats": {
    "collection_name": "teaching_knowledge_base",
    "document_count": 1523,
    "persist_directory": "./chroma_db"
  }
}
```

### 3. 重建索引

**请求:**
```http
POST /api/knowledge/rebuild
```

**响应:**
```json
{
  "success": true,
  "message": "知识库重建完成",
  "stats": {...}
}
```

## 前端集成

在前端使用 `knowledgeApi.js`：

```javascript
import { knowledgeService } from '../services/knowledgeApi';

// 搜索知识库
const results = await knowledgeService.search({
  query: '课程大纲设计',
  topK: 3
});

// 在生成 prompt 时注入参考内容
const prompt = generatePrompt(formData, results);
```

## 目录结构

```
backend/
├── requirements.txt          # Python依赖
├── knowledge_service.py      # Flask API服务
├── vector_store.py          # 向量数据库管理
├── document_processor.py    # 文档解析器
├── start_service.bat        # Windows启动脚本
├── README.md               # 本文档
└── chroma_db/              # 向量数据库（自动生成）
```

## 配置说明

### 修改端口

在 `knowledge_service.py` 中修改：
```python
app.run(host='0.0.0.0', port=5001, debug=True)
```

### 修改知识库路径

在 `knowledge_service.py` 中修改：
```python
knowledge_base_path = Path(__file__).parent.parent / "知识库（仅按格式分类）"
```

### 调整分块参数

在 `document_processor.py` 中修改：
```python
DocumentProcessor(chunk_size=800, chunk_overlap=150)
```

## 常见问题

### Q: 首次启动很慢？
A: 正常现象，需要处理所有文档并生成向量。后续启动会直接加载已有索引。

### Q: 如何更新知识库？
A: 添加新文档后，调用 `/api/knowledge/rebuild` 重建索引。

### Q: 搜索结果不准确？
A: 可以调整 `top_k` 参数，或修改 `chunk_size` 重新索引。

### Q: 内存占用过高？
A: 可以使用更小的 embedding 模型，或减小 `chunk_size`。

## 技术栈

- **Flask**: Web 框架
- **ChromaDB**: 向量数据库
- **LangChain**: RAG 框架
- **Sentence-Transformers**: 文本向量化
- **PyPDF2/pdfplumber**: PDF 解析
- **python-docx**: Word 文档解析

## 性能优化

1. **批量处理**: 文档向量化采用批处理（batch_size=32）
2. **持久化**: 向量索引持久化到磁盘，避免重复计算
3. **缓存**: ChromaDB 内置查询缓存

## 后续优化方向

- [ ] 支持更多文档格式（PPT、TXT等）
- [ ] 添加文档预处理（去除噪声、OCR等）
- [ ] 支持混合检索（关键词+语义）
- [ ] 添加查询缓存层
- [ ] 支持多知识库切换
