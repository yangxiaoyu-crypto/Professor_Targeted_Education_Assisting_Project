import React, { useState } from 'react';
import { Layout, Menu, theme } from 'antd';
import {
  HomeOutlined,
  BookOutlined,
  FileTextOutlined,
  TeamOutlined,
  HeartOutlined,
  BarChartOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import HomePage from './pages/HomePage';
import SyllabusGenerator from './pages/SyllabusGenerator';
import ParticipativeLearning from './pages/ParticipativeLearning';
import LearningObjectives from './pages/LearningObjectives';
import StudentAssessment from './pages/StudentAssessment';
import IdeologicalEducation from './pages/IdeologicalEducation';
import CourseComparison from './pages/CourseComparison';
import './App.css';

const { Header, Content, Sider } = Layout;

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const menuItems = [
    {
      key: 'home',
      icon: <HomeOutlined />,
      label: '首页',
    },
    {
      key: 'syllabus',
      icon: <FileTextOutlined />,
      label: '课程大纲生成',
    },
    {
      key: 'modules',
      icon: <BookOutlined />,
      label: '核心模块',
      children: [
        {
          key: 'participative',
          label: '参与式学习',
        },
        {
          key: 'objectives',
          label: '目标撰写',
        },
        {
          key: 'assessment',
          label: '学生评估',
        },
        {
          key: 'ideology',
          label: '课程思政',
        },
      ],
    },
    {
      key: 'comparison',
      icon: <BarChartOutlined />,
      label: '课程比较优化',
    },
  ];

  const renderContent = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage />;
      case 'syllabus':
        return <SyllabusGenerator />;
      case 'participative':
        return <ParticipativeLearning />;
      case 'objectives':
        return <LearningObjectives />;
      case 'assessment':
        return <StudentAssessment />;
      case 'ideology':
        return <IdeologicalEducation />;
      case 'comparison':
        return <CourseComparison />;
      default:
        return <HomePage />;
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header
        style={{
          display: 'flex',
          alignItems: 'center',
          background: '#001529',
          padding: '0 24px',
        }}
      >
        <div style={{ color: 'white', fontSize: '20px', fontWeight: 'bold' }}>
          📚 教学智能助手 Teaching AI Assistant
        </div>
      </Header>
      <Layout>
        <Sider
          width={250}
          style={{
            background: colorBgContainer,
          }}
        >
          <Menu
            mode="inline"
            defaultSelectedKeys={['home']}
            defaultOpenKeys={['modules']}
            style={{
              height: '100%',
              borderRight: 0,
            }}
            items={menuItems}
            onClick={({ key }) => setCurrentPage(key)}
          />
        </Sider>
        <Layout
          style={{
            padding: '24px',
          }}
        >
          <Content
            style={{
              padding: 24,
              margin: 0,
              minHeight: 280,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            {renderContent()}
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
}

export default App;

