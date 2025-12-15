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
import { BulbOutlined, RocketOutlined, CheckCircleOutlined, HistoryOutlined, FileTextOutlined } from '@ant-design/icons';
import ReactMarkdown from 'react-markdown';
import { llmService } from '../services/api';
import { knowledgeService } from '../services/knowledgeApi';
import HistoryDrawer from '../components/HistoryDrawer';
import { storage } from '../utils/storage';

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { Panel } = Collapse;

const LearningObjectives = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [generatedObjectives, setGeneratedObjectives] = useState('');
  const [historyVisible, setHistoryVisible] = useState(false);
  const [knowledgeSources, setKnowledgeSources] = useState([]);

  // 布卢姆分类学 - 认知领域
  const bloomCognitive = [
    { level: '记忆', verbs: '列举、识别、描述、命名、标记、复述', color: '#f0f0f0' },
    { level: '理解', verbs: '解释、总结、推断、分类、比较、例证', color: '#e6f7ff' },
    { level: '应用', verbs: '执行、实施、使用、解决、演示、操作', color: '#d9f7be' },
    { level: '分析', verbs: '区分、组织、归因、比较、解构、检查', color: '#fff1b8' },
    { level: '评价', verbs: '检查、评判、批判、论证、辩护、支持', color: '#ffd8bf' },
    { level: '创造', verbs: '设计、构建、规划、制作、发明、产生', color: '#ffd6e7' },
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
    
    prompt += `你是一位学习目标设计专家。请为以下课程撰写清晰、可测量的学习目标。

# 课程信息
- **课程名称**：${values.courseName}
- **主题/章节**：${values.topic}
- **授课对象**：${values.students}
- **目标认知层次**：${values.cognitiveLevel}

${values.teacherIdeas ? `# 教师期望
${values.teacherIdeas}
` : ''}
---

# 任务说明

请基于布卢姆修订版分类学和加涅学习结果理论，设计符合SMART原则的学习目标。

## 输出结构

### 1. 总体学习目标
用1-2句话概括本次学习的核心成果，确保：
- **S**pecific：具体明确
- **M**easurable：可观察、可测量
- **A**chievable：符合学生水平
- **R**elevant：与课程内容相关
- **T**ime-bound：有明确时间范围

### 2. 分类学习目标

#### 2.1 认知目标（基于布卢姆分类）
针对${values.cognitiveLevel}层次，设计3-5个目标，每个目标必须：
- 以“学生能够...”开头
- 使用可观察的行为动词（如：列举、解释、应用、分析、评价、创建）
- 避免模糊动词（如：了解、知道、熟悉）

#### 2.2 技能目标（基于加涅理论）
设计2-3个智慧技能或认知策略目标，强调：
- 实际操作能力
- 问题解决能力
- 可迁移技能

#### 2.3 情感态度目标
设计1-2个目标，关注：
- 学习兴趣与动机
- 职业态度与价值观
- 协作精神与责任感

### 3. 学习成果表述
用“完成本次学习后，学生将能够：”开头，列出3-5个具体成果。

### 4. 目标达成的证据
为每类目标设计合适的评价方式：
- 认知目标：测验、问答、作业等
- 技能目标：项目、实验、案例分析等
- 情感目标：观察、反思日志、同伴评价等

### 5. 教学活动建议
推荐3-4种有助于达成目标的教学活动。

---

# 质量标准
1. 每个目标都必须包含：行为主体 + 行为动词 + 学习内容 + 表现条件/水平
2. 目标应覆盖不同认知层次，但以${values.cognitiveLevel}为主
3. 目标之间应有递进关系，从基础到高阶
4. 所有目标必须可评价、可测量

请生成专业、精准、可直接应用的学习目标。`;
    return prompt;
  };

  const handleGenerate = async (values) => {
    setLoading(true);
    setGeneratedObjectives('');
    setKnowledgeSources([]);

    try {
      // 1. 先检索知识库
      let knowledgeResults = [];
      try {
        const searchQuery = `${values.courseName} ${values.topic} 学习目标 布卢姆分类`;
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

      // 2. 生成增强的prompt
      const prompt = generatePrompt(values, knowledgeResults);
      let content = '';

      await llmService.streamGenerate(
        prompt,
        {
          systemPrompt:
            '你是一位学习目标设计专家，精通布卢姆修订版分类学（Anderson & Krathwohl, 2001）和加涅学习结果理论。你擅长将模糊的教学期望转化为精确、可测量的学习目标。你坚持使用可观察的行为动词，确保每个目标都符合SMART原则。你的目标设计既严谨科学又实用易懂。',
          temperature: 0.55,
          maxTokens: 4000,
        },
        (chunk) => {
          content += chunk;
          setGeneratedObjectives(content);
        }
      );

      message.success('学习目标生成成功！');
      
      // 保存到历史记录
      storage.saveHistory('objectives', {
        title: `${values.courseName} - ${values.topic}`,
        content: content,
        formData: values,
      });
    } catch (error) {
      message.error('生成失败，请稍后重试');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // 加载历史记录到表单
  const handleLoadHistory = (item) => {
    form.setFieldsValue(item.formData);
    setGeneratedObjectives(item.content);
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
                <Space style={{ width: '100%' }} direction="vertical">
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
              <>
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

      {/* 历史记录抽屉 */}
      <HistoryDrawer
        visible={historyVisible}
        onClose={() => setHistoryVisible(false)}
        type="objectives"
        onLoad={handleLoadHistory}
      />
    </div>
  );
};

export default LearningObjectives;

