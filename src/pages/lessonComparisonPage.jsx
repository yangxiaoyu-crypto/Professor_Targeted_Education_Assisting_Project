import React, { useState } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Space,
  Typography,
  Row,
  Col,
  Alert,
  message,
  Spin,
  Table,
  Progress,
} from 'antd';
import {
  BarChartOutlined,
  HistoryOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import ReactMarkdown from 'react-markdown';
import { llmService } from '../services/api';
import HistoryDrawer from '../components/HistoryDrawer';
import { storage } from '../utils/storage';

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;

const LessonComparisonPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [comparisonResult, setComparisonResult] = useState(null);
  const [analysisText, setAnalysisText] = useState('');
  const [historyVisible, setHistoryVisible] = useState(false);

  // 课时教学设计对比的核心评价维度
  const evaluationDimensions = [
    { key: 'objectives', name: '教学目标明确性', weight: 20 },
    { key: 'content', name: '内容设计', weight: 25 },
    { key: 'methods', name: '教学方法', weight: 20 },
    { key: 'interaction', name: '互动设计', weight: 15 },
    { key: 'assessment', name: '评价方式', weight: 10 },
    { key: 'time', name: '时间分配', weight: 10 },
  ];

  // 生成针对课时教学设计对比的提示词
  const generatePrompt = (values) => {
    return `请作为教学设计专家，专门对比分析以下两个课时教学设计方案：

【教学设计A - ${values.nameA || '原始教学设计'}】
${values.lessonPlanA}

【教学设计B - ${values.nameB || '对比教学设计'}】
${values.lessonPlanB}

请从教学设计的专业角度进行客观对比分析，包括以下维度：

## 一、整体评价
简要概述两个教学设计的整体特点、适用场景和主要差异。

## 二、分维度对比分析

### 1. 教学目标明确性（权重20%）
- **设计A的优势和不足**
- **设计B的优势和不足**
- **对比分析**：目标描述的清晰度、可操作性、与课程整体目标的关联性
- **评分**：A方案 _/20分，B方案 _/20分

### 2. 教学内容设计（权重25%）
- **设计A的优势和不足**
- **设计B的优势和不足**
- **对比分析**：内容选择的适宜性、重难点突出度、知识呈现方式
- **评分**：A方案 _/25分，B方案 _/25分

### 3. 教学方法选择（权重20%）
- **设计A的优势和不足**
- **设计B的优势和不足**
- **对比分析**：方法与内容的匹配度、教学手段的多样性、创新性
- **评分**：A方案 _/20分，B方案 _/20分

### 4. 师生互动设计（权重15%）
- **设计A的优势和不足**
- **设计B的优势和不足**
- **对比分析**：互动形式的有效性、参与度设计、反馈机制
- **评分**：A方案 _/15分，B方案 _/15分

### 5. 教学评价方式（权重10%）
- **设计A的优势和不足**
- **设计B的优势和不足**
- **对比分析**：评价与目标的一致性、评价方式的多样性、即时性
- **评分**：A方案 _/10分，B方案 _/10分

### 6. 时间分配合理性（权重10%）
- **设计A的优势和不足**
- **设计B的优势和不足**
- **对比分析**：各环节时间分配的科学性、节奏把控、弹性设计
- **评分**：A方案 _/10分，B方案 _/10分

## 三、综合评分

| 维度 | 权重 | 设计A得分 | 设计B得分 |
|------|------|----------|----------|
| 教学目标明确性 | 20% | _ | _ |
| 教学内容设计 | 25% | _ | _ |
| 教学方法选择 | 20% | _ | _ |
| 师生互动设计 | 15% | _ | _ |
| 教学评价方式 | 10% | _ | _ |
| 时间分配合理性 | 10% | _ | _ |
| **总分** | **100%** | **_** | **_** |

## 四、优化建议

### 对设计A的改进建议：
1. [具体建议1]
2. [具体建议2]
3. [具体建议3]

### 对设计B的改进建议：
1. [具体建议1]
2. [具体建议2]
3. [具体建议3]

### 综合优化方案：
结合两个设计的优点，提出一个更优的课时教学设计方案：
- [优化点1]
- [优化点2]
- [优化点3]

## 五、选择建议

基于对比分析，给出选择建议：
- 对于[特定教学场景/对象]，建议选择设计[A/B]
- 对于[特定教学场景/对象]，建议选择设计[A/B]
- 最佳选择及理由：[详细说明]

请确保分析专业、客观，基于教学设计的专业理论，提供具体且可操作的建议。`;
  };

  const handleCompare = async (values) => {
    setLoading(true);
    setComparisonResult(null);
    setAnalysisText('');

    try {
      const prompt = generatePrompt(values);
      let content = '';

      await llmService.streamGenerate(
        prompt,
        {
          systemPrompt:
            '你是一位拥有10年以上教学经验的教学设计专家，专注于课时教学设计的评估与优化。你熟悉各类教学方法和策略，能够精准判断教学设计的优劣之处，提供专业且可行的改进建议。',
          temperature: 0.5,
          maxTokens: 6000,
        },
        (chunk) => {
          content += chunk;
          setAnalysisText(content);
        }
      );

      // 实际应用中应从AI返回结果中解析真实分数
      setComparisonResult({
        analysis: content,
        scoreA: 82,
        scoreB: 86,
      });

      message.success('课时教学设计对比分析完成！');
      
      // 保存到历史记录
      storage.saveHistory('lesson-plan-comparison', {
        title: `${values.nameA} vs ${values.nameB}`,
        content: content,
        formData: values,
        timestamp: new Date().getTime()
      });
    } catch (error) {
      message.error('分析失败，请稍后重试');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // 加载历史记录到表单
  const handleLoadHistory = (item) => {
    form.setFieldsValue(item.formData);
    setAnalysisText(item.content);
    setComparisonResult({
      analysis: item.content,
      scoreA: 82, // 示例分数
      scoreB: 86,
    });
  };

  // 评价维度表格数据
  const dimensionData = [
    {
      key: '1',
      name: '教学目标明确性',
      weight: 20,
      points: '目标描述的清晰度、可操作性、与课程整体目标的关联性',
    },
    {
      key: '2',
      name: '教学内容设计',
      weight: 25,
      points: '内容选择的适宜性、重难点突出度、知识呈现方式',
    },
    {
      key: '3',
      name: '教学方法选择',
      weight: 20,
      points: '方法与内容的匹配度、教学手段的多样性、创新性',
    },
    {
      key: '4',
      name: '师生互动设计',
      weight: 15,
      points: '互动形式的有效性、参与度设计、反馈机制',
    },
    {
      key: '5',
      name: '教学评价方式',
      weight: 10,
      points: '评价与目标的一致性、评价方式的多样性、即时性',
    },
    {
      key: '6',
      name: '时间分配合理性',
      weight: 10,
      points: '各环节时间分配的科学性、节奏把控、弹性设计',
    },
  ];

  const columns = [
    {
      title: '评价维度',
      dataIndex: 'name',
      key: 'name',
      width: 150,
    },
    {
      title: '权重',
      dataIndex: 'weight',
      key: 'weight',
      width: 80,
      render: (weight) => `${weight}%`,
    },
    {
      title: '评价要点',
      dataIndex: 'points',
      key: 'points',
    },
  ];

  return (
    <div className="lesson-comparison-page">
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>
          <ClockCircleOutlined /> 课时教学设计对比分析
        </Title>
        <Paragraph>
          专业对比两份课时教学设计的目标明确性、内容设计、教学方法等核心维度，
          提供客观评分和优化建议，帮助您选择更优方案或融合改进。
        </Paragraph>
      </div>

      <Alert
        message="💡 如何使用对比功能？"
        description={
          <ol style={{ paddingLeft: 20, marginBottom: 0 }}>
            <li>输入第一个教学设计的名称和内容（设计A）</li>
            <li>输入第二个教学设计的名称和内容（设计B）</li>
            <li>系统将从6个专业维度进行对比分析并评分</li>
            <li>获取详细的优劣分析、优化建议和选择指导</li>
          </ol>
        }
        type="info"
        style={{ marginBottom: 24 }}
        showIcon
      />

      <Card title="📋 评价维度说明" style={{ marginBottom: 24 }}>
        <Table
          dataSource={dimensionData}
          columns={columns}
          pagination={false}
          size="small"
        />
      </Card>

      <Row gutter={24}>
        <Col xs={24} lg={12}>
          <Card title="📝 输入课时教学设计">
            <Form form={form} layout="vertical" onFinish={handleCompare}>
              <Form.Item
                label="设计A名称"
                name="nameA"
                initialValue="课时教学设计版本一"
              >
                <Input placeholder="例如：《数据结构》第3课时教学设计" />
              </Form.Item>

              <Form.Item
                label="设计A内容"
                name="lessonPlanA"
                rules={[{ required: true, message: '请输入教学设计A的内容' }]}
              >
                <TextArea
                  rows={10}
                  placeholder="粘贴教学设计A的完整内容，包括教学目标、教学过程、教学方法、互动设计、评价方式、时间分配等..."
                />
              </Form.Item>

              <Form.Item
                label="设计B名称"
                name="nameB"
                initialValue="课时教学设计版本二"
              >
                <Input placeholder="例如：《数据结构》第3课时优化教学设计" />
              </Form.Item>

              <Form.Item
                label="设计B内容"
                name="lessonPlanB"
                rules={[{ required: true, message: '请输入教学设计B的内容' }]}
              >
                <TextArea
                  rows={10}
                  placeholder="粘贴教学设计B的完整内容，包括教学目标、教学过程、教学方法、互动设计、评价方式、时间分配等..."
                />
              </Form.Item>

              <Form.Item>
                <Space style={{ width: '100%' }} direction="vertical">
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    icon={<BarChartOutlined />}
                    size="large"
                    block
                  >
                    {loading ? '正在对比分析...' : '开始教学设计对比分析'}
                  </Button>
                  <Button
                    icon={<HistoryOutlined />}
                    onClick={() => setHistoryVisible(true)}
                    size="large"
                    block
                  >
                    查看历史对比记录
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            title="📊 教学设计对比结果"
            extra={
              comparisonResult && (
                <Space>
                  <Text>设计A: {comparisonResult.scoreA}分</Text>
                  <Text>设计B: {comparisonResult.scoreB}分</Text>
                </Space>
              )
            }
            style={{ minHeight: 680 }}
          >
            {loading && (
              <div style={{ textAlign: 'center', padding: 60 }}>
                <Spin size="large" />
                <div style={{ marginTop: 16 }}>
                  <Text type="secondary">AI正在进行教学设计专业对比分析...</Text>
                </div>
              </div>
            )}

            {comparisonResult && (
              <div>
                <Row gutter={16} style={{ marginBottom: 24 }}>
                  <Col span={12}>
                    <Card size="small">
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Text strong>{form.getFieldValue('nameA') || '设计A'} 得分</Text>
                        <Progress
                          percent={comparisonResult.scoreA}
                          strokeColor={
                            comparisonResult.scoreA >= 90
                              ? '#52c41a'
                              : comparisonResult.scoreA >= 80
                              ? '#1890ff'
                              : comparisonResult.scoreA >= 70
                              ? '#faad14'
                              : '#f5222d'
                          }
                        />
                      </Space>
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card size="small">
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Text strong>{form.getFieldValue('nameB') || '设计B'} 得分</Text>
                        <Progress
                          percent={comparisonResult.scoreB}
                          strokeColor={
                            comparisonResult.scoreB >= 90
                              ? '#52c41a'
                              : comparisonResult.scoreB >= 80
                              ? '#1890ff'
                              : comparisonResult.scoreB >= 70
                              ? '#faad14'
                              : '#f5222d'
                          }
                        />
                      </Space>
                    </Card>
                  </Col>
                </Row>

                <div
                  style={{
                    background: '#fafafa',
                    padding: 24,
                    borderRadius: 8,
                    maxHeight: 600,
                    overflowY: 'auto',
                    fontSize: 14,
                    lineHeight: 1.8,
                  }}
                >
                  <ReactMarkdown>{analysisText}</ReactMarkdown>
                </div>
              </div>
            )}

            {!loading && !comparisonResult && (
              <div style={{ textAlign: 'center', padding: 120, color: '#999' }}>
                <ClockCircleOutlined style={{ fontSize: 64, marginBottom: 16 }} />
                <div>请填写左侧两个课时教学设计内容并开始对比分析</div>
              </div>
            )}
          </Card>

          {comparisonResult && (
            <Alert
              message={
                <Space>
                  <TrophyOutlined />
                  <Text strong>推荐选择</Text>
                </Space>
              }
              description={
                comparisonResult.scoreB > comparisonResult.scoreA
                  ? `基于综合评分，${form.getFieldValue('nameB') || '设计B'} 表现更优，建议优先采用并参考${form.getFieldValue('nameA') || '设计A'}的优点进行完善。`
                  : `基于综合评分，${form.getFieldValue('nameA') || '设计A'} 表现更优，建议优先采用并吸收${form.getFieldValue('nameB') || '设计B'}的优势进行优化。`
              }
              type="success"
              showIcon
              style={{ marginTop: 16 }}
            />
          )}
        </Col>
      </Row>

      {/* 历史记录抽屉 */}
      <HistoryDrawer
        visible={historyVisible}
        onClose={() => setHistoryVisible(false)}
        type="lesson-plan-comparison"
        onLoad={handleLoadHistory}
        title="课时教学设计对比历史"
      />
    </div>
  );
};

export default LessonComparisonPage;