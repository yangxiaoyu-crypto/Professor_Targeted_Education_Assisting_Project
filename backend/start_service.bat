@echo off
chcp 65001 >nul
echo ========================================
echo 知识库向量数据库服务启动脚本
echo ========================================
echo.

REM 检查Python是否安装
python --version >nul 2>&1
if errorlevel 1 (
    echo [错误] 未检测到Python，请先安装Python 3.8+
    pause
    exit /b 1
)

echo [1/3] 检查依赖...
pip show flask >nul 2>&1
if errorlevel 1 (
    echo [提示] 首次运行，正在安装依赖包...
    pip install -r requirements.txt -i https://pypi.tuna.tsinghua.edu.cn/simple
    if errorlevel 1 (
        echo [错误] 依赖安装失败
        pause
        exit /b 1
    )
)

echo [2/3] 启动知识库服务...
echo.
echo 服务地址: http://localhost:5001
echo API文档:
echo   - POST /api/knowledge/search  搜索知识库
echo   - GET  /api/knowledge/stats   获取统计信息
echo   - POST /api/knowledge/rebuild 重建索引
echo.
echo ========================================
echo.

REM 启动服务
python knowledge_service.py

pause
