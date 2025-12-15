import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, Space, message, Divider, Row, Col } from 'antd';
import { UserOutlined, LockOutlined, LoginOutlined } from '@ant-design/icons';
import './LoginPage.css';

const { Title, Paragraph, Text } = Typography;

const LoginPage = ({ onLoginSuccess, onSwitchToRegister }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleLogin = async (values) => {
    setLoading(true);
    try {
      // 从 localStorage 获取用户数据
      const usersData = localStorage.getItem('users');
      const users = usersData ? JSON.parse(usersData) : [];

      // 查找匹配的用户
      const user = users.find(
        (u) => u.username === values.username && u.password === values.password
      );

      if (user) {
        // 登录成功
        localStorage.setItem('currentUser', JSON.stringify({
          username: user.username,
          email: user.email,
          loginTime: new Date().toISOString(),
        }));
        message.success('登录成功！');
        
        // 调用回调函数，通知父组件登录成功
        if (onLoginSuccess) {
          onLoginSuccess(user.username);
        }
      } else {
        message.error('用户名或密码错误！');
      }
    } catch (error) {
      message.error('登录失败，请重试');
      console.error('登录错误:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <Card
        style={{
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          borderRadius: 8,
          width: '100%',
          maxWidth: 400,
        }}
      >
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              {/* 标题 */}
              <div style={{ textAlign: 'center' }}>
                <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
                  📚 教学智能助手
                </Title>
                <Paragraph type="secondary" style={{ marginTop: 8 }}>
                  Teaching AI Assistant
                </Paragraph>
              </div>

              <Divider />

              {/* 登录表单 */}
              <Form
                form={form}
                layout="vertical"
                onFinish={handleLogin}
                autoComplete="off"
              >
                <Form.Item
                  name="username"
                  label="用户名"
                  rules={[
                    { required: true, message: '请输入用户名' },
                    { min: 3, message: '用户名至少3个字符' },
                  ]}
                >
                  <Input
                    prefix={<UserOutlined />}
                    placeholder="输入用户名"
                    size="large"
                  />
                </Form.Item>

                <Form.Item
                  name="password"
                  label="密码"
                  rules={[
                    { required: true, message: '请输入密码' },
                    { min: 6, message: '密码至少6个字符' },
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="输入密码"
                    size="large"
                  />
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    block
                    size="large"
                    loading={loading}
                    icon={<LoginOutlined />}
                  >
                    登录
                  </Button>
                </Form.Item>
              </Form>

              <Divider />

              {/* 提示信息 */}
              <div style={{ textAlign: 'center' }}>
                <Paragraph type="secondary" style={{ fontSize: 12 }}>
                  还没有账户？
                  <Button 
                    type="link" 
                    style={{ padding: 0, marginLeft: 4 }}
                    onClick={onSwitchToRegister}
                  >
                    点击注册
                  </Button>
                </Paragraph>
              </div>

              {/* 演示账户 */}
              <Card type="inner" style={{ background: '#f0f5ff' }}>
                <Text strong>📝 演示账户：</Text>
                <Paragraph style={{ marginTop: 8, marginBottom: 0 }}>
                  <Text code>用户名: demo</Text>
                  <br />
                  <Text code>密码: 123456</Text>
                </Paragraph>
              </Card>
            </Space>
      </Card>
    </div>
  );
};

export default LoginPage;
