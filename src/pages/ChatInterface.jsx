import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Input, Button, List, Card, Spin, Typography, Space, Divider } from 'antd';
import { SendOutlined, ClearOutlined } from '@ant-design/icons';
import ReactMarkdown from 'react-markdown';
import { llmService } from '../services/api';

const { Text, Title } = Typography;

const ChatInterface = () => {
  // 对话状态管理
  const [messages, setMessages] = useState([
    { role: 'assistant', content: '您好，我是教学智能助手，可帮您解答教学相关问题，提供建议~' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null); // 用于自动滚动到底部

  // 自动滚动到最新消息
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 处理发送消息
  const handleSend = useCallback(async () => {
    if (!input.trim() || loading) return;

    // 添加用户消息
    const userMessage = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // 构建对话上下文（最近10条消息，避免过长）
      const contextMessages = messages.slice(-10).concat(userMessage);
      const formattedContext = contextMessages.map(msg => 
        `${msg.role === 'user' ? '用户' : '助手'}: ${msg.content}`
      ).join('\n');

      // 调用流式生成接口
      let aiResponse = '';
      // 先添加一个空的AI消息占位
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      await llmService.streamGenerate(
        `基于历史对话回答：\n${formattedContext}\n助手: `,
        { 
          systemPrompt: '你是专业的教学智能助手，熟悉教学设计、课程大纲、教学方法等，回答简洁专业',
          temperature: 0.6
        },
        (chunk) => {
          // 实时更新AI回复
          aiResponse += chunk;
          setMessages(prev => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1] = { 
              role: 'assistant', 
              content: aiResponse 
            };
            return newMessages;
          });
        }
      );
    } catch (error) {
      console.error('对话出错:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: '抱歉，生成回答时出错，请重试~' 
      }]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages]);

  // 处理清空对话
  const handleClear = () => {
    setMessages([
      { role: 'assistant', content: '您好，我是教学智能助手，可帮您解答教学相关问题，提供建议~' }
    ]);
  };

  // 渲染消息项
  const renderMessage = (item, index) => (
    <List.Item key={index} style={{ padding: '12px 0' }}>
      <div style={{ 
        maxWidth: '80%', 
        padding: '10px 16px', 
        borderRadius: '16px',
        backgroundColor: item.role === 'user' ? '#e6f7ff' : '#f5f5f5',
        alignSelf: item.role === 'user' ? 'flex-end' : 'flex-start'
      }}>
        <Text>
          <ReactMarkdown>{item.content}</ReactMarkdown>
        </Text>
      </div>
    </List.Item>
  );

  return (
    <Card 
      title={<Title level={4}>AI教学助手对话</Title>}
      styles={{ 
        body: { height: '600px', display: 'flex', flexDirection: 'column' } 
      }}
    >
      {/* 消息列表 */}
      <List
        dataSource={messages.filter(m => m.role !== 'system')} // 过滤系统消息（仅作初始提示）
        renderItem={renderMessage}
        style={{ 
          flex: 1, 
          overflowY: 'auto', 
          padding: '0 16px',
          marginBottom: 16
        }}
      />
      <div ref={messagesEndRef} />

      <Divider style={{ margin: '8px 0' }} />

      {/* 输入区域 */}
      <Space.Compact style={{ width: '100%' }}>
        <Input
          placeholder="输入您的问题（例如：如何设计翻转课堂的评价体系？）"
          value={input}
          onChange={e => setInput(e.target.value)}
          onPressEnter={handleSend}
          disabled={loading}
          style={{ flex: 1 }}
        />
        <Button 
          icon={<ClearOutlined />} 
          onClick={handleClear} 
          disabled={loading || messages.length <= 1}
        />
        <Button 
          type="primary" 
          icon={<SendOutlined />} 
          onClick={handleSend}
          loading={loading}
        />
      </Space.Compact>
    </Card>
  );
};

export default ChatInterface;