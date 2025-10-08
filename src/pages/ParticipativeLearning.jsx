import React, { useState } from 'react';
import {
  Card,
  Row,
  Col,
  Button,
  Modal,
  Typography,
  Space,
  Tag,
  Collapse,
  Form,
  Input,
  Select,
  message,
  Spin,
} from 'antd';
import {
  TeamOutlined,
  ExperimentOutlined,
  CommentOutlined,
  ProjectOutlined,
  RocketOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import ReactMarkdown from 'react-markdown';
import { llmService } from '../services/api';

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { Panel } = Collapse;

const ParticipativeLearning = () => {
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState('');
  const [form] = Form.useForm();

  const learningMethods = [
    {
      id: 'boppps',
      title: 'BOPPPS教学模式',
      icon: <ExperimentOutlined />,
      color: '#1890ff',
      description: '基于建构主义的参与式教学模式',
      details: `BOPPPS是一种高效的教学设计模式，包含六个环节：
      
**B (Bridge-in)**: 导入 - 引起学生兴趣，激活先前知识
**O (Objective)**: 目标 - 明确告知学习目标
**P (Pre-assessment)**: 前测 - 了解学生基础
**P (Participatory Learning)**: 参与式学习 - 学生主动学习
**P (Post-assessment)**: 后测 - 检验学习效果
**S (Summary)**: 总结 - 巩固知识

适用场景：理论与实践结合的课程、单次课堂设计`,
    },
    {
      id: 'pbl',
      title: '项目化学习 (PBL)',
      icon: <ProjectOutlined />,
      color: '#52c41a',
      description: '以真实项目驱动的深度学习',
      details: `项目化学习（Project-Based Learning）的核心特征：

**真实性**: 解决真实世界的问题
**学生主导**: 学生自主规划和执行
**探究深度**: 深入研究和批判性思考
**协作学习**: 团队合作完成项目
**公开展示**: 向真实受众展示成果

实施步骤：
1. 确定驱动问题
2. 项目规划与设计
3. 研究与信息收集
4. 创建作品/解决方案
5. 展示与评价
6. 反思与改进`,
    },
    {
      id: 'flipped',
      title: '翻转课堂',
      icon: <RocketOutlined />,
      color: '#faad14',
      description: '课前学习 + 课堂内化',
      details: `翻转课堂的核心理念：

**课前**: 学生通过视频、阅读等方式自主学习基础知识
**课中**: 开展高阶思维活动，如讨论、实践、问题解决
**课后**: 巩固提升，拓展应用

实施要点：
- 制作高质量的课前学习材料
- 设计有挑战性的课堂活动
- 建立有效的反馈机制
- 培养学生的自主学习能力

适合：知识传授与能力培养并重的课程`,
    },
    {
      id: 'case',
      title: '案例教学法',
      icon: <CommentOutlined />,
      color: '#722ed1',
      description: '基于真实案例的讨论式学习',
      details: `案例教学法的关键要素：

**好案例的标准**:
- 真实性：来自实际情境
- 复杂性：无明确答案
- 相关性：与学习目标契合
- 启发性：引发深度思考

**实施流程**:
1. 案例准备：教师筛选/开发案例
2. 预习：学生课前阅读分析
3. 小组讨论：多角度探讨
4. 全班分享：观点碰撞
5. 教师总结：理论升华

适用：管理、法律、医学等专业课程`,
    },
    {
      id: 'peer',
      title: '同伴教学法',
      icon: <TeamOutlined />,
      color: '#eb2f96',
      description: '通过同伴互教促进理解',
      details: `同伴教学（Peer Instruction）的实施：

**核心步骤**:
1. 提出概念性问题
2. 学生独立思考和作答
3. 小组讨论和辩论
4. 再次投票/作答
5. 教师讲解和总结

**优势**:
- 暴露学生的错误理解
- 促进深度思考
- 提高参与度
- 即时反馈

**技术支持**: 
- 课堂应答系统(Clickers)
- 在线投票工具
- 小组讨论平台`,
    },
    {
      id: 'workshop',
      title: '工作坊模式',
      icon: <ExperimentOutlined />,
      color: '#13c2c2',
      description: '动手实践的沉浸式学习',
      details: `工作坊（Workshop）的设计要点：

**结构设计**:
- 开场破冰（10%）
- 理论简介（20%）
- 实践操作（50%）
- 成果分享（15%）
- 反思总结（5%）

**成功要素**:
- 明确的学习产出
- 充足的实践时间
- 及时的指导和反馈
- 协作与分享的氛围

适用场景：
- 技能培训课程
- 创新设计课程
- 跨学科项目`,
    },
  ];

  const handleSelectMethod = (method) => {
    setSelectedMethod(method);
    setModalVisible(true);
  };

  const handleGeneratePlan = async (values) => {
    setLoading(true);
    setGeneratedPlan('');

    const prompt = `请作为教学设计专家，基于${selectedMethod.title}，为以下课程设计详细的教学活动方案：

【课程信息】
课程主题：${values.topic}
授课对象：${values.students}
课时时长：${values.duration}分钟
教学目标：${values.objectives}

【设计要求】
1. 严格按照${selectedMethod.title}的理论框架设计
2. 每个环节要有明确的时间分配
3. 提供具体的活动内容和教师话术示例
4. 设计学生参与活动的具体形式
5. 给出评价和反馈的方法
6. 考虑可能遇到的问题及应对策略

请生成完整的教学活动方案，包括：
- 教学流程（分阶段详细描述）
- 每个阶段的时间安排
- 教师活动和学生活动
- 所需教学资源和工具
- 评价方式和标准
- 注意事项和tips`;

    try {
      let content = '';
      await llmService.streamGenerate(
        prompt,
        {
          systemPrompt: `你是一位教学设计专家，精通各种参与式学习方法。你需要提供详细、可操作的教学设计方案。`,
          temperature: 0.7,
          maxTokens: 3000,
        },
        (chunk) => {
          content += chunk;
          setGeneratedPlan(content);
        }
      );
      message.success('教学方案生成成功！');
    } catch (error) {
      message.error('生成失败，请稍后重试');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>
          <TeamOutlined /> 参与式学习方法
        </Title>
        <Paragraph>
          选择适合您课程的参与式学习方法，AI将帮助您设计具体的教学活动方案。
          所有方法都基于教育理论和成功实践，旨在提高学生的参与度和学习效果。
        </Paragraph>
      </div>

      <Row gutter={[16, 16]}>
        {learningMethods.map((method) => (
          <Col xs={24} sm={12} lg={8} key={method.id}>
            <Card
              hoverable
              onClick={() => handleSelectMethod(method)}
              style={{
                height: '100%',
                borderLeft: `4px solid ${method.color}`,
              }}
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                <div style={{ fontSize: 40, color: method.color }}>
                  {method.icon}
                </div>
                <Title level={4} style={{ margin: 0 }}>
                  {method.title}
                </Title>
                <Text type="secondary">{method.description}</Text>
                <Button type="primary" block>
                  了解详情并生成方案
                </Button>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>

      <Card style={{ marginTop: 24 }} title="📚 参与式学习的理论基础">
        <Collapse>
          <Panel header="建构主义学习理论" key="1">
            <Paragraph>
              建构主义认为学习是学习者主动建构知识的过程，而非被动接受。参与式学习强调：
            </Paragraph>
            <ul>
              <li>学习者的主动参与和探究</li>
              <li>在真实情境中解决问题</li>
              <li>通过社会互动建构理解</li>
              <li>教师作为引导者而非知识传授者</li>
            </ul>
          </Panel>
          <Panel header="有效教学的七个原则" key="2">
            <ol>
              <li>鼓励师生接触</li>
              <li>发展学生之间的互惠与合作</li>
              <li>运用主动学习技术</li>
              <li>给予及时反馈</li>
              <li>强调任务时间</li>
              <li>传达高期望</li>
              <li>尊重不同的才能和学习方式</li>
            </ol>
          </Panel>
          <Panel header="布卢姆分类学与高阶思维" key="3">
            <Paragraph>
              参与式学习特别注重培养高阶思维能力：
            </Paragraph>
            <Space direction="vertical">
              <Tag color="purple">分析 (Analyze)</Tag>
              <Tag color="blue">评价 (Evaluate)</Tag>
              <Tag color="cyan">创造 (Create)</Tag>
            </Space>
            <Paragraph style={{ marginTop: 16 }}>
              通过讨论、项目、案例分析等活动，促进学生从记忆理解向高阶思维发展。
            </Paragraph>
          </Panel>
        </Collapse>
      </Card>

      <Modal
        title={selectedMethod?.title}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setGeneratedPlan('');
          form.resetFields();
        }}
        width={900}
        footer={null}
      >
        {selectedMethod && (
          <div>
            <Card type="inner" style={{ marginBottom: 16 }}>
              <ReactMarkdown>{selectedMethod.details}</ReactMarkdown>
            </Card>

            <Card type="inner" title="生成教学活动方案">
              <Form form={form} layout="vertical" onFinish={handleGeneratePlan}>
                <Form.Item
                  label="课程主题"
                  name="topic"
                  rules={[{ required: true, message: '请输入课程主题' }]}
                >
                  <Input placeholder="例如：Python函数与模块" />
                </Form.Item>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      label="授课对象"
                      name="students"
                      rules={[{ required: true }]}
                    >
                      <Input placeholder="例如：大二计算机专业学生" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label="课时时长（分钟）"
                      name="duration"
                      rules={[{ required: true }]}
                    >
                      <Input type="number" placeholder="例如：90" />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  label="教学目标"
                  name="objectives"
                  rules={[{ required: true }]}
                >
                  <TextArea
                    rows={3}
                    placeholder="请描述这节课的教学目标"
                  />
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    icon={<RocketOutlined />}
                    block
                  >
                    生成教学方案
                  </Button>
                </Form.Item>
              </Form>

              {loading && (
                <div style={{ textAlign: 'center', padding: 40 }}>
                  <Spin size="large" />
                  <div style={{ marginTop: 16 }}>
                    <Text type="secondary">正在生成教学方案...</Text>
                  </div>
                </div>
              )}

              {generatedPlan && (
                <Card
                  style={{ marginTop: 16, background: '#fafafa' }}
                  title={
                    <Space>
                      <CheckCircleOutlined style={{ color: '#52c41a' }} />
                      <Text>生成的教学方案</Text>
                    </Space>
                  }
                >
                  <div style={{ maxHeight: 500, overflowY: 'auto' }}>
                    <ReactMarkdown>{generatedPlan}</ReactMarkdown>
                  </div>
                </Card>
              )}
            </Card>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ParticipativeLearning;

