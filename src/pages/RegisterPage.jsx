import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, Space, message, Divider, Row, Col } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, CheckCircleOutlined } from '@ant-design/icons';
import './LoginPage.css';

const { Title, Paragraph, Text } = Typography;

const RegisterPage = ({ onRegisterSuccess, onSwitchToLogin }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleRegister = async (values) => {
    setLoading(true);
    try {
      // 从 localStorage 获取现有用户数据
      const usersData = localStorage.getItem('users');
      const users = usersData ? JSON.parse(usersData) : [];

      // 检查用户名是否已存在
      if (users.some((u) => u.username === values.username)) {
        message.error('用户名已存在，请选择其他用户名');
        setLoading(false);
        return;
      }

      // 检查邮箱是否已存在
      if (users.some((u) => u.email === values.email)) {
        message.error('邮箱已被注册，请使用其他邮箱');
        setLoading(false);
        return;
      }

      // 添加新用户
      const newUser = {
        username: values.username,
        password: values.password,
        email: values.email,
        registerTime: new Date().toISOString(),
      };

      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));

      message.success('注册成功！请使用账户登录');
      form.resetFields();

      // 调用回调函数，通知父组件注册成功
      if (onRegisterSuccess) {
        onRegisterSuccess();
      }
    } catch (error) {
      message.error('注册失败，请重试');
      console.error('注册错误:', error);
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
                  创建新账户
                </Paragraph>
              </div>

              <Divider />

              {/* 注册表单 */}
              <Form
                form={form}
                layout="vertical"
                onFinish={handleRegister}
                autoComplete="off"
              >
                <Form.Item
                  name="username"
                  label="用户名"
                  rules={[
                    { required: true, message: '请输入用户名' },
                    { min: 3, message: '用户名至少3个字符' },
                    { max: 20, message: '用户名最多20个字符' },
                    {
                      pattern: /^[a-zA-Z0-9_]+$/,
                      message: '用户名只能包含字母、数字和下划线',
                    },
                  ]}
                >
                  <Input
                    prefix={<UserOutlined />}
                    placeholder="输入用户名（3-20个字符）"
                    size="large"
                  />
                </Form.Item>

                <Form.Item
                  name="email"
                  label="邮箱"
                  rules={[
                    { required: true, message: '请输入邮箱' },
                    { type: 'email', message: '请输入有效的邮箱地址' },
                  ]}
                >
                  <Input
                    prefix={<MailOutlined />}
                    placeholder="输入邮箱地址"
                    size="large"
                  />
                </Form.Item>

                <Form.Item
                  name="password"
                  label="密码"
                  rules={[
                    { required: true, message: '请输入密码' },
                    { min: 6, message: '密码至少6个字符' },
                    { max: 20, message: '密码最多20个字符' },
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="输入密码（6-20个字符）"
                    size="large"
                  />
                </Form.Item>

                <Form.Item
                  name="confirmPassword"
                  label="确认密码"
                  dependencies={['password']}
                  rules={[
                    { required: true, message: '请确认密码' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('password') === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error('两次输入密码不一致'));
                      },
                    }),
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="再次输入密码"
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
                    icon={<CheckCircleOutlined />}
                  >
                    注册
                  </Button>
                </Form.Item>
              </Form>

              <Divider />

              {/* 提示信息 */}
              <div style={{ textAlign: 'center' }}>
                <Paragraph type="secondary" style={{ fontSize: 12 }}>
                  已有账户？
                  <Button 
                    type="link" 
                    style={{ padding: 0, marginLeft: 4 }}
                    onClick={onSwitchToLogin}
                  >
                    返回登录
                  </Button>
                </Paragraph>
              </div>

              {/* 注册说明 */}
              <Card type="inner" style={{ background: '#f6ffed' }}>
                <Text strong>✓ 注册说明：</Text>
                <Paragraph style={{ marginTop: 8, marginBottom: 0, fontSize: 12 }}>
                  • 用户名：3-20个字符，只能包含字母、数字和下划线<br/>
                  • 邮箱：必须是有效的邮箱地址<br/>
                  • 密码：6-20个字符，建议使用大小写字母和数字组合<br/>
                  • 注册后可立即登录使用系统
                </Paragraph>
              </Card>
            </Space>
      </Card>
    </div>
  );
};

export default RegisterPage;
