import React from 'react';
import { Card, Row, Col, Typography, Statistic, Space, Button } from 'antd';
import {
  BookOutlined,
  TeamOutlined,
  FileTextOutlined,
  HeartOutlined,
  RocketOutlined,
  BulbOutlined,
} from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

const HomePage = () => {
  const features = [
    {
      icon: <FileTextOutlined style={{ fontSize: 40, color: '#1890ff' }} />,
      title: '课程大纲生成',
      description: '基于教学设计理论，智能生成规范的课程大纲，支持中英文输出',
      color: '#e6f7ff',
    },
    {
      icon: <TeamOutlined style={{ fontSize: 40, color: '#52c41a' }} />,
      title: '参与式学习',
      description: '提供多种参与式学习方案，包括BOPPPS、PBL等教学模式',
      color: '#f6ffed',
    },
    {
      icon: <BulbOutlined style={{ fontSize: 40, color: '#faad14' }} />,
      title: '学习目标撰写',
      description: '基于布卢姆分类法和加涅理论，帮助撰写清晰的学习目标',
      color: '#fffbe6',
    },
    {
      icon: <BookOutlined style={{ fontSize: 40, color: '#722ed1' }} />,
      title: '学生评估方案',
      description: '设计科学的评估体系，包括形成性评价和总结性评价',
      color: '#f9f0ff',
    },
    {
      icon: <HeartOutlined style={{ fontSize: 40, color: '#eb2f96' }} />,
      title: '课程思政',
      description: '将思政元素自然融入课程内容，实现价值引领',
      color: '#fff0f6',
    },
    {
      icon: <RocketOutlined style={{ fontSize: 40, color: '#13c2c2' }} />,
      title: '课程优化比较',
      description: '对比分析不同课程设计方案，提供优化建议',
      color: '#e6fffb',
    },
  ];

  const stats = [
    { title: '教学理论文献', value: 100, suffix: '+篇' },
    { title: '教学模式', value: 20, suffix: '+种' },
    { title: '评价量表', value: 50, suffix: '+个' },
    { title: '课程案例', value: 30, suffix: '+个' },
  ];

  return (
    <div>
      {/* 欢迎区域 */}
      <Card
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          marginBottom: 24,
          border: 'none',
        }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Title level={2} style={{ color: 'white', margin: 0 }}>
            欢迎使用教学智能助手 🎓
          </Title>
          <Paragraph style={{ color: 'white', fontSize: 16, margin: 0 }}>
            专为大学教授设计的AI教学助手，基于教学设计理论和丰富的教学资源库，
            帮助您轻松完成课程设计、教学大纲撰写和教学活动规划。
          </Paragraph>
          <div>
            <Button type="primary" size="large" style={{ marginRight: 12 }}>
              开始创建课程大纲
            </Button>
            <Button size="large" style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none' }}>
              查看使用指南
            </Button>
          </div>
        </Space>
      </Card>

      {/* 统计数据 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        {stats.map((stat, index) => (
          <Col xs={24} sm={12} md={6} key={index}>
            <Card>
              <Statistic
                title={stat.title}
                value={stat.value}
                suffix={stat.suffix}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* 核心功能 */}
      <Title level={3} style={{ marginBottom: 16 }}>
        核心功能
      </Title>
      <Row gutter={[16, 16]}>
        {features.map((feature, index) => (
          <Col xs={24} sm={12} md={8} key={index}>
            <Card
              hoverable
              style={{ height: '100%' }}
              bodyStyle={{ background: feature.color }}
            >
              <Space direction="vertical" align="center" style={{ width: '100%', textAlign: 'center' }}>
                {feature.icon}
                <Title level={4} style={{ margin: '12px 0 8px' }}>
                  {feature.title}
                </Title>
                <Text type="secondary">{feature.description}</Text>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>

      {/* 知识库说明 */}
      <Card style={{ marginTop: 24 }} title="📚 知识库资源">
        <Row gutter={16}>
          <Col span={8}>
            <Card type="inner" title="教学理论文献">
              <ul style={{ paddingLeft: 20 }}>
                <li>教学设计原理（加涅）</li>
                <li>Understanding by Design</li>
                <li>布卢姆教育目标分类学</li>
                <li>以学习者为中心的教学</li>
                <li>课堂评价技巧</li>
              </ul>
            </Card>
          </Col>
          <Col span={8}>
            <Card type="inner" title="教学模式">
              <ul style={{ paddingLeft: 20 }}>
                <li>BOPPPS教学模式</li>
                <li>项目化学习（PBL）</li>
                <li>翻转课堂</li>
                <li>案例教学法</li>
                <li>同伴教学法</li>
              </ul>
            </Card>
          </Col>
          <Col span={8}>
            <Card type="inner" title="评价工具">
              <ul style={{ paddingLeft: 20 }}>
                <li>课程大纲评价量表</li>
                <li>讨论活动评价量表</li>
                <li>学习成果评估工具</li>
                <li>教学反思指南</li>
                <li>学生反馈表</li>
              </ul>
            </Card>
          </Col>
        </Row>
      </Card>

      {/* 使用建议 */}
      <Card style={{ marginTop: 24 }} title="💡 使用建议">
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <div>
            <Text strong>1. 新手教师：</Text>
            <Paragraph style={{ marginLeft: 20, marginTop: 8 }}>
              建议从"学习目标撰写"开始，明确课程的教学目标，然后使用"课程大纲生成"功能创建完整的教学计划。
            </Paragraph>
          </div>
          <div>
            <Text strong>2. 经验教师：</Text>
            <Paragraph style={{ marginLeft: 20, marginTop: 8 }}>
              可以先输入您现有的课程设计，使用"课程优化比较"功能获取改进建议，提升教学设计的规范性。
            </Paragraph>
          </div>
          <div>
            <Text strong>3. 教学创新：</Text>
            <Paragraph style={{ marginLeft: 20, marginTop: 8 }}>
              探索"参与式学习"模块，了解多种创新教学方法，让课堂更加生动有趣。
            </Paragraph>
          </div>
        </Space>
      </Card>
    </div>
  );
};

export default HomePage;

