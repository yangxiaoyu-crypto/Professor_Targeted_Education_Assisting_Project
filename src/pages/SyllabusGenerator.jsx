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
  HistoryOutlined,
} from '@ant-design/icons';
import ReactMarkdown from 'react-markdown';
import { llmService } from '../services/api';
import { knowledgeService } from '../services/knowledgeApi';
import HistoryDrawer from '../components/HistoryDrawer';
import { storage } from '../utils/storage';

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { Panel } = Collapse;

const SyllabusGenerator = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [generatedSyllabus, setGeneratedSyllabus] = useState('');
  const [streamingContent, setStreamingContent] = useState('');
  const [historyVisible, setHistoryVisible] = useState(false);
  const [knowledgeSources, setKnowledgeSources] = useState([]);

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

  const generatePrompt = (values, knowledgeResults = []) => {
    let prompt = '';
    
    // 如果有知识库结果，添加参考资料
    if (knowledgeResults.length > 0) {
      prompt += `# 📚 参考资料\n以下是从知识库中检索到的相关教学资料，请参考其中的理念和方法（但不要照搬）：\n\n`;
      knowledgeResults.forEach((ref, idx) => {
        const content = ref.content.substring(0, 300);
        prompt += `## 参考资料 ${idx + 1}：${ref.source}\n${content}...\n\n`;
      });
      prompt += `---\n\n`;
    }
    
    prompt += `你是一位资深教学设计专家。请为以下课程设计一份高质量的课程大纲。

# 课程信息
- **课程名称**：${values.courseName}
- **课程类型**：${values.courseType}
- **学时学分**：${values.credits}学分，${values.hours}学时
- **授课对象**：${values.targetStudents}
- **先修课程**：${values.prerequisites || '无'}
- **教学模式**：${values.teachingModel}
${values.courseFeatures ? `- **课程特色**：${values.courseFeatures}` : ''}

# 教师构想
${values.teacherIdeas || '请基于教学设计最佳实践提供专业建议'}

---

# 任务要求

请深入思考并生成一份完整的课程大纲，需包含以下核心部分：

## 1. 课程概述与定位
- 课程在专业培养体系中的作用
- 与先修课程和后续课程的衔接

## 2. 学习成果（Learning Outcomes）
基于布卢姆分类学，设计分层次的学习目标：
- **知识维度**：学生将掌握哪些核心概念和原理
- **能力维度**：学生将具备哪些可迁移的技能
- **素质维度**：培养哪些职业态度和价值观
- **思政目标**：如何自然融入价值引领

## 3. 教学内容与进度安排
按周次或模块详细规划（建议${Math.ceil(values.hours / 2)}-${Math.ceil(values.hours / 2) + 2}周）：
- 每周主题、知识点、重难点
- 对应的教学活动设计（结合${values.teachingModel}）
- 课前准备、课堂活动、课后任务

## 4. 教学方法与策略
结合${values.teachingModel}，具体说明：
- 如何促进学生主动学习和深度参与
- 如何运用信息技术增强教学效果
- 如何设计师生互动和生生协作

## 5. 评价与考核体系
设计科学的评价方案：
- 形成性评价（建议40-60%）：具体方式、频次、权重
- 总结性评价（建议40-60%）：考核形式、内容分布
- 评价标准（Rubric）示例
- 反馈机制和改进循环

## 6. 教学资源配置
- 必读教材和推荐参考书
- 在线学习资源和工具
- 实验/实践环境需求

## 7. 课程特色与创新点
- 本课程的独特设计理念
- 与传统教学的差异化优势

---

# 设计原则
1. **对齐性**：目标-内容-方法-评价四位一体
2. **学生中心**：关注学习体验和学习成果
3. **可操作性**：具体、清晰、可执行
4. **创新性**：体现现代教学理念和技术应用
5. **思政融入**：价值引领润物细无声

请基于泰勒原理、逆向设计（UbD）和加涅教学事件理论，生成一份专业、完整、可直接使用的课程大纲。`;
    
    return prompt;
  };

  const handleGenerate = async (values) => {
    setLoading(true);
    setGeneratedSyllabus('');
    setStreamingContent('');
    setKnowledgeSources([]);

    try {
      // 1. 先检索知识库
      let knowledgeResults = [];
      try {
        const searchQuery = `${values.courseName} ${values.teachingModel} 课程设计 教学大纲`;
        knowledgeResults = await knowledgeService.search({
          query: searchQuery,
          topK: 3
        });
        
        if (knowledgeResults.length > 0) {
          setKnowledgeSources(knowledgeResults);
          message.info(`已从知识库检索到 ${knowledgeResults.length} 条相关参考资料`);
        }
      } catch (error) {
        console.warn('知识库检索失败，将不使用参考资料:', error);
        // 知识库检索失败不影响主流程
      }

      // 2. 生成增强的prompt
      const prompt = generatePrompt(values, knowledgeResults);

      // 3. 使用流式生成
      let fullContent = '';
      await llmService.streamGenerate(
        prompt,
        {
          systemPrompt:
            '你是一位拥有20年教学设计经验的专家，精通泰勒原理、逆向设计（UbD）、布卢姆分类学等教学理论。你擅长将理论转化为可操作的教学方案，注重目标-内容-方法-评价的系统对齐。你的设计既专业规范又富有创新性，深受教师欢迎。要求：输出Markdown格式，禁止输出任何HTML标签（如<br>、<div>、<p>等），换行用回车符表示。',
          temperature: 0.65,
          maxTokens: 6000,
        },
        (chunk) => {
          fullContent += chunk;
          setStreamingContent(fullContent);
        }
      );

      setGeneratedSyllabus(fullContent);
      message.success('课程大纲生成成功！');
      
      // 保存到历史记录
      storage.saveHistory('syllabus', {
        title: values.courseName,
        content: fullContent,
        formData: values,
      });
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

  // 加载历史记录到表单
  const handleLoadHistory = (item) => {
    // 填充表单数据
    form.setFieldsValue(item.formData);
    // 显示之前生成的内容
    setGeneratedSyllabus(item.content);
    setStreamingContent('');
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>
          <FileTextOutlined /> 快速生成教学大纲
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
                <Space style={{ width: '100%' }} direction="vertical">
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
                  <Button
                    icon={<HistoryOutlined />}
                    onClick={() => setHistoryVisible(true)}
                    size="large"
                    block
                  >
                    查看历史记录
                  </Button>
                </Space>
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
              <>
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
                
                {/* 显示参考来源 */}
                {knowledgeSources.length > 0 && (
                  <Card 
                    title="📚 参考来源" 
                    size="small" 
                    style={{ marginTop: 16 }}
                  >
                    <Paragraph type="secondary" style={{ marginBottom: 12 }}>
                      本次生成参考了以下知识库资料：
                    </Paragraph>
                    <Space wrap>
                      {knowledgeSources.map((source, idx) => (
                        <Tag 
                          key={idx} 
                          icon={<FileTextOutlined />}
                          color="blue"
                        >
                          {source.source}
                        </Tag>
                      ))}
                    </Space>
                  </Card>
                )}
              </>
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

      {/* 历史记录抽屉 */}
      <HistoryDrawer
        visible={historyVisible}
        onClose={() => setHistoryVisible(false)}
        type="syllabus"
        onLoad={handleLoadHistory}
      />
    </div>
  );
};

export default SyllabusGenerator;

