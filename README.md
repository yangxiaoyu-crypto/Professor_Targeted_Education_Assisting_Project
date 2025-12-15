# 高校教师精准教育辅助系统

基于 AI 的教学辅助平台，帮助高校教师进行课程设计、教学评估和学情分析。

## 功能模块

- **课程大纲生成** - AI 辅助生成课程大纲
- **课程比对** - 不同课程方案对比分析
- **学情分析** - 学生学习情况评估
- **思政教育** - 课程思政元素融入
- **学习目标设计** - 教学目标制定
- **参与式学习** - 互动教学设计
- **知识库问答** - 基于文档的智能问答

## 技术栈

**前端**: React + Vite + Ant Design

**后端**: Python + FastAPI + ChromaDB

## 快速开始

### 1. 安装前端依赖

```bash
npm install
```

### 2. 安装后端依赖

```bash
cd backend
pip install -r requirements.txt
```

### 3. 配置环境变量

在 `src/config/env.js` 中配置 API 地址和密钥。

### 4. 启动服务

**方式一**: 使用启动脚本
```bash
start_all.bat
```

**方式二**: 手动启动
```bash
# 启动前端
npm run dev

# 启动后端服务 (新终端)
cd backend
python knowledge_service.py
python auth_service.py
```

## 项目结构

```
├── src/
│   ├── pages/          # 页面组件
│   ├── components/     # 通用组件
│   ├── services/       # API 服务
│   └── config/         # 配置文件
├── backend/
│   ├── knowledge_service.py  # 知识库服务
│   ├── auth_service.py       # 认证服务
│   └── vector_store.py       # 向量存储
└── images/             # 图片资源
```

## 注意事项

以下文件被 `.gitignore` 忽略，不会提交到仓库：

- `backend/chroma_db/` - 向量数据库（约 575MB）
- `backend/__pycache__/` - Python 缓存文件
- `backend/users.db` - 用户数据库
- `*.pyc` - Python 编译文件

这些文件因为体积太大或属于运行时生成的文件，所以被排除在 git 之外。部署时需要本地重新生成。

## 许可证

MIT License
