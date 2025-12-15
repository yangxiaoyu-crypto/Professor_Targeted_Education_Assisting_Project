import React, { useState, useEffect } from 'react';
import {
  Drawer,
  List,
  Button,
  Tag,
  Popconfirm,
  Empty,
  Input,
  Select,
  Space,
  Typography,
  message,
  Tooltip,
} from 'antd';
import {
  DeleteOutlined,
  HistoryOutlined,
  SearchOutlined,
  ClearOutlined,
} from '@ant-design/icons';
import { storage } from '../utils/storage';

const { Text } = Typography;
const { Search } = Input;

/**
 * 历史记录抽屉组件
 * @param {boolean} visible - 是否显示
 * @param {function} onClose - 关闭回调
 * @param {string} type - 可选，筛选特定类型的历史记录
 * @param {function} onLoad - 加载历史记录的回调函数
 */
const HistoryDrawer = ({ visible, onClose, type = null, onLoad }) => {
  const [history, setHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState(type);
  const [loading, setLoading] = useState(false);

  // 类型颜色映射
  const typeColors = {
    syllabus: 'blue',
    participative: 'green',
    objectives: 'orange',
    assessment: 'purple',
    ideological: 'red',
    comparison: 'cyan',
  };

  // 类型名称映射
  const typeNames = {
    syllabus: '课程大纲',
    participative: '参与式学习',
    objectives: '学习目标',
    assessment: '学生评估',
    ideological: '课程思政',
    comparison: '方案对比',
  };

  // 加载历史记录
  const loadHistory = () => {
    setLoading(true);
    try {
      const data = storage.getHistory(filterType);
      setHistory(data);
      setFilteredHistory(data);
    } catch (error) {
      message.error('加载历史记录失败');
    } finally {
      setLoading(false);
    }
  };

  // 当抽屉打开或筛选条件改变时，重新加载
  useEffect(() => {
    if (visible) {
      loadHistory();
    }
  }, [visible, filterType]);

  // 搜索功能
  const handleSearch = (value) => {
    setSearchText(value);
    if (!value.trim()) {
      setFilteredHistory(history);
      return;
    }

    const filtered = history.filter(item =>
      item.title.toLowerCase().includes(value.toLowerCase()) ||
      item.content.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredHistory(filtered);
  };

  // 删除单条记录
  const handleDelete = (id) => {
    const success = storage.deleteHistory(id);
    if (success) {
      message.success('删除成功');
      loadHistory();
    } else {
      message.error('删除失败');
    }
  };

  // 清空所有记录
  const handleClearAll = () => {
    const success = storage.clearHistory();
    if (success) {
      message.success('已清空所有历史记录');
      loadHistory();
    } else {
      message.error('清空失败');
    }
  };

  // 加载历史记录到表单
  const handleLoad = (item) => {
    if (onLoad) {
      onLoad(item);
      message.success('已加载历史记录');
      onClose();
    }
  };

  // 导出数据
  const handleExport = () => {
    const data = storage.exportData();
    if (data) {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `教学助手备份_${new Date().toLocaleDateString()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      message.success('导出成功');
    } else {
      message.error('导出失败');
    }
  };

  return (
    <Drawer
      title={
        <Space>
          <HistoryOutlined />
          <span>历史记录</span>
          {filteredHistory.length > 0 && (
            <Tag color="blue">{filteredHistory.length} 条</Tag>
          )}
        </Space>
      }
      placement="right"
      width={600}
      onClose={onClose}
      open={visible}
      extra={
        <Space>
          <Button size="small" onClick={handleExport}>
            导出备份
          </Button>
          <Popconfirm
            title="确定清空所有历史记录吗？此操作不可恢复"
            onConfirm={handleClearAll}
            okText="确定"
            cancelText="取消"
          >
            <Button danger size="small" icon={<ClearOutlined />}>
              清空全部
            </Button>
          </Popconfirm>
        </Space>
      }
    >
      {/* 搜索和筛选 */}
      <Space direction="vertical" style={{ width: '100%', marginBottom: 16 }}>
        <Search
          placeholder="搜索标题或内容"
          value={searchText}
          onChange={(e) => handleSearch(e.target.value)}
          onSearch={handleSearch}
          prefix={<SearchOutlined />}
          allowClear
        />
        
        {!type && (
          <Select
            style={{ width: '100%' }}
            placeholder="筛选类型（全部）"
            allowClear
            value={filterType}
            onChange={setFilterType}
          >
            {Object.keys(typeNames).map(key => (
              <Select.Option key={key} value={key}>
                <Tag color={typeColors[key]}>{typeNames[key]}</Tag>
              </Select.Option>
            ))}
          </Select>
        )}
      </Space>

      {/* 历史记录列表 */}
      {filteredHistory.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={searchText ? '没有找到匹配的记录' : '暂无历史记录'}
        />
      ) : (
        <List
          loading={loading}
          dataSource={filteredHistory}
          renderItem={item => (
            <List.Item
              actions={[
                <Tooltip title="加载到表单">
                  <Button
                    type="link"
                    size="small"
                    onClick={() => handleLoad(item)}
                  >
                    加载
                  </Button>
                </Tooltip>,
                <Popconfirm
                  title="确定删除这条记录吗？"
                  onConfirm={() => handleDelete(item.id)}
                  okText="确定"
                  cancelText="取消"
                >
                  <Tooltip title="删除">
                    <Button
                      type="link"
                      danger
                      size="small"
                      icon={<DeleteOutlined />}
                    />
                  </Tooltip>
                </Popconfirm>,
              ]}
            >
              <List.Item.Meta
                title={
                  <Space>
                    <Text strong>{item.title}</Text>
                    <Tag color={typeColors[item.type]}>
                      {typeNames[item.type]}
                    </Tag>
                  </Space>
                }
                description={
                  <div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {item.createdAt}
                    </Text>
                    <div
                      style={{
                        marginTop: 8,
                        maxHeight: 60,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        fontSize: 13,
                        color: '#666',
                      }}
                    >
                      {item.content?.substring(0, 150)}
                      {item.content?.length > 150 && '...'}
                    </div>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      )}
    </Drawer>
  );
};

export default HistoryDrawer;

