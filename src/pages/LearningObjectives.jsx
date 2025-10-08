import React, { useState } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Select,
  Space,
  Typography,
  Row,
  Col,
  Alert,
  message,
  Spin,
  Table,
  Tag,
  Collapse,
} from 'antd';
import { BulbOutlined, RocketOutlined, CheckCircleOutlined } from '@ant-design/icons';
import ReactMarkdown from 'react-markdown';
import { llmService } from '../services/api';

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { Panel } = Collapse;

const LearningObjectives = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [generatedObjectives, setGeneratedObjectives] = useState('');

  // 布卢姆分类学 - 认知领域
  const bloomCognitive = [
    { level: '记忆', verbs: '列举、识别、描述、命名、标记、复述', color: '#f0f0f0' },
    { level: '理解', verbs: '解释、总结、推断、分类、比较、例证', color: '#e6f7ff' },
    { level: '应用', verbs: '执行、实施、使用、解决、演示、操作', color: '#d9f7be' },
    { level: '分析', verbs: '区分、组织、归因、比较、解构、检查', color: '#fff1b8' },
    { level: '评价', verbs: '检查、评判、批判、论证、辩护、支持', color: '#ffd8bf' },
    { level: '创造', verbs: '设计、构建、规划、制作、发明、产生', color: '#ffd6e7' },
  ];

  const generatePrompt = (values) => {
    return `请作为教学设计专家，基于布卢姆教育目标分类学和加涅学习结果分类，为以下课程撰写详细的学习目标：

【课程信息】
课程名称：${values.courseName}
课程主题/章节：${values.topic}
授课对象：${values.students}
预期认知层次：${values.cognitiveLevel}

【教师想法】
${values.teacherIdeas || ''}

请按照以下框架撰写学习目标：

## 一、总体学习目标
（符合SMART原则：具体Specific、可测量Measurable、可达成Achievable、相关性Relevant、有时限Time-bound）

## 二、分类学习目标

### 1. 知识目标（认知领域 - 布卢姆分类）
根据${values.cognitiveLevel}层次，使用准确的行为动词：
- [具体目标1]：学生能够...
- [具体目标2]：学生能够...
- [具体目标3]：学生能够...

### 2. 能力目标（技能领域）
基于加涅的智慧技能和认知策略：
- [能力目标1]
- [能力目标2]

### 3. 素质目标（情感态度价值观）
- [素质目标1]
- [素质目标2]

## 三、学习成果（Learning Outcomes）
完成学习后，学生将能够：
1. [可观察、可测量的成果1]
2. [可观察、可测量的成果2]
3. [可观察、可测量的成果3]

## 四、目标对应的评价方式
为每个学习目标建议合适的评价方法（测验、作业、项目、展示等）

## 五、教学活动建议
为实现这些目标，建议采用的教学活动类型

请确保：
1. 使用准确的行为动词（避免"了解"、"知道"等模糊动词）
2. 目标具体、可测量、可观察
3. 覆盖不同认知层次
4. 与课程整体目标对齐
5. 符合学生的认知发展水平`;
  };

  const handleGenerate = async (values) => {
    setLoading(true);
    setGeneratedObjectives('');

    try {
      const prompt = generatePrompt(values);
      let content = '';

      await llmService.streamGenerate(
        prompt,
        {
          systemPrompt:
            '你是一位教学设计专家，精通布卢姆教育目标分类学、加涅学习结果分类等理论。你的任务是帮助教师撰写清晰、具体、可测量的学习目标。',
          temperature: 0.6,
          maxTokens: 3000,
        },
        (chunk) => {
          content += chunk;
          setGeneratedObjectives(content);
        }
      );

      message.success('学习目标生成成功！');
    } catch (error) {
      message.error('生成失败，请稍后重试');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: '认知层次',
      dataIndex: 'level',
      key: 'level',
      width: 100,
      render: (text, record) => (
        <Tag color={record.color === '#f0f0f0' ? 'default' : 'blue'}>{text}</Tag>
      ),
    },
    {
      title: '常用行为动词',
      dataIndex: 'verbs',
      key: 'verbs',
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>
          <BulbOutlined /> 学习目标智能撰写
        </Title>
        <Paragraph>
          基于布卢姆教育目标分类学（Bloom's Taxonomy）和加涅学习结果分类（Gagné's Learning Outcomes），
          帮助您撰写清晰、具体、可测量的学习目标。
        </Paragraph>
      </div>

      <Alert
        message="💡 什么是好的学习目标？"
        description={
          <div>
            <p>好的学习目标应该符合<strong>SMART原则</strong>：</p>
            <ul style={{ paddingLeft: 20 }}>
              <li><strong>S</strong>pecific - 具体明确</li>
              <li><strong>M</strong>easurable - 可测量</li>
              <li><strong>A</strong>chievable - 可达成</li>
              <li><strong>R</strong>elevant - 相关性强</li>
              <li><strong>T</strong>ime-bound - 有时限</li>
            </ul>
            <p style={{ marginTop: 8 }}>
              <strong>示例：</strong>"学生能够运用Python语言编写包含函数定义和调用的程序，解决实际问题"
            </p>
          </div>
        }
        type="info"
        style={{ marginBottom: 24 }}
        showIcon
      />

      <Row gutter={24}>
        <Col xs={24} lg={12}>
          <Card title="📚 布卢姆认知分类学参考" style={{ marginBottom: 24 }}>
            <Table
              dataSource={bloomCognitive}
              columns={columns}
              pagination={false}
              size="small"
            />
            <Alert
              message="使用建议"
              description="从低阶到高阶：基础课程侧重记忆、理解、应用；高级课程强调分析、评价、创造"
              type="warning"
              style={{ marginTop: 16 }}
              showIcon
            />
          </Card>

          <Card title="📝 填写课程信息">
            <Form form={form} layout="vertical" onFinish={handleGenerate}>
              <Form.Item
                label="课程名称"
                name="courseName"
                rules={[{ required: true, message: '请输入课程名称' }]}
              >
                <Input placeholder="例如：数据结构与算法" />
              </Form.Item>

              <Form.Item
                label="课程主题/章节"
                name="topic"
                rules={[{ required: true, message: '请输入主题' }]}
              >
                <Input placeholder="例如：第3章 栈与队列" />
              </Form.Item>

              <Form.Item
                label="授课对象"
                name="students"
                rules={[{ required: true, message: '请输入授课对象' }]}
              >
                <Input placeholder="例如：计算机专业本科二年级学生" />
              </Form.Item>

              <Form.Item
                label="主要认知层次"
                name="cognitiveLevel"
                rules={[{ required: true, message: '请选择认知层次' }]}
                tooltip="根据课程难度和学生水平选择期望达到的主要认知层次"
              >
                <Select placeholder="请选择">
                  <Option value="记忆、理解">记忆、理解（基础层次）</Option>
                  <Option value="理解、应用">理解、应用（中等层次）</Option>
                  <Option value="应用、分析">应用、分析（中高层次）</Option>
                  <Option value="分析、评价、创造">
                    分析、评价、创造（高阶思维）
                  </Option>
                </Select>
              </Form.Item>

              <Form.Item
                label="您的想法（可选）"
                name="teacherIdeas"
                tooltip="描述您希望学生掌握什么、达到什么水平"
              >
                <TextArea
                  rows={4}
                  placeholder="例如：希望学生不仅理解栈和队列的概念，还能在实际编程中灵活应用，能够分析何时使用栈、何时使用队列..."
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  icon={<RocketOutlined />}
                  size="large"
                  block
                >
                  {loading ? '正在生成...' : '生成学习目标'}
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="📄 生成的学习目标" style={{ minHeight: 600 }}>
            {loading && (
              <div style={{ textAlign: 'center', padding: 40 }}>
                <Spin size="large" />
                <div style={{ marginTop: 16 }}>
                  <Text type="secondary">AI正在撰写学习目标...</Text>
                </div>
              </div>
            )}

            {generatedObjectives && (
              <div
                style={{
                  background: '#fafafa',
                  padding: 24,
                  borderRadius: 8,
                  maxHeight: 700,
                  overflowY: 'auto',
                }}
              >
                <ReactMarkdown>{generatedObjectives}</ReactMarkdown>
              </div>
            )}

            {!loading && !generatedObjectives && (
              <div style={{ textAlign: 'center', padding: 100, color: '#999' }}>
                <BulbOutlined style={{ fontSize: 64, marginBottom: 16 }} />
                <div>请填写左侧表单并生成学习目标</div>
              </div>
            )}
          </Card>

          <Card title="📖 理论参考" style={{ marginTop: 24 }}>
            <Collapse>
              <Panel header="布卢姆认知目标分类（修订版）" key="1">
                <Paragraph>
                  Anderson & Krathwohl (2001) 修订的布卢姆分类学将认知过程分为六个层次：
                </Paragraph>
                <ol>
                  <li><strong>记忆</strong>：从长期记忆中提取相关知识</li>
                  <li><strong>理解</strong>：从教学信息中建构意义</li>
                  <li><strong>应用</strong>：在给定情境中执行或使用程序</li>
                  <li><strong>分析</strong>：将材料分解并确定各部分关系</li>
                  <li><strong>评价</strong>：基于标准和准则做出判断</li>
                  <li><strong>创造</strong>：将元素组合形成功能整体</li>
                </ol>
              </Panel>
              <Panel header="加涅的学习结果分类" key="2">
                <Paragraph>
                  加涅将学习结果分为五类：
                </Paragraph>
                <ul>
                  <li><strong>言语信息</strong>：陈述性知识（知道是什么）</li>
                  <li><strong>智慧技能</strong>：程序性知识（知道怎么做）</li>
                  <li><strong>认知策略</strong>：学习和思维的策略</li>
                  <li><strong>动作技能</strong>：身体动作的熟练程度</li>
                  <li><strong>态度</strong>：影响行为选择的内部状态</li>
                </ul>
              </Panel>
              <Panel header="如何撰写可测量的学习目标" key="3">
                <Paragraph>
                  学习目标的基本结构：<strong>行为主体 + 行为动词 + 行为条件 + 表现水平</strong>
                </Paragraph>
                <Paragraph>
                  <strong>示例：</strong>
                  "学生能够（主体）在给定数据集的情况下（条件），运用Python编写（动词）
                  至少包含3种不同算法的数据分析程序（表现水平）"
                </Paragraph>
                <Paragraph>
                  <strong>避免使用模糊动词：</strong>了解、知道、熟悉、理解（太笼统）
                </Paragraph>
                <Paragraph>
                  <strong>推荐使用具体动词：</strong>列举、解释、计算、设计、评价、创建
                </Paragraph>
              </Panel>
            </Collapse>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default LearningObjectives;

