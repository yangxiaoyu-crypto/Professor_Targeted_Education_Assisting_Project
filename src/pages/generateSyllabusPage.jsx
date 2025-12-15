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
const { Option, OptGroup } = Select;
const { Panel } = Collapse;
const { Dragger } = Upload;

const GenerateSyllabusPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [generatedSyllabus, setGeneratedSyllabus] = useState('');
  const [streamingContent, setStreamingContent] = useState('');
  const [historyVisible, setHistoryVisible] = useState(false);
  const [knowledgeSources, setKnowledgeSources] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [resourceText, setResourceText] = useState('');
  const [showResourceModal, setShowResourceModal] = useState(false);

  const teachingStrategies = [
    { value: 'PBL教学法', label: 'PBL教学法' },
    { value: '案例教学法', label: '案例教学法' },
    { value: '同伴教学法', label: '同伴教学法' },
    { value: '教学工作坊', label: '教学工作坊' },
    { value: '翻转课堂', label: '翻转课堂' },
  ];

  const courseTypes = [
    '理工类课程',
    '人文社科类课程',
    '艺术类课程',
    '医学类课程',
    '经济管理类课程',
    '其他',
  ];

  const assessmentMethods = [
    { label: '形成性评价+总结性评价', value: 'combination' },
    { label: '仅形成性评价', value: 'formative' },
    { label: '仅总结性评价', value: 'summative' },
    { label: 'AI智能推荐方案', value: 'ai_recommend' }
  ];

  // 上传文件的处理逻辑
  const handleFileUpload = ({ file, fileList }) => {
    // 模拟上传成功（实际项目中替换为真实接口上传）
    if (file.status === 'done') {
      message.success(`${file.name} 上传成功`);
      setUploadedFiles([...fileList]);
    } else if (file.status === 'error') {
      message.error(`${file.name} 上传失败`);
    }
    return false;
  };

  const handleAddResourceText = () => {
    setShowResourceModal(true);
  };

  const saveResourceText = () => {
    setShowResourceModal(false);
    message.success('资源内容保存成功');
  };

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

    prompt += `你是一位资深教学设计专家。请基于以下填写的信息，按照指定结构生成一份完整、专业的课程大纲。

# 课程大纲核心结构（必须严格遵循）
## 2.1 教学大纲设计
### 2.1.1 课程基本信息
- 课程名称：${values.courseName}
- 课程类型：${values.courseType}
- 学分：${values.credits}学分
- 学时：${values.hours}学时
- 授课对象：${values.targetStudents}
- 先修课程：${values.prerequisites || '无'}

### 2.1.2 教学目标
${values.teachingObjectives || '请基于课程特点和学生水平，从知识、能力、素质三个维度设计教学目标'}

### 2.1.3 课程思政策略
${values.ideologicalStrategy || '请说明如何将思政元素自然融入教学过程，体现价值引领'}

### 2.1.4 教学策略与方法
- 选中的策略：${values.teachingStrategies?.join('、') || '无'}
- 补充说明：${values.teachingStrategyDesc || '无'}

### 2.1.5 课程教学资源
- 上传的资源文件：${uploadedFiles.length > 0 ? uploadedFiles.map(file => file.name).join('、') : '无'}
- 手动填写的资源内容：${resourceText || '无'}
- 其他资源建议：请基于课程类型和教学目标，补充推荐相关教材、在线资源、实验环境等

### 2.1.6 课程考核与评价
${values.assessmentMethod === 'ai_recommend'
        ? '请基于本课程的教学目标、教学内容和教学模式，智能推荐最适合的考核方案（包括评价类型、权重分配、考核形式、评价标准等）'
        : `
- 考核类型：${values.assessmentMethod === 'combination' ? '形成性评价+总结性评价' :
          values.assessmentMethod === 'formative' ? '仅形成性评价' : '仅总结性评价'}
