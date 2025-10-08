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
  Tag,
  Collapse,
} from 'antd';
import { HeartOutlined, RocketOutlined } from '@ant-design/icons';
import ReactMarkdown from 'react-markdown';
import { llmService } from '../services/api';

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { Panel } = Collapse;

const IdeologicalEducation = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');

  const ideologicalElements = [
    { label: '社会主义核心价值观', value: '社会主义核心价值观', color: 'red' },
    { label: '爱国主义教育', value: '爱国主义教育', color: 'volcano' },
    { label: '职业道德与工匠精神', value: '职业道德与工匠精神', color: 'orange' },
    { label: '科学精神与创新意识', value: '科学精神与创新意识', color: 'gold' },
    { label: '社会责任与担当', value: '社会责任与担当', color: 'cyan' },
    { label: '文化自信', value: '文化自信', color: 'blue' },
    { label: '生态文明', value: '生态文明', color: 'green' },
    { label: '法治意识', value: '法治意识', color: 'purple' },
    { label: '团队协作精神', value: '团队协作精神', color: 'magenta' },
    { label: '批判性思维', value: '批判性思维', color: 'geekblue' },
  ];

  const integrationMethods = [
    '知识传授中的价值引领',
    '案例教学中的思政融入',
    '实践活动中的价值塑造',
    '课堂讨论中的引导',
    '作业设计中的思政元素',
  ];

  const generatePrompt = (values) => {
    return `请作为课程思政专家，为以下课程设计自然、有效的思政融入方案：

【课程信息】
课程名称：${values.courseName}
课程性质：${values.courseNature}
专业背景：${values.major}
授课对象：${values.students}

【思政目标】
选择的思政元素：${values.ideologicalElements?.join('、')}
融入方式：${values.integrationMethod}

【课程特点】
${values.courseFeatures || ''}

请基于以下原则设计课程思政方案：

## 课程思政的核心原则

1. **自然融入，不生硬**
   - 思政元素要与专业知识有机结合
   - 避免"贴标签"式的简单添加
   - 润物细无声地进行价值引领

2. **专业特色，有深度**
   - 挖掘专业知识中的思政元素
   - 结合专业发展史、科学家故事
   - 体现专业的社会价值和责任

3. **学生中心，有共鸣**
   - 贴近学生生活和关注点
   - 用学生感兴趣的方式呈现
   - 引导而非说教

## 请设计包含以下内容的思政方案：

### 一、思政目标与专业目标的融合
- 课程的专业培养目标
- 课程的思政教育目标
- 二者的有机统一

### 二、思政元素的挖掘与设计
为每个主要的思政元素设计融入点：

**${values.ideologicalElements?.[0] || '思政元素'}**
- 与课程内容的结合点（具体到章节/知识点）
- 融入方式和教学活动设计
- 预期达到的效果

（为其他选中的思政元素重复以上设计）

### 三、教学实施策略

#### 1. 知识传授中的价值引领
- 如何在讲解专业知识时自然引出价值观
- 具体的教学设计示例

#### 2. 案例选择与使用
- 推荐的思政案例（中国案例、时事案例等）
- 如何通过案例讨论引导学生思考

#### 3. 实践活动设计
- 如何在实验、项目、作业中融入思政
- 具体的活动设计

#### 4. 课堂讨论引导
- 如何设置有思政价值的讨论话题
- 教师如何进行价值引导

### 四、思政元素融入的课程内容分布表
（建议以表格形式呈现）

| 章节/内容 | 专业知识点 | 思政元素 | 融入方式 | 教学活动 |
|----------|-----------|---------|---------|---------|
| ...      | ...       | ...     | ...     | ...     |

### 五、评价与反思
- 如何评价思政教育的效果
- 学生反馈收集方式
- 持续改进策略

### 六、注意事项
- 避免"两张皮"现象（专业课和思政分离）
- 避免说教和灌输
- 注重启发和引导
- 尊重学生的思考和选择

请确保设计方案：
1. 思政元素与专业内容深度融合
2. 具有可操作性和示范性
3. 符合学生认知规律和接受特点
4. 体现专业特色和时代特征`;
  };

  const handleGenerate = async (values) => {
    setLoading(true);
    setGeneratedContent('');

    try {
      const prompt = generatePrompt(values);
      let content = '';

      await llmService.streamGenerate(
        prompt,
        {
          systemPrompt:
            '你是一位课程思政专家，深刻理解如何将思想政治教育与专业教育有机融合。你的任务是帮助教师设计自然、有效、有深度的课程思政方案，避免生硬和说教，注重价值引领的润物细无声。',
          temperature: 0.7,
          maxTokens: 3500,
        },
        (chunk) => {
          content += chunk;
          setGeneratedContent(content);
        }
      );

      message.success('课程思政方案生成成功！');
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
          <HeartOutlined /> 课程思政设计
        </Title>
        <Paragraph>
          帮助您将思政元素自然融入专业课程，实现知识传授、能力培养与价值引领的有机统一。
          避免"两张皮"现象，做到润物细无声。
        </Paragraph>
      </div>

      <Alert
        message="💡 课程思政的关键：自然融入，不生硬"
        description={
          <div>
            <p><strong>好的课程思政应该：</strong></p>
            <ul style={{ paddingLeft: 20, marginBottom: 0 }}>
              <li>与专业知识深度融合，而非简单叠加</li>
              <li>体现专业特色，挖掘专业内涵中的思政元素</li>
              <li>贴近学生生活，引起共鸣而非说教</li>
              <li>注重启发引导，培养学生独立思考能力</li>
              <li>润物细无声，在专业学习中自然实现价值引领</li>
            </ul>
          </div>
        }
        type="info"
        style={{ marginBottom: 24 }}
        showIcon
      />

      <Row gutter={24}>
        <Col xs={24} lg={10}>
          <Card title="📝 设计思政方案">
            <Form form={form} layout="vertical" onFinish={handleGenerate}>
              <Form.Item
                label="课程名称"
                name="courseName"
                rules={[{ required: true, message: '请输入课程名称' }]}
              >
                <Input placeholder="例如：人工智能基础" />
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="课程性质"
                    name="courseNature"
                    rules={[{ required: true }]}
                  >
                    <Select placeholder="请选择">
                      <Option value="专业必修课">专业必修课</Option>
                      <Option value="专业选修课">专业选修课</Option>
                      <Option value="通识课">通识课</Option>
                      <Option value="实践课">实践课</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="专业背景"
                    name="major"
                    rules={[{ required: true }]}
                  >
                    <Input placeholder="例如：计算机科学" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                label="授课对象"
                name="students"
                rules={[{ required: true }]}
              >
                <Input placeholder="例如：本科二年级学生" />
              </Form.Item>

              <Form.Item
                label="选择思政元素"
                name="ideologicalElements"
                rules={[{ required: true, message: '请至少选择一个思政元素' }]}
              >
                <Select mode="multiple" placeholder="选择要融入的思政元素">
                  {ideologicalElements.map((item) => (
                    <Option key={item.value} value={item.value}>
                      <Tag color={item.color}>{item.label}</Tag>
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                label="主要融入方式"
                name="integrationMethod"
                rules={[{ required: true }]}
              >
                <Select placeholder="选择主要融入方式">
                  {integrationMethods.map((method) => (
                    <Option key={method} value={method}>
                      {method}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item label="课程特点（可选）" name="courseFeatures">
                <TextArea
                  rows={4}
                  placeholder="例如：本课程注重实践应用，包含多个实验项目；涉及AI伦理等前沿话题；学生对技术的社会影响较为关注..."
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
                  {loading ? '正在生成...' : '生成思政方案'}
                </Button>
              </Form.Item>
            </Form>
          </Card>

          <Card title="🌟 思政融入示例" style={{ marginTop: 24 }}>
            <Collapse>
              <Panel header="理工科课程：以AI课程为例" key="1">
                <Paragraph>
                  <strong>专业知识点：</strong>机器学习算法的公平性问题
                </Paragraph>
                <Paragraph>
                  <strong>思政元素：</strong>社会责任、科学伦理
                </Paragraph>
                <Paragraph>
                  <strong>融入方式：</strong>
                  通过案例分析（如招聘算法的性别歧视、人脸识别的种族偏见），
                  引导学生思考技术发展的社会责任，培养学生的伦理意识和公平正义观念。
                </Paragraph>
              </Panel>
              <Panel header="人文社科课程：以经济学为例" key="2">
                <Paragraph>
                  <strong>专业知识点：</strong>市场经济理论
                </Paragraph>
                <Paragraph>
                  <strong>思政元素：</strong>中国特色社会主义理论
                </Paragraph>
                <Paragraph>
                  <strong>融入方式：</strong>
                  对比分析中国社会主义市场经济与西方市场经济的异同，
                  结合中国改革开放的成功实践，增强学生的制度自信和文化自信。
                </Paragraph>
              </Panel>
            </Collapse>
          </Card>
        </Col>

        <Col xs={24} lg={14}>
          <Card title="📄 生成的课程思政方案" style={{ minHeight: 600 }}>
            {loading && (
              <div style={{ textAlign: 'center', padding: 40 }}>
                <Spin size="large" />
                <div style={{ marginTop: 16 }}>
                  <Text type="secondary">AI正在设计思政方案...</Text>
                </div>
              </div>
            )}

            {generatedContent && (
              <div
                style={{
                  background: '#fafafa',
                  padding: 24,
                  borderRadius: 8,
                  maxHeight: 700,
                  overflowY: 'auto',
                }}
              >
                <ReactMarkdown>{generatedContent}</ReactMarkdown>
              </div>
            )}

            {!loading && !generatedContent && (
              <div style={{ textAlign: 'center', padding: 100, color: '#999' }}>
                <HeartOutlined style={{ fontSize: 64, marginBottom: 16 }} />
                <div>请填写左侧表单并生成思政方案</div>
              </div>
            )}
          </Card>

          <Card title="📚 课程思政理论参考" style={{ marginTop: 24 }}>
            <Collapse>
              <Panel header="课程思政的基本内涵" key="1">
                <Paragraph>
                  课程思政是将思想政治教育融入课程教学和改革的各环节、各方面，
                  实现知识传授、能力培养与价值引领的有机统一。
                </Paragraph>
                <Paragraph>
                  <strong>核心要义：</strong>
                </Paragraph>
                <ul>
                  <li>所有课程都有育人功能</li>
                  <li>所有教师都有育人职责</li>
                  <li>专业教育与思政教育同向同行</li>
                </ul>
              </Panel>
              <Panel header="如何避免'两张皮'现象" key="2">
                <ol>
                  <li><strong>深度挖掘：</strong>找到专业知识与思政元素的内在联系</li>
                  <li><strong>有机融入：</strong>在知识传授中自然引出价值观</li>
                  <li><strong>案例驱动：</strong>用真实案例引发思考和讨论</li>
                  <li><strong>问题导向：</strong>设置有思政价值的开放性问题</li>
                  <li><strong>榜样示范：</strong>讲述科学家、行业专家的故事</li>
                </ol>
              </Panel>
              <Panel header="课程思政的评价维度" key="3">
                <ul>
                  <li><strong>融入度：</strong>思政元素与专业内容的结合程度</li>
                  <li><strong>适切度：</strong>思政内容是否符合学生特点</li>
                  <li><strong>有效度：</strong>是否达到价值引领的效果</li>
                  <li><strong>创新度：</strong>融入方式是否新颖有吸引力</li>
                </ul>
              </Panel>
            </Collapse>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default IdeologicalEducation;

