import React, { useState, useRef } from 'react';
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
  Upload,
  Modal,
} from 'antd';
import MascotCharacter from '../components/MascotCharacter';
import {
  FileTextOutlined,
  DownloadOutlined,
  CopyOutlined,
  RocketOutlined,
  HistoryOutlined,
  UploadOutlined,
  PlusOutlined,
  CheckOutlined,
} from '@ant-design/icons';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { llmService } from '../services/api';
import { knowledgeService } from '../services/knowledgeApi';
import HistoryDrawer from '../components/HistoryDrawer';
import { storage } from '../utils/storage';

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { Panel } = Collapse;
const { Dragger } = Upload;

const GenerateLessonPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [generatedLesson, setGeneratedLesson] = useState('');
  const [streamingContent, setStreamingContent] = useState('');
  const [historyVisible, setHistoryVisible] = useState(false);
  const [knowledgeSources, setKnowledgeSources] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [teachingMaterials, setTeachingMaterials] = useState('');
  const [showMaterialsModal, setShowMaterialsModal] = useState(false);

  // 教学方法列表
  const teachingMethods = [
    { value: '讲授法', label: '讲授法' },
    { value: '讨论法', label: '讨论法' },
    { value: '案例教学法', label: '案例教学法' },
    { value: '实验法', label: '实验法' },
    { value: '演示法', label: '演示法' },
    { value: '小组合作学习', label: '小组合作学习' },
    { value: '翻转课堂', label: '翻转课堂' },
    { value: '项目式学习', label: '项目式学习' },
    { value: '其他', label: '其他' },
  ];

  // 课程类型
  const courseTypes = [
    '理工类课程',
    '人文社科类课程',
    '艺术类课程',
    '医学类课程',
    '经济管理类课程',
    '其他',
  ];

  // 教学设计模型
  const teachingModels = [
    { value: 'boppps', label: 'BOPPPS教学设计模型' },
    { value: 'addie', label: 'ADDIE教学设计模型' },
    { value: 'pbl', label: 'PBL教学设计模型' },
    { value: 'other', label: '其他' },
  ];

  // 上传文件的处理逻辑
  const handleFileUpload = ({ file, fileList }) => {
    if (file.status === 'done') {
      message.success(`${file.name} 上传成功`);
      setUploadedFiles([...fileList]);
    } else if (file.status === 'error') {
      message.error(`${file.name} 上传失败`);
    }
    return false;
  };

  // 补充教学材料相关
  const handleAddMaterials = () => {
    setShowMaterialsModal(true);
  };

  const saveMaterials = () => {
    setShowMaterialsModal(false);
    message.success('补充教学材料保存成功');
  };

  // 生成提示词
  const generatePrompt = (values, knowledgeResults = []) => {
    let prompt = '';

    if (knowledgeResults.length > 0) {
      prompt += `# 📚 参考资料\n以下是从知识库中检索到的相关教学资料，请参考其中的理念和方法（但不要照搬）：\n\n`;
      knowledgeResults.forEach((ref, idx) => {
        const content = ref.content.substring(0, 300);
        prompt += `## 参考资料 ${idx + 1}：${ref.source}\n${content}...\n\n`;
      });
      prompt += `---\n\n`;
    }

    // 确定选中的教学设计模型名称
    const modelName = teachingModels.find(m => m.value === values.teachingModel)?.label || '';

    prompt += `你是一位资深教学设计专家。请基于以下填写的信息，按照指定结构生成一份完整、专业的单次课教学设计方案。

# 单次课教学设计核心结构（必须严格遵循）
## 1. 课时基本信息
- 课程名称：${values.courseName}
- 课时主题：${values.lessonTopic}
- 课程类型：${values.courseType}
- 课时长度：${values.lessonDuration}分钟
- 授课对象：${values.targetStudents}
- 前置知识：${values.prerequisiteKnowledge || '无'}
- 采用的教学设计模型：${modelName}

## 2. 教学设计模型应用
请详细说明如何将${modelName}应用于本次课的设计中，包括模型各阶段的具体实施方式和时间分配

## 3. 学习目标
${values.teachingObjectives || '请从知识、技能、情感态度三个维度设计教学目标'}

## 4. 学情分析
${values.studentAnalysis || '请分析学生的知识基础、学习能力、学习兴趣和可能遇到的困难'}

## 5. 学习重难点
- 教学重点：${values.teachingFocus}
- 教学难点：${values.teachingDifficulties}
- 解决策略：${values.solutionStrategy}

## 6. 教学方法与教学活动
- 教学方法：${values.teachingMethods?.join('、') || '无'}
- 实施策略：${values.teachingStrategy}
- 教学活动设计：请结合所选教学方法，设计具体的教学活动步骤

## 7. 教学过程设计
${values.teachingProcess || '请按时间顺序设计详细的教学步骤'}

## 8. 学习评价
- 课堂评价：${values.classEvaluation}
- 评价标准：请制定具体、可操作的评价标准
- 评价工具：请推荐适合的评价工具或表格

## 9. 学习资源
- 上传的资源文件：${uploadedFiles.length > 0 ? uploadedFiles.map(file => file.name).join('、') : '无'}
- 补充教学材料：${teachingMaterials || '无'}
- 资源使用建议：请说明各类资源在教学中的具体使用方式

## 10. 课后作业
${values.homework || '请设计不同层次的课后作业'}

## 11. 教学反思与改进
${values.teachingReflection || '请预设教学过程中可能出现的问题及应对措施'}

# 生成要求
1. 严格按照上述11个部分组织内容，不得遗漏任何部分
2. 内容要专业、具体、可操作，符合现代教学设计理念
3. 教学目标需基于布卢姆分类学，分层次设计
4. 教学活动设计要与教学目标、重难点相匹配，具有可操作性
5. 时间分配要合理，符合课时长度要求
6. 输出格式为Markdown，支持表格、列表等GFM语法
7. 禁止输出任何HTML标签，换行用回车符表示

请基于所选的教学设计模型，生成一份可直接使用的专业单次课教学设计方案。`;

    return prompt;
  };

  // 生成教学设计
  const handleGenerate = async (values) => {
    setLoading(true);
    setGeneratedLesson('');
    setStreamingContent('');
    setKnowledgeSources([]);

    try {
      let knowledgeResults = [];
      try {
        const searchQuery = `${values.courseName} ${values.lessonTopic} ${values.teachingMethods?.join(' ')} 教学设计 ${values.teachingModel}`;
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
      }

      const prompt = generatePrompt(values, knowledgeResults);

      let fullContent = '';
      await llmService.streamGenerate(
        prompt,
        {
          systemPrompt:
            '你是一位拥有20年教学经验的大学教授，精通各类教学设计模型和方法。擅长根据不同课程类型和学生特点设计针对性的教学方案，尤其擅长单次课的精细化设计。输出必须严格遵循指定结构，内容专业、具体、可操作。',
          temperature: 0.65,
          maxTokens: 8000,
        },
        (chunk) => {
          fullContent += chunk;
          setStreamingContent(fullContent);
        }
      );

      setGeneratedLesson(fullContent);
      message.success('教学设计生成成功！');

      storage.saveHistory('lesson', {
        title: `${values.courseName}-${values.lessonTopic}`,
        content: fullContent,
        formData: {
          ...values,
          uploadedFiles: uploadedFiles.map(file => file.name),
          teachingMaterials: teachingMaterials
        },
      });
    } catch (error) {
      console.error('生成失败:', error);
      message.error('生成失败，请检查网络连接或稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // 复制功能
  const handleCopy = () => {
    navigator.clipboard.writeText(generatedLesson || streamingContent);
    message.success('已复制到剪贴板');
  };

  // 下载功能
  const handleDownload = () => {
    const blob = new Blob([generatedLesson || streamingContent], {
      type: 'text/markdown',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `教学设计_${form.getFieldValue('courseName')}_${form.getFieldValue('lessonTopic')}_${new Date().getTime()}.md`;
    a.click();
    URL.revokeObjectURL(url);
    message.success('下载成功');
  };

  // 加载历史记录
  const handleLoadHistory = (item) => {
    try {
      if (!item.formData) {
        message.error('历史数据格式错误，缺少表单数据');
        return;
      }

      const teachingMethods = Array.isArray(item.formData.teachingMethods)
        ? item.formData.teachingMethods
        : item.formData.teachingMethods
          ? item.formData.teachingMethods.split('、')
          : [];

      form.setFieldsValue({
        ...item.formData,
        teachingMethods,
        teachingModel: item.formData.teachingModel || 'boppps'
      });

      setTeachingMaterials(item.formData.teachingMaterials || '');

      const files = item.formData.uploadedFiles
        ? item.formData.uploadedFiles.map(name => ({
          name,
          status: 'done',
          size: 0
        }))
        : [];
      setUploadedFiles(files);

      setGeneratedLesson(item.content || '');
      setStreamingContent('');

      setHistoryVisible(false);

      message.success('历史记录加载成功');
    } catch (error) {
      console.error('加载历史记录失败:', error);
      message.error('加载历史记录失败，请重试');
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>
          <FileTextOutlined /> 单次课教学设计智能生成
        </Title>
        <Paragraph>
          基于成熟教学设计模型，生成专业、规范的单次课教学设计方案。
          填写关键信息后，AI将自动补全细节，支持自定义调整。
        </Paragraph>
      </div>

      <Row gutter={24}>
        <Col xs={24} lg={10}>
          <Card title="📝 课时设计信息" style={{ marginBottom: 24 }}>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleGenerate}
              initialValues={{
                courseType: '理工类课程',
                teachingMethods: [],
              }}
            >
              <Collapse defaultActiveKey={['basicInfo', 'teachingModel', 'teachingObjectives', 'studentAnalysis', 'teachingFocus', 'teachingMethods', 'teachingPreparation', 'teachingProcess', 'evaluation']}>
                <Panel header="1. 课时基本信息" key="basicInfo">
                  <Row gutter={16}>
                    <Col span={24}>
                      <Form.Item
                        label="课程名称"
                        name="courseName"
                        rules={[{ required: true, message: '请输入课程名称' }]}
                      >
                        <Input placeholder="例如：数据结构与算法" />
                      </Form.Item>
                    </Col>
                    <Col span={24}>
                      <Form.Item
                        label="课时主题"
                        name="lessonTopic"
                        rules={[{ required: true, message: '请输入课时主题' }]}
                      >
                        <Input placeholder="例如：二叉树的遍历" />
                      </Form.Item>
                    </Col>
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
                        label="课时长度（分钟）"
                        name="lessonDuration"
                        rules={[{ required: true, message: '请输入课时长度' }]}
                      >
                        <Input type="number" placeholder="例如：45" />
                      </Form.Item>
                    </Col>
                    <Col span={24}>
                      <Form.Item
                        label="授课对象"
                        name="targetStudents"
                        rules={[{ required: true, message: '请输入授课对象' }]}
                      >
                        <Input placeholder="例如：计算机专业本科二年级学生" />
                      </Form.Item>
                    </Col>
                    <Col span={24}>
                      <Form.Item label="前置知识" name="prerequisiteKnowledge">
                        <Input placeholder="例如：树的基本概念、递归算法（多个用顿号「、」分隔）" />
                      </Form.Item>
                    </Col>
                  </Row>
                </Panel>

                <Panel header="2. 教学设计模型选择" key="teachingModel">
                  <Form.Item
                    label="选择教学设计模型"
                    name="teachingModel"
                  >
                    <Select placeholder="请选择教学设计模型">
                      {teachingModels.map(model => (
                        <Option key={model.value} value={model.value}>
                          {model.label}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>

                  <Form.Item
                    noStyle
                    dependencies={['teachingModel']}
                  >
                    {({ getFieldValue }) => {
                      const teachingModel = getFieldValue('teachingModel');
                      if (teachingModel === 'other') {
                        return (
                          <Form.Item
                            label="请说明您选择的教学设计模型"
                            name="otherTeachingModel"
                            rules={[{ required: true, message: '请填写其他教学设计模型的说明' }]}
                            style={{ marginTop: 12 }}
                          >
                            <Input placeholder="例如：混合式教学设计模型、项目驱动教学模型等" />
                          </Form.Item>
                        );
                      }
                      return null;
                    }}
                  </Form.Item>
                  
                  <Collapse defaultActiveKey={[]} style={{ marginTop: 12 }}>
                    <Panel header="各模型简介（点击展开）" key="modelIntro">
                      <div style={{ padding: 12, background: '#f9f9f9', borderRadius: 6 }}>
                        <div style={{ marginBottom: 16 }}>
                          <Text strong>BOPPPS教学设计模型</Text>
                          <Paragraph size="small" style={{ margin: '4px 0 8px 0' }}>
                            定义：BOPPPS是一种结构化的教学设计模型，包含六个阶段：导入（Bridge-in）、目标（Objective）、前测（Pre-assessment）、参与式学习（Participatory Learning）、后测（Post-assessment）和总结（Summary）。
                          </Paragraph>
                          <Text type="secondary" size="small">
                            适用场景：各类理论课和实践课，尤其适合知识点集中的单次课设计
                          </Text>
                        </div>
                        <div style={{ marginBottom: 16 }}>
                          <Text strong>ADDIE教学设计模型</Text>
                          <Paragraph size="small" style={{ margin: '4px 0 8px 0' }}>
                            定义：ADDIE是一个系统性的教学设计框架，包括分析（Analysis）、设计（Design）、开发（Development）、实施（Implementation）和评价（Evaluation）五个阶段。
                          </Paragraph>
                          <Text type="secondary" size="small">
                            适用场景：需要系统规划的课程单元设计，强调教学过程的完整性和评价反馈
                          </Text>
                        </div>
                        <div>
                          <Text strong>PBL教学设计模型</Text>
                          <Paragraph size="small" style={{ margin: '4px 0 8px 0' }}>
                            定义：以问题为导向的学习（Problem-Based Learning），通过真实、复杂的问题驱动学生自主探究、协作学习，最终解决问题并掌握知识。
                          </Paragraph>
                          <Text type="secondary" size="small">
                            适用场景：应用型、实践性强的课程内容，强调学生的主动探究和问题解决能力
                          </Text>
                        </div>
                      </div>
                    </Panel>
                  </Collapse>
                </Panel>

                <Panel header="3. 学习目标" key="teachingObjectives">
                  <Form.Item
                    label="教学目标详情"
                    name="teachingObjectives"
                    rules={[{ required: true, message: '请填写教学目标' }]}
                  >
                    <TextArea
                      rows={6}
                      placeholder="请从知识、技能、情感态度三个维度设计教学目标（例如：1. 知识维度：理解二叉树的三种遍历方式；2. 技能维度：能够实现二叉树遍历算法并应用；3. 情感态度：培养逻辑思维和问题解决能力）"
                    />
                  </Form.Item>
                  <Alert
                    message="填写提示"
                    description="建议基于布卢姆分类学，分层次设计教学目标，确保目标可衡量、可达成"
                    type="info"
                    size="small"
                  />
                </Panel>

                <Panel header="4. 学情分析" key="studentAnalysis">
                  <Form.Item
                    label="学情分析详情"
                    name="studentAnalysis"
                    rules={[{ required: true, message: '请填写学情分析' }]}
                  >
                    <TextArea
                      rows={5}
                      placeholder="请分析学生的知识基础、学习能力、学习兴趣和可能遇到的困难（例如：1. 知识基础：学生已掌握树的基本概念，但对递归思想理解不深；2. 学习能力：具备基本编程能力，但算法设计能力参差不齐；3. 学习兴趣：对可视化演示和实际应用案例兴趣较高；4. 可能困难：难以理解递归遍历的执行过程）"
                    />
                  </Form.Item>
                </Panel>

                <Panel header="5. 学习重难点" key="teachingFocus">
                  <Form.Item
                    label="教学重点"
                    name="teachingFocus"
                    rules={[{ required: true, message: '请填写教学重点' }]}
                  >
                    <Input placeholder="例如：二叉树的三种遍历算法的实现" />
                  </Form.Item>
                  <Form.Item
                    label="教学难点"
                    name="teachingDifficulties"
                    rules={[{ required: true, message: '请填写教学难点' }]}
                  >
                    <Input placeholder="例如：递归思想在遍历算法中的应用" />
                  </Form.Item>
                  <Form.Item
                    label="解决策略"
                    name="solutionStrategy"
                    rules={[{ required: true, message: '请填写解决策略' }]}
                  >
                    <TextArea
                      rows={3}
                      placeholder="例如：1. 通过动画演示遍历过程；2. 设计由简到难的练习；3. 小组讨论分析递归过程"
                    />
                  </Form.Item>
                </Panel>

                <Panel header="6. 教学方法与策略" key="teachingMethods">
                  <Form.Item
                    label="教学方法"
                    name="teachingMethods"
                  >
                    <Select
                      mode="multiple"
                      placeholder="请选择教学方法（可多选）"
                      style={{ width: '100%' }}
                    >
                      {teachingMethods.map(method => (
                        <Option key={method.value} value={method.value}>
                          {method.label}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>

                  <Form.Item
                    noStyle
                    dependencies={['teachingMethods']}
                  >
                    {({ getFieldValue }) => {
                      const teachingMethods = getFieldValue('teachingMethods');
                      if (Array.isArray(teachingMethods) && teachingMethods.includes('其他')) {
                        return (
                          <Form.Item
                            label="请说明您选择的教学方法"
                            name="otherTeachingMethod"
                            rules={[{ required: true, message: '请填写其他教学方法的说明' }]}
                            style={{ marginTop: 12 }}
                          >
                            <Input placeholder="例如：混合式教学、翻转课堂等" />
                          </Form.Item>
                        );
                      }
                      return null;
                    }}
                  </Form.Item>

                  <Form.Item
                    label="实施策略"
                    name="teachingStrategy"
                    rules={[{ required: true, message: '请填写实施策略' }]}
                  >
                    <TextArea
                      rows={4}
                      placeholder="请说明教学方法的具体实施策略和步骤（例如：1. 采用演示法展示二叉树遍历过程；2. 结合小组合作学习，让学生互相讲解算法思路；3. 通过翻转课堂，课前布置预习任务，课堂时间专注于实践和答疑）"
                    />
                  </Form.Item>
                </Panel>

                <Panel header="7. 教学准备" key="teachingPreparation">
                  <Form.Item
                    label="教师准备"
                    name="teacherPreparation"
                    rules={[{ required: true, message: '请填写教师准备内容' }]}
                  >
                    <TextArea
                      rows={3}
                      placeholder="例如：1. 制作PPT课件；2. 准备二叉树模型；3. 设计练习题"
                    />
                  </Form.Item>
                  <Form.Item
                    label="学生准备"
                    name="studentPreparation"
                  >
                    <TextArea
                      rows={2}
                      placeholder="例如：1. 预习教材中关于二叉树的内容；2. 复习递归的基本概念"
                    />
                  </Form.Item>
                  
                  <Divider orientation="left">教学资源</Divider>
                  
                  <Form.Item label="上传教学资源">
                    <Dragger
                      name="teachingResources"
                      action="/api/upload"
                      fileList={uploadedFiles}
                      onChange={handleFileUpload}
                      beforeUpload={(file) => {
                        const isAllowedType = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'].includes(file.type);
                        const isLt100M = file.size / 1024 / 1024 < 100;
                        if (!isAllowedType) {
                          message.error('仅支持PDF、Word、PPT格式文件');
                        }
                        if (!isLt100M) {
                          message.error('文件大小不能超过100MB');
                        }
                        return isAllowedType && isLt100M;
                      }}
                      style={{ marginBottom: 16 }}
                    >
                      <p className="ant-upload-drag-icon">
                        <UploadOutlined style={{ fontSize: 24 }} />
                      </p>
                      <p className="ant-upload-text">点击或拖拽文件到此处上传（支持多文件）</p>
                      <p className="ant-upload-hint">
                        支持格式：PDF、Word、PPT | 单个文件≤100MB | 可上传课件、参考资料等
                      </p>
                    </Dragger>

                    {uploadedFiles.length > 0 && (
                      <div style={{ marginBottom: 20 }}>
                        <Text strong>已上传文件列表：</Text>
                        <Space wrap style={{ marginTop: 8, display: 'flex' }}>
                          {uploadedFiles.map((file, idx) => (
                            <Tag
                              key={idx}
                              color="blue"
                              closable
                              onClose={() => {
                                const newFiles = [...uploadedFiles];
                                newFiles.splice(idx, 1);
                                setUploadedFiles(newFiles);
                              }}
                              style={{ marginBottom: 8 }}
                            >
                              <FileTextOutlined style={{ marginRight: 4 }} />
                              {file.name}（{Math.round(file.size / 1024 / 1024 * 100) / 100}MB）
                            </Tag>
                          ))}
                        </Space>
                      </div>
                    )}
                  </Form.Item>

                  <Form.Item label="补充教学材料">
                    <Button
                      type="dashed"
                      icon={<PlusOutlined />}
                      onClick={handleAddMaterials}
                      style={{ width: '100%', marginBottom: 16 }}
                    >
                      点击添加补充教学材料
                    </Button>

                    <Modal
                      title="补充教学材料"
                      open={showMaterialsModal}
                      onCancel={() => setShowMaterialsModal(false)}
                      onOk={saveMaterials}
                      width={700}
                    >
                      <TextArea
                        rows={12}
                        value={teachingMaterials}
                        onChange={(e) => setTeachingMaterials(e.target.value)}
                        placeholder="请填写补充教学材料信息，如参考书籍、网站资源、视频资料等（示例）：
1. 参考书籍：
   - 《数据结构（C语言版）》- 严蔚敏，清华大学出版社，2020年，第6章
   - 《算法图解》- Aditya Bhargava，人民邮电出版社，2017年，第4章
2. 在线资源：
   - 二叉树遍历动画演示：https://visualgo.net/zh/bst
   - 递归算法讲解视频：B站UP主“黑马程序员”《数据结构与算法》第23讲
3. 教学工具：
   - 在线代码编辑器：https://repl.it
   - 思维导图工具：XMind 2023"
                      />
                      <Alert
                        message="填写提示"
                        description="建议按「参考书籍→在线资源→教学工具」分类填写，每个资源注明名称、作者/来源、版本/链接"
                        type="info"
                        size="small"
                        style={{ marginTop: 12 }}
                      />
                    </Modal>

                    {teachingMaterials && (
                      <div style={{ marginBottom: 12 }}>
                        <Text strong>已填写材料预览：</Text>
                        <div style={{
                          background: '#f5f5f5',
                          padding: 16,
                          borderRadius: 6,
                          marginTop: 8,
                          maxHeight: 200,
                          overflowY: 'auto',
                          whiteSpace: 'pre-wrap',
                          fontSize: 13,
                          lineHeight: 1.6
                        }}>
                          {teachingMaterials}
                        </div>
                      </div>
                    )}
                  </Form.Item>
                </Panel>

                <Panel header="8. 教学过程设计" key="teachingProcess">
                  <Form.Item
                    label="教学过程设计"
                    name="teachingProcess"
                  >
                    <TextArea
                      rows={10}
                      placeholder="请按时间顺序设计详细的教学步骤，包括教师活动、学生活动和设计意图（建议按时间分段）（示例）：
1. 导入（5分钟）
   - 教师活动：展示二叉树在搜索引擎中的应用案例，提出问题“如何高效遍历树结构？”
   - 学生活动：思考问题，回忆树的基本概念
   - 设计意图：激发学习兴趣，建立新旧知识联系

2. 知识点讲解（15分钟）
   - 教师活动：讲解前序、中序、后序遍历的概念和算法思想，结合动画演示
   - 学生活动：认真听讲，记录重点，提出疑问
   - 设计意图：系统掌握基本概念和原理

3. 实践练习（15分钟）
   - 教师活动：布置练习题，巡视指导，解答疑问
   - 学生活动：独立完成练习题，小组讨论遇到的问题
   - 设计意图：巩固知识点，培养应用能力

4. 总结与作业（10分钟）
   - 教师活动：总结本节课重点，布置课后作业
   - 学生活动：回顾本节课内容，记录作业要求
   - 设计意图：强化学习重点，延伸学习效果"
                    />
                  </Form.Item>
                </Panel>

                <Panel header="9. 评价与作业" key="evaluation">
                  <Form.Item
                    label="课堂评价"
                    name="classEvaluation"
                    rules={[{ required: true, message: '请设计课堂评价方式' }]}
                  >
                    <TextArea
                      rows={4}
                      placeholder="请设计课堂评价方式和标准，如提问、练习、小组表现等（示例）：
1. 课堂提问（20%）：根据学生回答问题的准确性和深度进行评价
2. 练习题完成情况（50%）：根据练习题的完成质量和效率进行评价
3. 小组讨论表现（30%）：根据参与度、贡献度和合作能力进行评价"
                    />
                  </Form.Item>
                  <Form.Item
                    label="作业布置"
                    name="homework"
                    rules={[{ required: true, message: '请设计课后作业' }]}
                  >
                    <TextArea
                      rows={4}
                      placeholder="请设计课后作业，包括基础题、提高题和拓展题（示例）：
1. 基础题：实现二叉树的三种遍历算法（必做）
2. 提高题：比较三种遍历算法的时间复杂度和空间复杂度（选做）
3. 拓展题：研究二叉树遍历在实际项目中的应用案例（选做）"
                    />
                  </Form.Item>
                  <Form.Item
                    label="教学反思与改进"
                    name="teachingReflection"
                  >
                    <TextArea
                      rows={3}
                      placeholder="请预设教学过程中可能出现的问题及应对措施（示例）：
1. 学生可能难以理解递归遍历过程，准备额外的分步演示视频
2. 练习题难度可能过高，准备不同难度的备选题目
3. 课堂时间可能不足，优先保证核心知识点的讲解和练习"
                    />
                  </Form.Item>
                </Panel>
              </Collapse>

              <div style={{ marginTop: 24, textAlign: 'center' }}>
                <Space size="middle">
                  <Button 
                    type="primary" 
                    icon={<RocketOutlined />} 
                    htmlType="submit" 
                    loading={loading}
                    size="large"
                  >
                    生成教学设计
                  </Button>
                  <Button 
                    icon={<HistoryOutlined />} 
                    onClick={() => setHistoryVisible(true)}
                    size="large"
                  >
                    历史记录
                  </Button>
                </Space>
              </div>
            </Form>
          </Card>
        </Col>

        <Col xs={24} lg={14}>
          <div style={{ position: 'relative', marginBottom: 24 }}>
            <div style={{ position: 'absolute', top: -60, right: 0, width: '100px', height: '100px', zIndex: 5 }}>
              <MascotCharacter 
                state="thinking" 
                position="center"
                size="small"
                interactive={true}
                removeBackground={true}
                showDialogue={false}
              />
            </div>
            <Card 
              title="🚀 生成的教学设计方案" 
              style={{ marginBottom: 24 }}
              extra={
                <Space size="small">
                  <Button 
                    icon={<CopyOutlined />} 
                    onClick={handleCopy}
                    disabled={!generatedLesson && !streamingContent}
                  >
                    复制
                  </Button>
                  <Button 
                    icon={<DownloadOutlined />} 
                    onClick={handleDownload}
                    disabled={!generatedLesson && !streamingContent}
                  >
                    下载
                  </Button>
                </Space>
              }
            >
            {loading ? (
              <div style={{ textAlign: 'center', padding: 40 }}>
                <Spin size="large" tip="正在生成教学设计方案..." />
              </div>
            ) : (
              <div 
                style={{ 
                  padding: 16, 
                  minHeight: 400,
                  border: '1px solid #f0f0f0',
                  borderRadius: 4,
                  whiteSpace: 'pre-wrap',
                  lineHeight: 1.8,
                  overflowX: 'auto'
                }}
              >
                {(!generatedLesson && !streamingContent) ? (
                  <div style={{ textAlign: 'center', color: '#999', padding: 60 }}>
                    <Paragraph>填写左侧表单信息，点击"生成教学设计"按钮</Paragraph>
                    <Paragraph>系统将基于您的输入和选择的教学设计模型</Paragraph>
                    <Paragraph>生成专业的单次课教学设计方案</Paragraph>
                  </div>
                ) : (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {streamingContent || generatedLesson}
                  </ReactMarkdown>
                )}
              </div>
            )}
            </Card>
          </div>

          {knowledgeSources.length > 0 && (
            <Card title="📚 参考资料" style={{ marginBottom: 24 }}>
              {knowledgeSources.map((source, index) => (
                <div key={index} style={{ marginBottom: 16, paddingBottom: 16, borderBottom: index < knowledgeSources.length - 1 ? '1px dashed #e8e8e8' : 'none' }}>
                  <Title level={5}>参考资料 {index + 1}：{source.source}</Title>
                  <Paragraph ellipsis={{ rows: 4 }}>
                    {source.content}
                  </Paragraph>
                </div>
              ))}
            </Card>
          )}
        </Col>
      </Row>

      <HistoryDrawer
        visible={historyVisible}
        onClose={() => setHistoryVisible(false)}
        type="lesson"
        onLoad={handleLoadHistory}
      />
    </div>
  );
};

export default GenerateLessonPage;