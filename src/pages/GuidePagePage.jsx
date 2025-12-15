import React from 'react';
import { Card, Row, Col, Typography, Collapse, Space, Button, Divider, Alert } from 'antd';
import MascotCharacter from '../components/MascotCharacter';
import {
  BookOutlined,
  BulbOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  TeamOutlined,
  HeartOutlined,
  RocketOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

const GuidePagePage = () => {
  const guides = [
    {
      key: '1',
      label: (
        <span>
          <FileTextOutlined style={{ marginRight: 8, color: '#1890ff' }} />
          快速生成教学大纲
        </span>
      ),
      children: (
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <div>
            <Text strong>功能说明：</Text>
            <Paragraph style={{ marginLeft: 20, marginTop: 8 }}>
              根据课程基本信息，智能生成符合教学设计理论的完整课程大纲。系统会自动引用知识库中的相关教学资源和理论。
            </Paragraph>
          </div>
          <div>
            <Text strong>使用步骤：</Text>
            <ol style={{ marginLeft: 20, marginTop: 8 }}>
              <li>输入课程名称（如：数据结构与算法）</li>
              <li>选择教学模式（如：讲授+实践）</li>
              <li>填写课程学时（如：48学时）</li>
              <li>描述教学目标和学生背景</li>
              <li>点击"生成课程大纲"按钮</li>
              <li>查看生成结果和参考来源</li>
            </ol>
          </div>
          <div>
            <Text strong>输出内容：</Text>
            <Paragraph style={{ marginLeft: 20, marginTop: 8 }}>
              • 课程概述<br/>
              • 学习目标<br/>
              • 课程内容结构<br/>
              • 教学方法和策略<br/>
              • 评估方案<br/>
              • 参考文献
            </Paragraph>
          </div>
          <Alert
            message="💡 提示"
            description="生成的大纲可以作为初稿，根据实际教学需求进行调整和优化。"
            type="info"
            showIcon
          />
        </Space>
      ),
    },
    {
      key: '2',
      label: (
        <span>
          <BulbOutlined style={{ marginRight: 8, color: '#faad14' }} />
          学习目标撰写
        </span>
      ),
      children: (
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <div>
            <Text strong>功能说明：</Text>
            <Paragraph style={{ marginLeft: 20, marginTop: 8 }}>
              基于布卢姆分类法和加涅学习理论，帮助教师撰写清晰、可测量的学习目标。确保学习目标符合SMART原则。
            </Paragraph>
          </div>
          <div>
            <Text strong>使用步骤：</Text>
            <ol style={{ marginLeft: 20, marginTop: 8 }}>
              <li>输入课程名称和主题</li>
              <li>选择授课对象（如：一年级学生）</li>
              <li>选择目标认知层次（记忆、理解、应用等）</li>
              <li>描述教师的教学期望（可选）</li>
              <li>点击"生成学习目标"按钮</li>
              <li>查看生成的目标和参考文献</li>
            </ol>
          </div>
          <div>
            <Text strong>认知层次说明：</Text>
            <Paragraph style={{ marginLeft: 20, marginTop: 8 }}>
              • 记忆：回忆基本事实和概念<br/>
              • 理解：解释概念和原理<br/>
              • 应用：在新情境中应用知识<br/>
              • 分析：分解和比较信息<br/>
              • 评估：做出判断和决策<br/>
              • 创造：创建新的想法和产品
            </Paragraph>
          </div>
          <Alert
            message="💡 提示"
            description="好的学习目标应该是具体、可测量、可达成、相关和有时限的（SMART原则）。"
            type="info"
            showIcon
          />
        </Space>
      ),
    },
    {
      key: '3',
      label: (
        <span>
          <CheckCircleOutlined style={{ marginRight: 8, color: '#52c41a' }} />
          学生评估方案设计
        </span>
      ),
      children: (
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <div>
            <Text strong>功能说明：</Text>
            <Paragraph style={{ marginLeft: 20, marginTop: 8 }}>
              设计科学、公平的学生评估方案，包括形成性评价和总结性评价。确保评估与学习目标相对应。
            </Paragraph>
          </div>
          <div>
            <Text strong>使用步骤：</Text>
            <ol style={{ marginLeft: 20, marginTop: 8 }}>
              <li>输入课程名称</li>
              <li>描述学习目标</li>
              <li>选择评估类型（综合评估）</li>
              <li>设置形成性评价权重</li>
              <li>点击"生成评估方案"按钮</li>
              <li>查看评估方案和参考资源</li>
            </ol>
          </div>
          <div>
            <Text strong>评估类型说明：</Text>
            <Paragraph style={{ marginLeft: 20, marginTop: 8 }}>
              • 形成性评价：课程进行中的评价，用于改进教学<br/>
              • 总结性评价：课程结束时的评价，用于判断学习成果<br/>
              • 诊断性评价：课程开始前的评价，了解学生基础
            </Paragraph>
          </div>
          <Alert
            message="💡 提示"
            description="评估方案应该多元化，包括笔试、口试、实践、项目等多种形式。"
            type="info"
            showIcon
          />
        </Space>
      ),
    },
    {
      key: '4',
      label: (
        <span>
          <TeamOutlined style={{ marginRight: 8, color: '#52c41a' }} />
          参与式学习
        </span>
      ),
      children: (
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <div>
            <Text strong>功能说明：</Text>
            <Paragraph style={{ marginLeft: 20, marginTop: 8 }}>
              提供多种参与式学习方案，包括BOPPPS、项目化学习（PBL）、翻转课堂等创新教学模式。
            </Paragraph>
          </div>
          <div>
            <Text strong>常见教学模式：</Text>
            <Paragraph style={{ marginLeft: 20, marginTop: 8 }}>
              • BOPPPS：开场、目标、前测、参与、后测、总结<br/>
              • PBL：项目化学习，以真实问题为驱动<br/>
              • 翻转课堂：学生课前自学，课堂进行讨论和实践<br/>
              • 案例教学法：通过分析实际案例进行学习<br/>
              • 同伴教学法：学生之间互相教学
            </Paragraph>
          </div>
          <Alert
            message="💡 提示"
            description="选择合适的教学模式应该考虑课程性质、学生特点和教学资源。"
            type="info"
            showIcon
          />
        </Space>
      ),
    },
    {
      key: '5',
      label: (
        <span>
          <HeartOutlined style={{ marginRight: 8, color: '#eb2f96' }} />
          课程思政
        </span>
      ),
      children: (
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <div>
            <Text strong>功能说明：</Text>
            <Paragraph style={{ marginLeft: 20, marginTop: 8 }}>
              帮助教师将思政元素自然融入课程内容，实现知识传授与价值引领的统一。
            </Paragraph>
          </div>
          <div>
            <Text strong>融入方式：</Text>
            <Paragraph style={{ marginLeft: 20, marginTop: 8 }}>
              • 案例融入：选择具有思政意义的案例<br/>
              • 讨论融入：设计引发思考的讨论题<br/>
              • 项目融入：设计具有社会意义的项目<br/>
              • 评价融入：在评估中体现思政要求
            </Paragraph>
          </div>
          <Alert
            message="💡 提示"
            description="课程思政不是额外的内容，而是自然融入专业知识教学中的价值引领。"
            type="info"
            showIcon
          />
        </Space>
      ),
    },
    {
      key: '6',
      label: (
        <span>
          <RocketOutlined style={{ marginRight: 8, color: '#13c2c2' }} />
          课程优化比较
        </span>
      ),
      children: (
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <div>
            <Text strong>功能说明：</Text>
            <Paragraph style={{ marginLeft: 20, marginTop: 8 }}>
              对比分析不同的课程设计方案，提供优化建议，帮助教师选择最佳的教学设计。
            </Paragraph>
          </div>
          <div>
            <Text strong>使用步骤：</Text>
            <ol style={{ marginLeft: 20, marginTop: 8 }}>
              <li>输入课程名称</li>
              <li>粘贴或输入现有的课程大纲</li>
              <li>点击"对比分析"按钮</li>
              <li>查看优化建议和参考资源</li>
            </ol>
          </div>
          <Alert
            message="💡 提示"
            description="系统会从教学目标、内容结构、教学方法、评估方案等多个维度提供优化建议。"
            type="info"
            showIcon
          />
        </Space>
      ),
    },
  ];

  return (
    <div>
      {/* 页面标题 */}
      <Card style={{ marginBottom: 24, position: 'relative' }}>
        <div style={{ position: 'absolute', top: -40, right: 24, width: '100px', height: '100px', zIndex: 5 }}>
          <MascotCharacter 
            state="help" 
            position="center"
            size="small"
            interactive={true}
            removeBackground={true}
            showDialogue={false}
          />
        </div>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Title level={2} style={{ margin: 0 }}>
            📖 使用指南
          </Title>
          <Paragraph>
            欢迎使用教学智能助手！本指南将帮助你快速了解各个功能的使用方法。
          </Paragraph>
        </Space>
      </Card>

      {/* 快速开始 */}
      <Card title="🚀 快速开始" style={{ marginBottom: 24 }}>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <div>
            <Text strong>第一步：选择功能</Text>
            <Paragraph style={{ marginLeft: 20, marginTop: 8 }}>
              在左侧菜单中选择你需要的功能。系统提供了多个模块，可以帮助你完成不同的教学设计任务。
            </Paragraph>
          </div>
          <div>
            <Text strong>第二步：填写信息</Text>
            <Paragraph style={{ marginLeft: 20, marginTop: 8 }}>
              根据页面提示填写相关信息。系统会根据你的输入生成相应的教学设计内容。
            </Paragraph>
          </div>
          <div>
            <Text strong>第三步：查看结果</Text>
            <Paragraph style={{ marginLeft: 20, marginTop: 8 }}>
              生成的内容会显示在右侧。你可以查看生成的内容，以及系统引用的参考文献。
            </Paragraph>
          </div>
          <div>
            <Text strong>第四步：优化调整</Text>
            <Paragraph style={{ marginLeft: 20, marginTop: 8 }}>
              生成的内容可以作为初稿，根据实际教学需求进行调整和优化。
            </Paragraph>
          </div>
        </Space>
      </Card>

      {/* 功能详解 */}
      <Card title="📚 功能详解" style={{ marginBottom: 24 }}>
        <Collapse items={guides} />
      </Card>

      {/* 常见问题 */}
      <Card title="❓ 常见问题" style={{ marginBottom: 24 }}>
        <Collapse
          items={[
            {
              key: '1',
              label: '生成的内容可以直接使用吗？',
              children: (
                <Paragraph>
                  生成的内容是基于教学设计理论和知识库资源的建议，可以作为初稿使用。建议根据你的实际教学情况进行调整和优化，确保内容符合你的课程特点和学生需求。
                </Paragraph>
              ),
            },
            {
              key: '2',
              label: '如何理解参考来源？',
              children: (
                <Paragraph>
                  参考来源显示了系统在生成内容时引用的知识库资源。这些资源包括教学理论文献、教学模式、评价工具等。你可以查阅这些资源来深入理解生成内容的理论基础。
                </Paragraph>
              ),
            },
            {
              key: '3',
              label: '如何获得最好的生成结果？',
              children: (
                <Paragraph>
                  • 提供详细的课程信息：课程名称、学时、学生特点等<br/>
                  • 清晰表达教学目标：说明你希望学生学到什么<br/>
                  • 描述教学环境：教室设备、学生人数等<br/>
                  • 多次尝试：可以用不同的表述方式多次生成，选择最满意的结果
                </Paragraph>
              ),
            },
            {
              key: '4',
              label: '系统支持哪些文件格式？',
              children: (
                <Paragraph>
                  系统主要支持文本输入。你可以直接在表单中输入课程信息，或粘贴现有的课程大纲进行分析和优化。
                </Paragraph>
              ),
            },
            {
              key: '5',
              label: '如何保存生成的内容？',
              children: (
                <Paragraph>
                  生成的内容会自动保存到历史记录中。你可以点击"历史记录"按钮查看之前生成的所有内容。你也可以手动复制内容到Word或其他文档中进行编辑。
                </Paragraph>
              ),
            },
          ]}
        />
      </Card>

      {/* 最佳实践 */}
      <Card title="⭐ 最佳实践" style={{ marginBottom: 24 }}>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <div>
            <Text strong>1. 新手教师的建议流程：</Text>
            <Paragraph style={{ marginLeft: 20, marginTop: 8 }}>
              学习目标撰写 → 课程大纲生成 → 学生评估方案设计 → 参与式学习探索
            </Paragraph>
          </div>
          <div>
            <Text strong>2. 经验教师的建议流程：</Text>
            <Paragraph style={{ marginLeft: 20, marginTop: 8 }}>
              输入现有课程 → 课程优化比较 → 获取改进建议 → 融入课程思政
            </Paragraph>
          </div>
          <div>
            <Text strong>3. 教学创新的建议流程：</Text>
            <Paragraph style={{ marginLeft: 20, marginTop: 8 }}>
              探索参与式学习 → 了解创新教学模式 → 设计创新评估方案 → 融入课程思政
            </Paragraph>
          </div>
          <div>
            <Text strong>4. 通用建议：</Text>
            <Paragraph style={{ marginLeft: 20, marginTop: 8 }}>
              • 定期更新课程设计，保持内容的新鲜度<br/>
              • 收集学生反馈，不断改进教学方法<br/>
              • 参考知识库中的理论和案例，提升教学质量<br/>
              • 与同事交流，分享最佳实践
            </Paragraph>
          </div>
        </Space>
      </Card>

      {/* 联系支持 */}
      <Card title="📞 获取帮助" style={{ marginBottom: 24 }}>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Paragraph>
            如果你在使用过程中遇到问题，可以：
          </Paragraph>
          <Paragraph style={{ marginLeft: 20 }}>
            • 查看本指南的常见问题部分<br/>
            • 查阅系统文档和教学资源<br/>
            • 联系技术支持团队
          </Paragraph>
          
          <Divider />
          
          <div>
            <Text strong>📱 联系方式：</Text>
            <Paragraph style={{ marginLeft: 20, marginTop: 8 }}>
              <Text>QQ: <Text code>532075404</Text></Text>
            </Paragraph>
          </div>
          
          <Alert
            message="💡 反馈"
            description="我们非常欢迎你的建议和反馈，这将帮助我们不断改进系统。"
            type="success"
            showIcon
          />
        </Space>
      </Card>
    </div>
  );
};

export default GuidePagePage;
