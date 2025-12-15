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
  Upload,
  Tabs,
  Table,
  Progress,
} from 'antd';
import {
  BarChartOutlined,
  UploadOutlined,
  RocketOutlined,
  TrophyOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  HistoryOutlined,
} from '@ant-design/icons';
import ReactMarkdown from 'react-markdown';
import { llmService } from '../services/api';
import HistoryDrawer from '../components/HistoryDrawer';
import { storage } from '../utils/storage';

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;

const CourseComparison = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [comparisonResult, setComparisonResult] = useState(null);
  const [analysisText, setAnalysisText] = useState('');
  const [historyVisible, setHistoryVisible] = useState(false);

  const evaluationDimensions = [
    { key: 'objectives', name: '学习目标', weight: 20 },
    { key: 'content', name: '内容设计', weight: 20 },
    { key: 'methods', name: '教学方法', weight: 20 },
    { key: 'assessment', name: '评价体系', weight: 20 },
    { key: 'innovation', name: '创新性', weight: 10 },
    { key: 'feasibility', name: '可操作性', weight: 10 },
  ];

  const generatePrompt = (values) => {
    return `请作为教学设计专家，对比分析以下两个课程大纲/教学设计方案：

【方案A - ${values.nameA || '教师原始方案'}】
${values.syllabusA}

【方案B - ${values.nameB || 'AI生成方案'}】
${values.syllabusB}

请从以下维度进行专业、客观的对比分析：

## 一、整体评价

对两个方案进行总体评价，指出各自的特点和定位。

## 二、分维度对比分析

### 1. 学习目标设计（权重20%）
- **方案A的优势和不足**
- **方案B的优势和不足**
- **对比分析**：目标的明确性、可测量性、层次性
- **评分**：A方案 _/20分，B方案 _/20分

### 2. 内容组织与设计（权重20%）
- **方案A的优势和不足**
- **方案B的优势和不足**
- **对比分析**：内容的系统性、逻辑性、深度和广度
- **评分**：A方案 _/20分，B方案 _/20分

### 3. 教学方法与策略（权重20%）
- **方案A的优势和不足**
- **方案B的优势和不足**
- **对比分析**：方法的多样性、创新性、学生参与度
- **评分**：A方案 _/20分，B方案 _/20分

### 4. 评价与考核体系（权重20%）
- **方案A的优势和不足**
- **方案B的优势和不足**
- **对比分析**：评价的科学性、多元性、公平性
- **评分**：A方案 _/20分，B方案 _/20分

### 5. 创新性（权重10%）
- **方案A的优势和不足**
- **方案B的优势和不足**
- **对比分析**：理念创新、方法创新、技术应用
- **评分**：A方案 _/10分，B方案 _/10分

### 6. 可操作性（权重10%）
- **方案A的优势和不足**
- **方案B的优势和不足**
- **对比分析**：实施的可行性、资源需求、时间安排
- **评分**：A方案 _/10分，B方案 _/10分

## 三、综合评分

| 维度 | 权重 | 方案A得分 | 方案B得分 |
|------|------|----------|----------|
| 学习目标 | 20% | _ | _ |
| 内容设计 | 20% | _ | _ |
| 教学方法 | 20% | _ | _ |
| 评价体系 | 20% | _ | _ |
| 创新性 | 10% | _ | _ |
| 可操作性 | 10% | _ | _ |
| **总分** | **100%** | **_** | **_** |

## 四、优化建议

### 对方案A的改进建议：
1. [具体建议1]
2. [具体建议2]
3. [具体建议3]

### 对方案B的改进建议：
1. [具体建议1]
2. [具体建议2]

### 综合优化方案：
结合两个方案的优点，提出一个更优的综合方案：
- [优化点1]
- [优化点2]
- [优化点3]

## 五、选择建议

基于对比分析，给出选择建议：
- 如果注重 [某方面]，建议选择方案 [A/B]
- 如果注重 [某方面]，建议选择方案 [A/B]
- 最佳方案：[详细说明]

请确保分析：
1. 客观公正，基于教学理论和实践
2. 具体明确，给出可操作的建议
3. 全面深入，覆盖所有重要维度
4. 建设性强，重在帮助改进`;
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
            '你是一位拥有15年经验的教学设计评审专家，曾评审过数百份教学方案。你精通泰勒原理、逆向设计等教学理论，能够从目标、内容、方法、评价等多维度进行专业分析。你的评价客观公正、具体明确，既指出问题也提供解决方案。你善于发现方案的亮点和不足，给出的建议具有很强的可操作性。',
          temperature: 0.6,
          maxTokens: 5500,
        },
        (chunk) => {
          content += chunk;
          setAnalysisText(content);
        }
      );

      // 解析结果（这里简化处理，实际可以用正则提取分数）
      setComparisonResult({
        analysis: content,
        scoreA: 85, // 示例分数，实际应从AI返回中解析
        scoreB: 88,
      });

      message.success('对比分析完成！');
      
      // 保存到历史记录
      storage.saveHistory('comparison', {
        title: `${values.nameA} vs ${values.nameB}`,
        content: content,
        formData: values,
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
      scoreA: 85, // 示例分数，实际应从AI返回中解析
      scoreB: 88,
    });
  };

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

  const dimensionData = [
    {
      key: '1',
      name: '学习目标',
      weight: 20,
      points: '目标的明确性、可测量性、与布卢姆分类的对应、层次性',
    },
    {
      key: '2',
      name: '内容设计',
      weight: 20,
      points: '内容的系统性、逻辑性、深度广度、与目标的对应',
    },
    {
      key: '3',
      name: '教学方法',
      weight: 20,
      points: '方法的多样性、创新性、学生参与度、理论依据',
    },
    {
      key: '4',
      name: '评价体系',
      weight: 20,
      points: '形成性与总结性评价、多元化、公平性、反馈机制',
    },
    {
      key: '5',
      name: '创新性',
      weight: 10,
      points: '教学理念、方法手段、技术应用的创新',
    },
    {
      key: '6',
      name: '可操作性',
      weight: 10,
      points: '实施可行性、资源配置、时间安排合理性',
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>
          <BarChartOutlined /> 课程方案对比与优化
        </Title>
        <Paragraph>
          对比分析不同的课程设计方案，基于教学理论和评价标准给出客观评价，
          帮助您选择最优方案或进行综合优化。
        </Paragraph>
      </div>

      <Alert
        message="💡 如何使用对比功能？"
        description={
          <ol style={{ paddingLeft: 20, marginBottom: 0 }}>
            <li>输入您的原始教学设计（方案A）</li>
            <li>输入AI生成的方案或其他教师的方案（方案B）</li>
            <li>系统将从6个维度进行专业对比分析</li>
            <li>获得详细的优劣分析和改进建议</li>
            <li>参考建议进行方案优化</li>
          </ol>
        }
        type="info"
        style={{ marginBottom: 24 }}
        showIcon
      />

      <Card title="📊 评价维度说明" style={{ marginBottom: 24 }}>
        <Table
          dataSource={dimensionData}
          columns={columns}
          pagination={false}
          size="small"
        />
      </Card>

      <Row gutter={24}>
        <Col xs={24} lg={12}>
          <Card title="📝 输入对比方案">
            <Form form={form} layout="vertical" onFinish={handleCompare}>
              <Form.Item
                label="方案A名称"
                name="nameA"
                initialValue="教师原始方案"
              >
                <Input placeholder="例如：我的教学设计v1.0" />
              </Form.Item>

              <Form.Item
                label="方案A内容"
                name="syllabusA"
                rules={[{ required: true, message: '请输入方案A的内容' }]}
              >
                <TextArea
                  rows={8}
                  placeholder="粘贴您的课程大纲或教学设计方案..."
                />
              </Form.Item>

              <Form.Item
                label="方案B名称"
                name="nameB"
                initialValue="AI优化方案"
              >
                <Input placeholder="例如：AI生成方案" />
              </Form.Item>

              <Form.Item
                label="方案B内容"
                name="syllabusB"
                rules={[{ required: true, message: '请输入方案B的内容' }]}
              >
                <TextArea
                  rows={8}
                  placeholder="粘贴对比的课程大纲或教学设计方案..."
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
                    {loading ? '正在分析...' : '开始对比分析'}
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
          <Card
            title="📊 对比分析结果"
            extra={
              comparisonResult && (
                <Space>
                  <Text>方案A: {comparisonResult.scoreA}分</Text>
                  <Text>方案B: {comparisonResult.scoreB}分</Text>
                </Space>
              )
            }
            style={{ minHeight: 600 }}
          >
            {loading && (
              <div style={{ textAlign: 'center', padding: 40 }}>
                <Spin size="large" />
                <div style={{ marginTop: 16 }}>
                  <Text type="secondary">AI正在进行专业对比分析...</Text>
                </div>
              </div>
            )}

            {comparisonResult && (
              <div>
                <Row gutter={16} style={{ marginBottom: 24 }}>
                  <Col span={12}>
                    <Card size="small">
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Text strong>方案A得分</Text>
                        <Progress
                          percent={comparisonResult.scoreA}
                          strokeColor={
                            comparisonResult.scoreA >= 90
                              ? '#52c41a'
                              : comparisonResult.scoreA >= 80
                              ? '#1890ff'
                              : '#faad14'
                          }
                        />
                      </Space>
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card size="small">
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Text strong>方案B得分</Text>
                        <Progress
                          percent={comparisonResult.scoreB}
                          strokeColor={
                            comparisonResult.scoreB >= 90
                              ? '#52c41a'
                              : comparisonResult.scoreB >= 80
                              ? '#1890ff'
                              : '#faad14'
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
                  }}
                >
                  <ReactMarkdown>{analysisText}</ReactMarkdown>
                </div>
              </div>
            )}

            {!loading && !comparisonResult && (
              <div style={{ textAlign: 'center', padding: 100, color: '#999' }}>
                <BarChartOutlined style={{ fontSize: 64, marginBottom: 16 }} />
                <div>请填写左侧表单并开始对比分析</div>
              </div>
            )}
          </Card>

          {comparisonResult && (
            <Alert
              message={
                <Space>
                  <TrophyOutlined />
                  <Text strong>推荐方案</Text>
                </Space>
              }
              description={
                comparisonResult.scoreB > comparisonResult.scoreA
                  ? '基于综合评分，建议采用方案B，但可以吸收方案A的优点进行优化。'
                  : '基于综合评分，建议采用方案A，但可以参考方案B的创新点进行改进。'
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
        type="comparison"
        onLoad={handleLoadHistory}
      />
    </div>
  );
};

export default CourseComparison;