- 填写的考核方案：${values.assessmentContent || '无'}
- 优化建议：请基于教学设计理论，对填写的考核方案进行优化，确保评价与目标、内容的一致性
`}

# 生成要求
1. 严格按照上述2.1结构组织内容，不得遗漏任何小节
2. 内容要专业、具体、可操作，符合现代教学设计理念
3. 教学目标需基于布卢姆分类学，分层次设计
4. 课程思政策略要具体，避免空洞，体现润物细无声的融入方式
5. 教学策略要与教学目标、内容相匹配，说明具体实施方法
6. 教学资源要全面，包括教材、在线资源、实验环境等
7. 考核评价体系要科学合理，具有可操作性和公平性
8. 输出格式为Markdown，支持表格、列表等GFM语法
9. 禁止输出任何HTML标签，换行用回车符表示

请基于泰勒原理、逆向设计（UbD）和加涅教学事件理论，生成一份可直接使用的专业课程大纲。`;

    return prompt;
  };

  const handleGenerate = async (values) => {
    setLoading(true);
    setGeneratedSyllabus('');
    setStreamingContent('');
    setKnowledgeSources([]);

    try {
      let knowledgeResults = [];
      try {
        const searchQuery = `${values.courseName} ${values.teachingStrategies?.join(' ')} 课程设计 教学大纲 思政融入`;
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
            '你是一位拥有20年教学设计经验的专家，精通泰勒原理、逆向设计（UbD）、布卢姆分类学等教学理论。擅长将思政元素自然融入教学，设计科学合理的考核评价体系。输出必须严格遵循指定结构，内容专业、具体、可操作。',
          temperature: 0.65,
          maxTokens: 8000,
        },
        (chunk) => {
          fullContent += chunk;
          setStreamingContent(fullContent);
        }
      );

      setGeneratedSyllabus(fullContent);
      message.success('课程大纲生成成功！');

      storage.saveHistory('syllabus', {
        title: values.courseName,
        content: fullContent,
        formData: {
          ...values,
          uploadedFiles: uploadedFiles.map(file => file.name),
          resourceText: resourceText
        },
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

  const handleLoadHistory = (item) => {
    try {
      if (!item.formData) {
        message.error('历史数据格式错误，缺少表单数据');
        return;
      }

      const teachingStrategies = Array.isArray(item.formData.teachingStrategies)
        ? item.formData.teachingStrategies
        : item.formData.teachingStrategies
          ? item.formData.teachingStrategies.split('、')
          : [];

      form.setFieldsValue({
        ...item.formData,
        teachingStrategies,
        assessmentMethod: item.formData.assessmentMethod || 'ai_recommend'
      });

      setResourceText(item.formData.resourceText || '');

      const files = item.formData.uploadedFiles
        ? item.formData.uploadedFiles.map(name => ({
          name,
          status: 'done',
          size: 0
        }))
        : [];
      setUploadedFiles(files);

      setGeneratedSyllabus(item.content || '');
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
          <FileTextOutlined /> 快速生成教学大纲
        </Title>
        <Paragraph>
          严格按照教学大纲结构设计，生成专业、规范的课程大纲。
          填写关键信息后，AI将自动补全细节，支持自定义调整。
        </Paragraph>
      </div>

      <Row gutter={24}>
        <Col xs={24} lg={10}>
          <Card title="📝 教学大纲设计" style={{ marginBottom: 24 }}>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleGenerate}
              initialValues={{
                courseType: '理工类课程',
                teachingStrategies: [],
                assessmentMethod: 'ai_recommend',
              }}
            >
              {/* 2.1.1 课程基本信息 */}
              <Collapse defaultActiveKey={['basicInfo', 'teachingObjectives', 'ideologicalStrategy', 'teachingStrategies', 'teachingResources', 'assessment']}>
                <Panel header="1. 课程基本信息" key="basicInfo">
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
                    <Col span={12}>
                      <Form.Item
                        label="授课对象"
                        name="targetStudents"
                        rules={[{ required: true, message: '请输入授课对象' }]}
                      >
                        <Input placeholder="例如：计算机专业本科二年级学生" />
                      </Form.Item>
                    </Col>
                    <Col span={24}>
                      <Form.Item label="先修课程" name="prerequisites">
                        <Input placeholder="例如：程序设计基础、离散数学（多个课程用顿号「、」分隔）" />
                      </Form.Item>
                    </Col>
                  </Row>
                </Panel>

                {/* 2.1.2 教学目标 */}
                <Panel header="2. 教学目标" key="teachingObjectives">
                  <Form.Item
                    label="教学目标详情"
                    name="teachingObjectives"
                    rules={[{ required: true, message: '请填写教学目标' }]}
                  >
                    <TextArea
                      rows={6}
                      placeholder="请从知识、能力、素质三个维度设计教学目标（例如：1. 知识维度：掌握数据结构的基本概念和算法原理；2. 能力维度：具备复杂问题的算法设计能力；3. 素质维度：培养严谨的逻辑思维和创新意识）"
                    />
                  </Form.Item>
                  <Alert
                    message="填写提示"
                    description="建议基于布卢姆分类学，分层次设计教学目标，确保目标可衡量、可达成"
                    type="info"
                    size="small"
                  />
                </Panel>

                {/* 2.1.3 课程思政策略 */}
                <Panel header="3. 课程思政策略" key="ideologicalStrategy">
                  <Form.Item
                    label="思政融入策略"
                    name="ideologicalStrategy"
                    rules={[{ required: true, message: '请填写课程思政策略' }]}
                  >
                    <TextArea
                      rows={6}
                      placeholder="请说明如何将思政元素融入教学（例如：1. 通过介绍我国科学家在相关领域的贡献，增强民族自豪感；2. 在算法设计案例中融入诚信、协作等职业素养；3. 引导学生树立正确的技术伦理观）"
                    />
                  </Form.Item>
                  <Alert
                    message="填写提示"
                    description="思政元素要与课程内容自然融合，避免牵强附会，体现润物细无声的价值引领"
                    type="info"
                    size="small"
                  />
                </Panel>

                {/* 2.1.4 教学策略与方法（可多选） */}
                <Panel header="4. 教学策略与方法（可多选）" key="teachingStrategies">
                  <Form.Item
                    label="参与式学习策略（4.1）"
                    name="teachingStrategies"
                    rules={[{ required: true, message: '请至少选择一种教学策略' }]}
                  >
                    <Select
                      mode="multiple"
                      placeholder="请选择教学策略（可多选，建议2-3种）"
                      style={{ width: '100%' }}
                    >
                      <OptGroup label="参与式学习策略（4.1）">
                        <Option key="PBL教学法" value="PBL教学法">PBL教学法</Option>
                        <Option key="案例教学法" value="案例教学法">案例教学法</Option>
                        <Option key="同伴教学法" value="同伴教学法">同伴教学法</Option>
                        <Option key="教学工作坊" value="教学工作坊">教学工作坊</Option>
                        <Option key="翻转课堂" value="翻转课堂">翻转课堂</Option>
                      </OptGroup>
                    </Select>
                  </Form.Item>

                  <Form.Item
                    label="策略实施说明（4.2）"
                    name="teachingStrategyDesc"
                  >
                    <TextArea
                      rows={4}
                      placeholder="请详细说明所选策略的实施方式（例如：1. PBL教学法：在「算法设计」模块设置3个真实项目问题，每组5人协作完成，周期4周；2. 案例教学法：每章节配套2-3个行业真实案例，课堂分组讨论分析；3. 翻转课堂：课前通过慕课视频预习理论，课堂时间用于实践操作和答疑）"
                    />
                  </Form.Item>

                  {/* 各策略详细说明（折叠面板） */}
                  <Collapse defaultActiveKey={[]} style={{ marginTop: 12 }}>
                    <Panel header="各策略定义与适用场景（点击展开）" key="strategyDetail">
                      <div style={{ padding: 12, background: '#f9f9f9', borderRadius: 6 }}>
                        <div style={{ marginBottom: 16 }}>
                          <Text strong>PBL教学法</Text>
                          <Paragraph size="small" style={{ margin: '4px 0 8px 0' }}>
                            定义：以问题为导向的学习（Problem-Based Learning），通过真实、复杂的问题驱动学生自主探究、协作学习，最终解决问题并掌握知识。
                          </Paragraph>
                          <Text type="secondary" size="small">
                            适用场景：核心知识点、综合应用模块、创新能力培养（如课程设计、项目开发类内容）
                          </Text>
                        </div>
                        <div style={{ marginBottom: 16 }}>
                          <Text strong>案例教学法</Text>
                          <Paragraph size="small" style={{ margin: '4px 0 8px 0' }}>
                            定义：以真实案例为载体，引导学生分析问题、讨论解决方案，将理论知识与实际应用结合。
                          </Paragraph>
                          <Text type="secondary" size="small">
                            适用场景：知识点应用、行业实践对接、决策能力培养（如管理类、工程类课程）
                          </Text>
                        </div>
                        <div style={{ marginBottom: 16 }}>
                          <Text strong>同伴教学法</Text>
                          <Paragraph size="small" style={{ margin: '4px 0 8px 0' }}>
                            定义：学生之间相互讲解、讨论、评价，通过“教”与“学”的角色转换深化知识理解。
                          </Paragraph>
                          <Text type="secondary" size="small">
                            适用场景：基础知识点巩固、概念辨析、小组协作能力培养
                          </Text>
                        </div>
                        <div style={{ marginBottom: 16 }}>
                          <Text strong>教学工作坊</Text>
                          <Paragraph size="small" style={{ margin: '4px 0 8px 0' }}>
                            定义：以实践操作为核心，通过动手实践、导师指导、小组协作完成特定任务，强调“做中学”。
                          </Paragraph>
                          <Text type="secondary" size="small">
                            适用场景：技能训练、工具使用、实践操作类内容（如编程、设计、实验课程）
                          </Text>
                        </div>
                        <div>
                          <Text strong>翻转课堂</Text>
                          <Paragraph size="small" style={{ margin: '4px 0 8px 0' }}>
                            定义：重构教学流程，课前学生通过视频、阅读材料自主学习理论知识，课堂时间用于互动讨论、实践演练、答疑解惑。
                          </Paragraph>
                          <Text type="secondary" size="small">
                            适用场景：理论性较强、知识点清晰、需要大量实践巩固的内容
                          </Text>
                        </div>
                      </div>
                    </Panel>
                  </Collapse>
                </Panel>

                {/* 2.1.5 课程教学资源（上传+填写） */}
                <Panel header="5. 课程教学资源" key="teachingResources">
                  <Paragraph>
                    支持上传资源文件（如教材扫描件、课件）和手动填写资源信息（如教材、在线资源），两者可同时使用
                  </Paragraph>

                  {/* 2.1.5.1 资源文件上传 */}
                  <Form.Item label="5.1 上传资源文件">
                    <Dragger
                      name="resourceFiles"
                      action="/api/upload" // 实际项目替换为真实上传接口
                      fileList={uploadedFiles}
                      onChange={handleFileUpload}
                      beforeUpload={(file) => {
                        // 限制文件类型和大小
                        const isAllowedType = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'].includes(file.type);
                        const isLt100M = file.size / 1024 / 1024 < 100;
                        if (!isAllowedType) {
                          message.error('仅支持PDF、Word、PPT、Excel格式文件');
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
                        支持格式：PDF、Word、PPT、Excel | 单个文件≤100MB | 可上传教材、课件、参考资料等
                      </p>
                    </Dragger>

                    {/* 已上传文件列表（带删除功能） */}
                    {uploadedFiles.length > 0 && (
                      <div style={{ marginBottom: 20 }}>
                        <Text strong>5.1.1 已上传文件列表：</Text>
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

                  {/* 2.1.5.2 手动填写资源内容 */}
                  <Form.Item label="5.2 手动填写资源信息">
                    <Button
                      type="dashed"
                      icon={<PlusOutlined />}
                      onClick={handleAddResourceText}
                      style={{ width: '100%', marginBottom: 16 }}
                    >
                      点击添加资源详情
                    </Button>

                    {/* 资源填写弹窗（支持多类型资源） */}
                    <Modal
                      title="5.2 手动填写教学资源"
                      open={showResourceModal}
                      onCancel={() => setShowResourceModal(false)}
                      onOk={saveResourceText}
                      width={700}
                      destroyOnClose={false}
                    >
                      <TextArea
                        rows={12}
                        value={resourceText}
                        onChange={(e) => setResourceText(e.target.value)}
                        placeholder="请按以下分类填写资源信息（示例）：
1. 教材（5.2.1）：
   - 主教材：《数据结构（C语言版）》- 严蔚敏，清华大学出版社，2020年
   - 参考教材：《算法导论》- Thomas H. Cormen，机械工业出版社，2019年
2. 在线资源（5.2.2）：
   - 慕课：《数据结构与算法》- 北京大学，中国大学MOOC
   - 文档：《Python数据结构官方文档》- https://docs.python.org/3/tutorial/datastructures.html
   - 视频：《算法可视化教程》- B站UP主“正月点灯笼”
3. 实验/实践环境（5.2.3）：
   - 软件工具：VS Code + GCC编译器、Postman、MySQL 8.0
   - 硬件环境：Intel i5以上CPU、8GB以上内存
   - 在线平台：LeetCode、GitHub Classroom
4. 参考资料（5.2.4）：
   - 论文：《基于PBL的数据结构教学改革研究》- 教育学报，2023年
   - 行业标准：《计算机类专业教学质量国家标准》- 教育部，2021年
   - 案例库：《数据结构课程教学案例集》- 高等教育出版社，2022年"
                      />
                      <Alert
                        message="填写提示"
                        description="建议按「教材→在线资源→实验环境→参考资料」分类填写，每个资源注明名称、作者/来源、版本/链接，方便AI生成规范的资源列表"
                        type="info"
                        size="small"
                        style={{ marginTop: 12 }}
                      />
                    </Modal>

                    {/* 已填写资源预览（带格式化显示） */}
                    {resourceText && (
                      <div style={{ marginBottom: 12 }}>
                        <Text strong>5.2.5 已填写资源预览：</Text>
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
                          {resourceText}
                        </div>
                      </div>
                    )}
                  </Form.Item>

                  {/* 2.1.5.3 资源使用说明 */}
                  <Form.Item
                    label="5.3 资源使用说明"
                    name="resourceUsage"
                  >
                    <TextArea
                      rows={3}
                      placeholder="请说明资源在教学中的使用方式（例如：1. 主教材用于课前预习和课后复习，每章节配套慕课视频辅助理解；2. 实验环境用于课堂实践和课后作业，学生需在GitHub提交代码；3. 参考论文用于课程设计的文献调研环节）"
                    />
                  </Form.Item>
                </Panel>

                {/* 2.1.6 课程考核与评价（优化方案：支持手动填写+AI推荐）- 修复显示问题 */}
                <Panel header="6. 课程考核与评价" key="assessment">
                  <Form.Item
                    label="6.1 考核模式选择"
                    name="assessmentMethod"
                    rules={[{ required: true, message: '请选择考核模式' }]}
                  >
                    <Select placeholder="请选择考核模式（推荐AI智能推荐）">
                      <Option key="manual" value="manual">手动填写考核方案</Option>
                      <Option key="ai_recommend" value="ai_recommend">AI智能推荐考核方案</Option>
                    </Select>
                  </Form.Item>

                  {/* 动态显示考核内容填写区（手动填写模式）- 核心修复：添加 dependencies 监听 */}
                  <Form.Item
                    noStyle
                    dependencies={['assessmentMethod']} // 监听考核模式变化，触发重新渲染
                  >
                    {({ getFieldValue }) => {
                      const assessmentMethod = getFieldValue('assessmentMethod');
                      if (assessmentMethod === 'manual') {
                        return (
                          <>
                            <Divider orientation="left" plain>6.2 考核方案详情</Divider>

                            <Form.Item
                              label="6.2.1 考核类型与权重"
                              name="assessmentTypeWeight"
                              rules={[{ required: true, message: '请填写考核类型与权重' }]}
                            >
                              <TextArea
                                rows={4}
                                placeholder="示例：
1. 形成性评价（50%）：
   - 课堂参与（10%）：考勤（5%）+ 互动讨论（5%）
   - 阶段性作业（20%）：4次作业，每次5%
   - 小组项目（20%）：1个课程设计项目，分阶段提交
2. 总结性评价（50%）：
   - 期末考试（闭卷）：50%（覆盖全部知识点，重点考察应用能力）"
                              />
                            </Form.Item>

                            <Form.Item
                              label="6.2.2 考核标准（Rubric）"
                              name="assessmentRubric"
                              rules={[{ required: true, message: '请填写考核标准' }]}
                            >
                              <TextArea
                                rows={5}
                                placeholder="示例：
1. 课堂参与评分标准：
   - 优秀（9-10分）：全勤，积极参与讨论，提出有深度的问题
   - 良好（7-8分）：无缺勤，主动参与讨论，能回应问题
   - 合格（5-6分）：缺勤≤1次，参与讨论较少
   - 不合格（0-4分）：缺勤≥2次，不参与讨论
2. 小组项目评分标准：
   - 需求达成度（40%）：是否完成全部功能需求
   - 创新性（20%）：是否有独特的设计思路或优化方案
   - 代码质量（20%）：规范度、可读性、效率
   - 团队协作（20%）：分工合理性、沟通效率"
                              />
                            </Form.Item>

                            <Form.Item
                              label="6.2.3 反馈与改进机制"
                              name="assessmentFeedback"
                            >
                              <TextArea
                                rows={3}
                                placeholder="示例：
1. 作业反馈：提交后3个工作日内返回批改结果，标注错误点和改进建议
2. 项目反馈：分阶段提交后，组织小组答辩，导师现场点评
3. 考试反馈：期末考试后1周内公布成绩，提供试卷分析和答疑"
                              />
                            </Form.Item>

                            <Form.Item
                              label="6.2.4 特殊情况处理"
                              name="assessmentSpecialCase"
                            >
                              <TextArea
                                rows={2}
                                placeholder="示例：
1. 缺考处理：无正当理由缺考，期末考试成绩按0分计；有正当理由需提前申请缓考
2. 补交政策：作业逾期1-3天提交，扣该作业分数的30%；逾期超过3天，该作业按0分计
3. 作弊处理：任何形式作弊，本次考核成绩按0分计，并按学校规定处理"
                              />
                            </Form.Item>
                          </>
                        );
                      }
                      return null;
                    }}
                  </Form.Item>

                  {/* AI推荐模式说明 + 补充配置项 - 同样添加 dependencies 监听 */}
                  <Form.Item
                    noStyle
                    dependencies={['assessmentMethod']}
                  >
                    {({ getFieldValue }) => {
                      const assessmentMethod = getFieldValue('assessmentMethod');
                      if (assessmentMethod === 'ai_recommend') {
                        return (
                          <>
                            <Alert
                              message="AI智能推荐说明"
                              description="
                                选择该模式后，AI将基于以下信息生成最优考核方案：
                                1. 课程类型（如理工类、人文社科类）
                                2. 教学目标（知识/能力/素质维度）
                                3. 教学策略（如PBL、翻转课堂）
                                4. 学时/学分配置
                                生成的方案将包含：考核类型权重、评分标准（Rubric）、反馈机制、特殊情况处理，确保与教学目标高度对齐。
                              "
                              type="info"
                              style={{ marginBottom: 16 }}
                            />

                            <Form.Item
                              label="6.3 AI推荐配置（可选）"
                              name="aiAssessmentConfig"
                            >
                              <TextArea
                                rows={3}
                                placeholder="可补充考核相关要求（示例）：
1. 希望形成性评价权重不低于40%，注重过程性考核
2. 需包含小组协作能力的考核指标
3. 避免单一笔试形式，建议增加实践操作考核
4. 思政元素的考核需融入评价体系（如职业素养、伦理规范）"
                              />
                            </Form.Item>
                          </>
                        );
                      }
                      return null;
                    }}
                  </Form.Item>
                </Panel>
              </Collapse>

              {/* 提交按钮区域 */}
              <Form.Item style={{ marginTop: 24 }}>
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
                  <Button
                    type="text"
                    onClick={() => {
                      form.resetFields();
                      setUploadedFiles([]);
                      setResourceText('');
                      setGeneratedSyllabus('');
                      setStreamingContent('');
                    }}
                  >
                    重置表单
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>

          <Alert
            message="💡 使用提示"
            description={
              <ul style={{ paddingLeft: 20, margin: '8px 0' }}>
                <li>所有带「*」的字段为必填项，填写越详细，生成的大纲越精准</li>
                <li>教学策略可多选（建议2-3种），需在「策略实施说明」中明确各策略的应用场景</li>
                <li>教学资源支持「文件上传」+「手动填写」，推荐按分类填写，方便AI识别</li>
                <li>考核方案推荐选择「AI智能推荐」，AI将基于课程特点生成科学的评价体系</li>
                <li>生成的大纲可复制、下载，支持历史记录回溯和二次编辑</li>
              </ul>
            }
            type="info"
            showIcon
          />
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
              title="📄 生成的课程大纲（教学大纲结构）"
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
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {streamingContent || generatedSyllabus}
                    </ReactMarkdown>
                  </div>

                  <div style={{ marginTop: 16 }}>
                    {knowledgeSources.length > 0 && (
                      <Card
                        title="📚 知识库参考来源"
                        size="small"
                        style={{ marginBottom: 12 }}
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

                    {uploadedFiles.length > 0 && (
                      <Card
                        title="📎 关联上传资源"
                        size="small"
                      >
                        <Paragraph type="secondary" style={{ marginBottom: 12 }}>
                          您上传的资源已关联至本大纲：
                        </Paragraph>
                        <Space wrap>
                          {uploadedFiles.map((file, idx) => (
                            <Tag
                              key={idx}
                              icon={<FileTextOutlined />}
                              color="green"
                            >
                              {file.name}
                            </Tag>
                          ))}
                        </Space>
                      </Card>
                    )}
                  </div>
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
                  <div>请填写左侧教学大纲设计表单并点击生成按钮</div>
                  <div style={{ marginTop: 8 }}>生成后将按「教学大纲」标准结构展示</div>
                </div>
              )}
            </Card>
          </div>
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

export default GenerateSyllabusPage;