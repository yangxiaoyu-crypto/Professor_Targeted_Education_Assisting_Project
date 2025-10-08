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
  Radio,
  Slider,
  Collapse,
} from 'antd';
import { CheckCircleOutlined, RocketOutlined, TableOutlined } from '@ant-design/icons';
import ReactMarkdown from 'react-markdown';
import { llmService } from '../services/api';

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { Panel } = Collapse;

const StudentAssessment = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [generatedAssessment, setGeneratedAssessment] = useState('');
  const [assessmentType, setAssessmentType] = useState('comprehensive');

  const formativeWeight = Form.useWatch('formativeWeight', form) || 40;

  const generatePrompt = (values) => {
    const summativeWeight = 100 - formativeWeight;

    return `请作为教学评价专家，为以下课程设计科学、公平的学生评估方案：

【课程信息】
课程名称：${values.courseName}
课程类型：${values.courseType}
授课对象：${values.students}
评估重点：${values.assessmentFocus}

【评估要求】
评估类型：${assessmentType === 'comprehensive' ? '综合评价（形成性+总结性）' : assessmentType === 'formative' ? '形成性评价为主' : '总结性评价为主'}
形成性评价占比：${formativeWeight}%
总结性评价占比：${summativeWeight}%

【特殊考虑】
${values.specialConsiderations || '无'}

请基于以下评价理论和原则设计评估方案：

## 评价理论基础
1. **形成性评价**（Formative Assessment）：
   - 目的：改进学习过程，提供及时反馈
   - 方法：课堂提问、小测验、作业、同伴互评等
   - 特点：频繁、低风险、反馈性强

2. **总结性评价**（Summative Assessment）：
   - 目的：评定学习成果，做出等级判断
   - 方法：期中考试、期末考试、期末项目等
   - 特点：正式、高权重、证明性强

3. **评价的公平性原则**：
   - 透明：标准明确，学生清楚评价依据
   - 多元：采用多种评价方式，照顾不同学习风格
   - 发展：关注学生的进步和成长
   - 反馈：提供建设性反馈，促进改进

## 请设计包含以下内容的评估方案：

### 一、评估体系总览
- 评估目标与学习目标的对应关系
- 评估方式构成及权重分配
- 评估时间安排

### 二、形成性评价设计（${formativeWeight}%）
详细列出各项形成性评价活动：
- 活动类型（如课堂参与、作业、小测验等）
- 评价频次和时间点
- 评分标准（可使用评价量表/Rubric）
- 反馈方式

### 三、总结性评价设计（${summativeWeight}%）
- 评价形式（笔试、项目、论文等）
- 考核内容和题型分布
- 评分标准
- 成绩评定等级

### 四、评价量表（Rubric）示例
为主要评价活动设计详细的评价量表，包含：
- 评价维度
- 各维度的等级描述（优秀、良好、合格、不合格）
- 分值分配

### 五、反馈机制
- 如何提供及时、有效的反馈
- 学生如何利用反馈改进学习
- 教师如何根据评估结果调整教学

### 六、防止不公平评价的措施
- 如何确保评价的客观性
- 如何处理特殊情况（如缺课、延期等）
- 申诉和复议机制

### 七、评估工具和技术
- 推荐使用的评估工具（在线测试、评分系统等）
- 数据收集和分析方法

请确保评估方案：
1. 与学习目标紧密对应
2. 多元化，照顾不同学生
3. 兼顾过程和结果
4. 公平、透明、可操作
5. 有助于学生学习和教师改进教学`;
  };

  const handleGenerate = async (values) => {
    setLoading(true);
    setGeneratedAssessment('');

    try {
      const prompt = generatePrompt(values);
      let content = '';

      await llmService.streamGenerate(
        prompt,
        {
          systemPrompt:
            '你是一位教学评价专家，精通形成性评价和总结性评价理论，熟悉各种评价工具和量表的设计。你的任务是帮助教师设计科学、公平、有效的学生评估方案。',
          temperature: 0.6,
          maxTokens: 3500,
        },
        (chunk) => {
          content += chunk;
          setGeneratedAssessment(content);
        }
      );

      message.success('评估方案生成成功！');
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
          <CheckCircleOutlined /> 学生评估方案设计
        </Title>
        <Paragraph>
          基于形成性评价和总结性评价理论，设计科学、公平的评估体系。
          帮助您避免不公平评价，提供有效的学习反馈。
        </Paragraph>
      </div>

      <Alert
        message="🎯 好的评估方案的特征"
        description={
          <ul style={{ paddingLeft: 20, marginBottom: 0 }}>
            <li><strong>对齐性</strong>：评估内容与学习目标一致</li>
            <li><strong>多样性</strong>：采用多种评估方式，全面评价学生能力</li>
            <li><strong>公平性</strong>：标准明确、透明，对所有学生一视同仁</li>
            <li><strong>发展性</strong>：关注学生进步，提供改进机会</li>
            <li><strong>反馈性</strong>：及时反馈，帮助学生和教师改进</li>
          </ul>
        }
        type="info"
        style={{ marginBottom: 24 }}
        showIcon
      />

      <Row gutter={24}>
        <Col xs={24} lg={10}>
          <Card title="📝 设计评估方案">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleGenerate}
              initialValues={{
                assessmentType: 'comprehensive',
                formativeWeight: 40,
              }}
            >
              <Form.Item
                label="课程名称"
                name="courseName"
                rules={[{ required: true, message: '请输入课程名称' }]}
              >
                <Input placeholder="例如：机器学习基础" />
              </Form.Item>

              <Form.Item
                label="课程类型"
                name="courseType"
                rules={[{ required: true }]}
              >
                <Select placeholder="请选择">
                  <Option value="理论课">理论课</Option>
                  <Option value="实践课">实践课</Option>
                  <Option value="理论+实践">理论+实践课</Option>
                  <Option value="研讨课">研讨课</Option>
                </Select>
              </Form.Item>

              <Form.Item
                label="授课对象"
                name="students"
                rules={[{ required: true }]}
              >
                <Input placeholder="例如：计算机专业本科三年级学生" />
              </Form.Item>

              <Form.Item
                label="评估类型"
                name="assessmentType"
                rules={[{ required: true }]}
              >
                <Radio.Group
                  onChange={(e) => setAssessmentType(e.target.value)}
                  value={assessmentType}
                >
                  <Space direction="vertical">
                    <Radio value="comprehensive">
                      综合评价（形成性评价 + 总结性评价）
                    </Radio>
                    <Radio value="formative">以形成性评价为主</Radio>
                    <Radio value="summative">以总结性评价为主</Radio>
                  </Space>
                </Radio.Group>
              </Form.Item>

              {assessmentType === 'comprehensive' && (
                <Form.Item
                  label={`形成性评价占比：${formativeWeight}%（总结性评价：${100 - formativeWeight}%）`}
                  name="formativeWeight"
                >
                  <Slider
                    min={20}
                    max={80}
                    marks={{
                      20: '20%',
                      40: '40%',
                      60: '60%',
                      80: '80%',
                    }}
                  />
                </Form.Item>
              )}

              <Form.Item
                label="评估重点"
                name="assessmentFocus"
                rules={[{ required: true }]}
              >
                <Select mode="multiple" placeholder="选择评估重点">
                  <Option value="知识掌握">知识掌握程度</Option>
                  <Option value="应用能力">知识应用能力</Option>
                  <Option value="问题解决">问题解决能力</Option>
                  <Option value="创新思维">创新思维</Option>
                  <Option value="团队协作">团队协作</Option>
                  <Option value="表达能力">表达和沟通</Option>
                  <Option value="学习态度">学习态度</Option>
                </Select>
              </Form.Item>

              <Form.Item label="特殊考虑" name="specialConsiderations">
                <TextArea
                  rows={3}
                  placeholder="例如：班级人数较多（100+人）、学生基础参差不齐、需要照顾特殊学生等..."
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
                  {loading ? '正在生成...' : '生成评估方案'}
                </Button>
              </Form.Item>
            </Form>
          </Card>

          <Card title="📊 评价量表（Rubric）参考" style={{ marginTop: 24 }}>
            <Paragraph>
              评价量表是一种结构化的评分工具，明确列出评价维度和各等级的表现标准。
            </Paragraph>
            <Collapse>
              <Panel header="小组项目评价量表示例" key="1">
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#fafafa' }}>
                      <th style={{ border: '1px solid #ddd', padding: 8 }}>维度</th>
                      <th style={{ border: '1px solid #ddd', padding: 8 }}>优秀(9-10分)</th>
                      <th style={{ border: '1px solid #ddd', padding: 8 }}>良好(7-8分)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ border: '1px solid #ddd', padding: 8 }}>内容完整性</td>
                      <td style={{ border: '1px solid #ddd', padding: 8 }}>
                        完整涵盖所有要求
                      </td>
                      <td style={{ border: '1px solid #ddd', padding: 8 }}>
                        基本涵盖主要要求
                      </td>
                    </tr>
                    <tr>
                      <td style={{ border: '1px solid #ddd', padding: 8 }}>创新性</td>
                      <td style={{ border: '1px solid #ddd', padding: 8 }}>
                        有独特见解和创新
                      </td>
                      <td style={{ border: '1px solid #ddd', padding: 8 }}>有一定创新</td>
                    </tr>
                  </tbody>
                </table>
              </Panel>
            </Collapse>
          </Card>
        </Col>

        <Col xs={24} lg={14}>
          <Card
            title="📄 生成的评估方案"
            extra={
              generatedAssessment && (
                <Button icon={<TableOutlined />}>导出为表格</Button>
              )
            }
            style={{ minHeight: 600 }}
          >
            {loading && (
              <div style={{ textAlign: 'center', padding: 40 }}>
                <Spin size="large" />
                <div style={{ marginTop: 16 }}>
                  <Text type="secondary">AI正在设计评估方案...</Text>
                </div>
              </div>
            )}

            {generatedAssessment && (
              <div
                style={{
                  background: '#fafafa',
                  padding: 24,
                  borderRadius: 8,
                  maxHeight: 700,
                  overflowY: 'auto',
                }}
              >
                <ReactMarkdown>{generatedAssessment}</ReactMarkdown>
              </div>
            )}

            {!loading && !generatedAssessment && (
              <div style={{ textAlign: 'center', padding: 100, color: '#999' }}>
                <CheckCircleOutlined style={{ fontSize: 64, marginBottom: 16 }} />
                <div>请填写左侧表单并生成评估方案</div>
              </div>
            )}
          </Card>

          <Card title="📚 评价理论参考" style={{ marginTop: 24 }}>
            <Collapse>
              <Panel header="形成性评价 vs 总结性评价" key="1">
                <Row gutter={16}>
                  <Col span={12}>
                    <Title level={5}>形成性评价</Title>
                    <ul>
                      <li>目的：改进学习</li>
                      <li>时机：学习过程中</li>
                      <li>频率：频繁</li>
                      <li>反馈：及时、具体</li>
                      <li>示例：课堂提问、作业、小测</li>
                    </ul>
                  </Col>
                  <Col span={12}>
                    <Title level={5}>总结性评价</Title>
                    <ul>
                      <li>目的：评定成果</li>
                      <li>时机：学习结束后</li>
                      <li>频率：较少</li>
                      <li>反馈：等级、分数</li>
                      <li>示例：期末考试、大作业</li>
                    </ul>
                  </Col>
                </Row>
              </Panel>
              <Panel header="有效反馈的七个原则" key="2">
                <ol>
                  <li>帮助澄清好的表现标准</li>
                  <li>促进自我评估和反思</li>
                  <li>提供高质量的学习信息</li>
                  <li>鼓励师生和同伴对话</li>
                  <li>鼓励积极的动机和自尊</li>
                  <li>提供缩小差距的机会</li>
                  <li>为教师改进教学提供信息</li>
                </ol>
              </Panel>
            </Collapse>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default StudentAssessment;

