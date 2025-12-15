"""
用户认证服务 - Flask API
提供登录、注册、token验证等功能
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
import jwt
import hashlib
import sqlite3
import os
from datetime import datetime, timedelta
from functools import wraps

app = Flask(__name__)
CORS(app)

# JWT 密钥（生产环境应使用环境变量）
SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'your-secret-key-change-in-production')
JWT_ALGORITHM = 'HS256'
JWT_EXPIRATION_HOURS = 24

# 数据库文件路径
DB_FILE = 'users.db'

def init_db():
    """初始化用户数据库"""
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    
    # 创建用户表
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    conn.commit()
    conn.close()
    print(f"数据库初始化完成: {DB_FILE}")


def hash_password(password):
    """对密码进行哈希加密"""
    return hashlib.sha256(password.encode()).hexdigest()


def generate_token(user_id, username):
    """生成 JWT token"""
    payload = {
        'user_id': user_id,
        'username': username,
        'exp': datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS),
        'iat': datetime.utcnow()
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=JWT_ALGORITHM)


def verify_token(token):
    """验证 JWT token"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None


def token_required(f):
    """装饰器：验证 token"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        # 从请求头获取 token
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(' ')[1]  # Bearer <token>
            except IndexError:
                return jsonify({'message': 'Token格式错误'}), 401
        
        if not token:
            return jsonify({'message': '缺少认证token'}), 401
        
        payload = verify_token(token)
        if not payload:
            return jsonify({'message': 'Token无效或已过期'}), 401
        
        request.current_user = payload
        return f(*args, **kwargs)
    
    return decorated


@app.route('/auth/register', methods=['POST'])
def register():
    """用户注册"""
    try:
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        email = data.get('email')
        
        # 验证输入
        if not username or not password or not email:
            return jsonify({'message': '用户名、密码和邮箱都是必填项'}), 400
        
        if len(username) < 3:
            return jsonify({'message': '用户名至少3个字符'}), 400
        
        if len(password) < 6:
            return jsonify({'message': '密码至少6个字符'}), 400
        
        # 连接数据库
        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()
        
        # 检查用户名是否已存在
        cursor.execute('SELECT id FROM users WHERE username = ?', (username,))
        if cursor.fetchone():
            conn.close()
            return jsonify({'message': '用户名已存在'}), 400
        
        # 检查邮箱是否已存在
        cursor.execute('SELECT id FROM users WHERE email = ?', (email,))
        if cursor.fetchone():
            conn.close()
            return jsonify({'message': '邮箱已被注册'}), 400
        
        # 创建新用户
        password_hash = hash_password(password)
        cursor.execute(
            'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
            (username, email, password_hash)
        )
        user_id = cursor.lastrowid
        
        # 生成 token
        token = generate_token(user_id, username)
        
        conn.commit()
        conn.close()
        
        return jsonify({
            'message': '注册成功',
            'token': token,
            'user': {
                'id': user_id,
                'username': username,
                'email': email
            }
        }), 201
        
    except Exception as e:
        print(f"注册错误: {str(e)}")
        return jsonify({'message': '注册失败，请稍后重试'}), 500


@app.route('/auth/login', methods=['POST'])
def login():
    """用户登录"""
    try:
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        
        # 验证输入
        if not username or not password:
            return jsonify({'message': '用户名和密码都是必填项'}), 400
        
        # 连接数据库
        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()
        
        # 查找用户
        password_hash = hash_password(password)
        cursor.execute(
            'SELECT id, username, email FROM users WHERE username = ? AND password_hash = ?',
            (username, password_hash)
        )
        user = cursor.fetchone()
        conn.close()
        
        if not user:
            return jsonify({'message': '用户名或密码错误'}), 401
        
        # 生成 token
        user_id, username, email = user
        token = generate_token(user_id, username)
        
        return jsonify({
            'message': '登录成功',
            'token': token,
            'user': {
                'id': user_id,
                'username': username,
                'email': email
            }
        }), 200
        
    except Exception as e:
        print(f"登录错误: {str(e)}")
        return jsonify({'message': '登录失败，请稍后重试'}), 500


@app.route('/auth/me', methods=['GET'])
@token_required
def get_current_user():
    """获取当前用户信息"""
    try:
        user_id = request.current_user['user_id']
        
        # 连接数据库
        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()
        
        cursor.execute(
            'SELECT id, username, email, created_at FROM users WHERE id = ?',
            (user_id,)
        )
        user = cursor.fetchone()
        conn.close()
        
        if not user:
            return jsonify({'message': '用户不存在'}), 404
        
        user_id, username, email, created_at = user
        return jsonify({
            'id': user_id,
            'username': username,
            'email': email,
            'created_at': created_at
        }), 200
        
    except Exception as e:
        print(f"获取用户信息错误: {str(e)}")
        return jsonify({'message': '获取用户信息失败'}), 500


@app.route('/auth/logout', methods=['POST'])
@token_required
def logout():
    """用户登出（客户端应清除 token）"""
    return jsonify({'message': '登出成功'}), 200


@app.route('/auth/refresh', methods=['POST'])
@token_required
def refresh_token():
    """刷新 token"""
    try:
        user_id = request.current_user['user_id']
        username = request.current_user['username']
        
        # 生成新 token
        new_token = generate_token(user_id, username)
        
        return jsonify({
            'token': new_token
        }), 200
        
    except Exception as e:
        print(f"刷新token错误: {str(e)}")
        return jsonify({'message': '刷新token失败'}), 500


@app.route('/auth/health', methods=['GET'])
def health_check():
    """健康检查"""
    return jsonify({'status': 'ok', 'service': 'auth'}), 200


if __name__ == '__main__':
    # 初始化数据库
    init_db()
    
    # 启动服务
    port = int(os.environ.get('PORT', 5000))
    print(f"认证服务启动在端口 {port}")
    app.run(host='0.0.0.0', port=port, debug=True)
else:
    # 如果作为模块导入，也初始化数据库
    init_db()

