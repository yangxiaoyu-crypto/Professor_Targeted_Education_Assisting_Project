"""
文档处理器 - 解析PDF和DOC文件
"""
import os
from pathlib import Path
from typing import List, Dict
import PyPDF2
import pdfplumber
from docx import Document
from langchain.text_splitter import RecursiveCharacterTextSplitter


class DocumentProcessor:
    """处理PDF和DOC文档，提取文本并分块"""
    
    def __init__(self, chunk_size=1000, chunk_overlap=200):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            separators=["\n\n", "\n", "。", "！", "？", ".", "!", "?", " ", ""]
        )
    
    def extract_text_from_pdf(self, pdf_path: str) -> str:
        """从PDF提取文本"""
        text = ""
        try:
            # 优先使用pdfplumber（更准确）
            with pdfplumber.open(pdf_path) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"
        except Exception as e:
            print(f"pdfplumber失败，尝试PyPDF2: {e}")
            # 备用PyPDF2
            try:
                with open(pdf_path, 'rb') as file:
                    pdf_reader = PyPDF2.PdfReader(file)
                    for page in pdf_reader.pages:
                        text += page.extract_text() + "\n"
            except Exception as e2:
                print(f"PDF解析失败 {pdf_path}: {e2}")
        
        return text.strip()
    
    def extract_text_from_docx(self, docx_path: str) -> str:
        """从DOCX提取文本"""
        try:
            doc = Document(docx_path)
            text = "\n".join([para.text for para in doc.paragraphs if para.text.strip()])
            return text
        except Exception as e:
            print(f"DOCX解析失败 {docx_path}: {e}")
            return ""
    
    def process_document(self, file_path: str) -> List[Dict]:
        """处理单个文档，返回分块后的文本和元数据"""
        file_path = Path(file_path)
        file_ext = file_path.suffix.lower()
        
        # 提取文本
        if file_ext == '.pdf':
            text = self.extract_text_from_pdf(str(file_path))
        elif file_ext in ['.docx', '.doc']:
            text = self.extract_text_from_docx(str(file_path))
        else:
            print(f"不支持的文件格式: {file_ext}")
            return []
        
        if not text:
            return []
        
        # 分块
        chunks = self.text_splitter.split_text(text)
        
        # 构建元数据
        documents = []
        for i, chunk in enumerate(chunks):
            documents.append({
                "content": chunk,
                "metadata": {
                    "source": file_path.name,
                    "file_path": str(file_path),
                    "chunk_id": i,
                    "total_chunks": len(chunks)
                }
            })
        
        return documents
    
    def process_directory(self, directory_path: str) -> List[Dict]:
        """处理整个目录的文档"""
        all_documents = []
        directory = Path(directory_path)
        
        # 支持的文件格式
        supported_extensions = ['.pdf', '.docx', '.doc']
        
        # 递归遍历目录
        for file_path in directory.rglob('*'):
            if file_path.is_file() and file_path.suffix.lower() in supported_extensions:
                print(f"处理文件: {file_path.name}")
                docs = self.process_document(str(file_path))
                all_documents.extend(docs)
                print(f"  -> 生成 {len(docs)} 个文本块")
        
        return all_documents


if __name__ == "__main__":
    # 测试代码
    processor = DocumentProcessor()
    knowledge_base_path = "../知识库（仅按格式分类）"
    
    print("开始处理知识库文档...")
    documents = processor.process_directory(knowledge_base_path)
    print(f"\n总共处理了 {len(documents)} 个文本块")
    
    # 显示示例
    if documents:
        print("\n示例文本块:")
        print(f"来源: {documents[0]['metadata']['source']}")
        print(f"内容预览: {documents[0]['content'][:200]}...")
