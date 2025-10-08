import React, { useState } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Select,
  Space,
  Typography,
  Divider,
  Alert,
  Spin,
  message,
  Row,
  Col,
  Collapse,
  Tag,
} from 'antd';
import {
  FileTextOutlined,
  DownloadOutlined,
  CopyOutlined,
  RocketOutlined,
} from '@ant-design/icons';
import ReactMarkdown from 'react-markdown';
import { llmService } from '../services/api';

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { Panel } = Collapse;

const SyllabusGenerator = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [generatedSyllabus, setGeneratedSyllabus] = useState('');
  const [streamingContent, setStreamingContent] = useState('');

  const courseTypes = [
    '理工类课程',
    '人文社科类课程',
    '艺术类课程',
    '医学类课程',
    '经济管理类课程',
    '其他',
  ];

  const teachingModels = [
    'BOPPPS模式',
    '项目化学习(PBL)',
    '翻转课堂',
    '案例教学',
    '混合式教学',
    '传统讲授',
  ];

  const generatePrompt = (values) => {
    return `请作为教学设计专家，根据以下信息生成一份完整、规范的课程大纲：

【课程基本信息】
课程名称：${values.courseName}
课程类型：${values.courseType}
学时学分：${values.credits}学分，${values.hours}学时
授课对象：${values.targetStudents}
先修课程：${values.prerequisites || '无'}

【教学理念】
教学模式：${values.teachingModel}
课程特色：${values.courseFeatures || ''}

【教师想法】
${values.teacherIdeas || '请根据教学设计理论提供专业建议'}

请参考以下教学设计理论和框架：
1. 泰勒原理（Tyler Rationale）- 目标、内容、方法、评价的系统设计
2. 逆向设计（Understanding by Design）- 从学习结果出发设计课程
3. 布卢姆教育目标分类学 - 认知、情感、动作技能目标
4. 加涅九大教学事件 - 引起注意、告知目标、刺激回忆等
5. 以学习者为中心的教学理念

请生成包含以下部分的完整课程大纲：

## 一、课程概述
- 课程性质与定位
- 课程目标（总体目标和具体目标，使用布卢姆分类法）
- 课程内容简介

## 二、学习成果（Learning Outcomes）
- 知识目标（Knowledge）
- 能力目标（Skills）
- 素质目标（Attitudes & Values）
- 课程思政目标

## 三、教学内容与安排
（请按周次或章节详细列出）
- 每周/章节的主题
- 教学重点与难点
- 教学方法与活动设计
- 预习要求与课后作业

## 四、教学方法与策略
- 主要教学方法
- 师生互动设计
- 参与式学习活动
- 信息技术应用

## 五、评价与考核
- 评价方式（形成性评价 + 总结性评价）
- 评分标准与权重
- 评价量表设计
- 反馈机制

## 六、教学资源
- 教材与参考书
- 在线资源
- 教学工具与平台

## 七、课程思政融入
- 思政元素与专业知识的融合点
- 价值引领的具体实施

请确保大纲专业、规范，符合高等教育教学要求，同时体现创新性和实用性。`;
  };

  const handleGenerate = async (values) => {
    setLoading(true);
    setGeneratedSyllabus('');
    setStreamingContent('');

    try {
      const prompt = generatePrompt(values);

      // 使用流式生成
      let fullContent = '';
      await llmService.streamGenerate(
        prompt,
        {
          systemPrompt:
            '你是一位资深的教学设计专家，熟悉各种教学理论和教学方法。你的任务是帮助大学教授设计高质量的课程大纲，使其符合教学规范，同时具有创新性和可操作性。',
          temperature: 0.7,
          maxTokens: 4000,
        },
        (chunk) => {
          fullContent += chunk;
          setStreamingContent(fullContent);
        }
      );

      setGeneratedSyllabus(fullContent);
      message.success('课程大纲生成成功！');
    } catch (error) {
      console.error('生成失败:', error);
      message.error('生成失败，请检查网络连接或稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedSyllabus || streamingContent);
    message.success('已复制到剪贴板');
  };

  const handleDownload = () => {
    const blob = new Blob([generatedSyllabus || streamingContent], {
      type: 'text/markdown',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `课程大纲_${form.getFieldValue('courseName')}_${new Date().getTime()}.md`;
    a.click();
    URL.revokeObjectURL(url);
    message.success('下载成功');
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>
          <FileTextOutlined /> 课程大纲智能生成
        </Title>
        <Paragraph>
          基于教学设计理论（泰勒原理、逆向设计、布卢姆分类等），智能生成规范的课程大纲。
          您可以输入自己的想法，AI将帮助您优化和完善。
        </Paragraph>
      </div>

      <Row gutter={24}>
        <Col xs={24} lg={10}>
          <Card title="📝 填写课程信息" style={{ marginBottom: 24 }}>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleGenerate}
              initialValues={{
                teachingModel: 'BOPPPS模式',
                courseType: '理工类课程',
              }}
            >
              <Form.Item
                label="课程名称"
                name="courseName"
                rules={[{ required: true, message: '请输入课程名称' }]}
              >
                <Input placeholder="例如：数据结构与算法" />
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="课程类型"
                    name="courseType"
                    rules={[{ required: true }]}
                  >
                    <Select>
                      {courseTypes.map((type) => (
                        <Option key={type} value={type}>
                          {type}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="教学模式"
                    name="teachingModel"
                    rules={[{ required: true }]}
                  >
                    <Select>
                      {teachingModels.map((model) => (
                        <Option key={model} value={model}>
                          {model}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="学分"
                    name="credits"
                    rules={[{ required: true, message: '请输入学分' }]}
                  >
                    <Input type="number" placeholder="例如：3" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="学时"
                    name="hours"
                    rules={[{ required: true, message: '请输入学时' }]}
                  >
                    <Input type="number" placeholder="例如：48" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                label="授课对象"
                name="targetStudents"
                rules={[{ required: true, message: '请输入授课对象' }]}
              >
                <Input placeholder="例如：计算机专业本科二年级学生" />
              </Form.Item>

              <Form.Item label="先修课程" name="prerequisites">
                <Input placeholder="例如：程序设计基础、离散数学" />
              </Form.Item>

              <Form.Item label="课程特色" name="courseFeatures">
                <TextArea
                  rows={3}
                  placeholder="例如：注重实践能力培养，采用项目驱动教学..."
                />
              </Form.Item>

              <Form.Item label="您的教学想法（可选）" name="teacherIdeas">
                <TextArea
                  rows={4}
                  placeholder="请输入您对这门课的初步想法、教学重点、希望达到的效果等。AI将基于您的想法和教学理论生成专业的课程大纲。"
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
                  {loading ? '正在生成中...' : '生成课程大纲'}
                </Button>
              </Form.Item>
            </Form>
          </Card>

          <Alert
            message="💡 使用提示"
            description={
              <ul style={{ paddingLeft: 20, margin: '8px 0' }}>
                <li>填写的信息越详细，生成的大纲越符合您的需求</li>
                <li>可以多次生成，比较不同方案的优劣</li>
                <li>生成后可以手动编辑和调整</li>
                <li>建议参考知识库中的优秀案例</li>
              </ul>
            }
            type="info"
            showIcon
          />
        </Col>

        <Col xs={24} lg={14}>
          <Card
            title="📄 生成的课程大纲"
            extra={
              (generatedSyllabus || streamingContent) && (
                <Space>
                  <Button
                    icon={<CopyOutlined />}
                    onClick={handleCopy}
                    disabled={loading}
                  >
                    复制
                  </Button>
                  <Button
                    icon={<DownloadOutlined />}
                    onClick={handleDownload}
                    disabled={loading}
                  >
                    下载
                  </Button>
                </Space>
              )
            }
            style={{ minHeight: 600 }}
          >
            {loading && (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <Spin size="large" />
                <div style={{ marginTop: 16 }}>
                  <Text type="secondary">AI正在为您生成课程大纲，请稍候...</Text>
                </div>
              </div>
            )}

            {(streamingContent || generatedSyllabus) && (
              <div
                style={{
                  background: '#fafafa',
                  padding: 24,
                  borderRadius: 8,
                  maxHeight: '800px',
                  overflowY: 'auto',
                }}
              >
                <ReactMarkdown>{streamingContent || generatedSyllabus}</ReactMarkdown>
              </div>
            )}

            {!loading && !generatedSyllabus && !streamingContent && (
              <div
                style={{
                  textAlign: 'center',
                  padding: '100px 0',
                  color: '#999',
                }}
              >
                <FileTextOutlined style={{ fontSize: 64, marginBottom: 16 }} />
                <div>请填写左侧表单并点击生成按钮</div>
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default SyllabusGenerator;

