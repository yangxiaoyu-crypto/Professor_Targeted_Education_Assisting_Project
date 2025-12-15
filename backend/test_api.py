"""
知识库API测试脚本
"""
import requests
import json

BASE_URL = "http://localhost:5001"

def test_stats():
    """测试统计信息接口"""
    print("=" * 50)
    print("测试统计信息接口")
    print("=" * 50)
    
    response = requests.get(f"{BASE_URL}/api/knowledge/stats")
    print(f"状态码: {response.status_code}")
    print(f"响应: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
    print()

def test_search(query, top_k=3):
    """测试搜索接口"""
    print("=" * 50)
    print(f"测试搜索接口: {query}")
    print("=" * 50)
    
    response = requests.post(
        f"{BASE_URL}/api/knowledge/search",
        json={"query": query, "top_k": top_k}
    )
    
    print(f"状态码: {response.status_code}")
    
    if response.status_code == 200:
        results = response.json().get("results", [])
        print(f"找到 {len(results)} 条结果:\n")
        
        for i, result in enumerate(results, 1):
            print(f"结果 {i}:")
            print(f"  来源: {result['source']}")
            similarity = result.get('similarity', result.get('score', 'N/A'))
            if isinstance(similarity, float):
                print(f"  相似度: {similarity:.4f}")
            else:
                print(f"  相似度: {similarity}")
            print(f"  内容预览: {result['content'][:100]}...")
            print()
    else:
        print(f"错误: {response.text}")
    print()

if __name__ == "__main__":
    # 测试统计信息
    test_stats()
    
    # 测试不同的搜索查询
    test_search("课程设计")
    test_search("BOPPPS教学模式")
    test_search("布卢姆分类学")
    test_search("教学目标")
