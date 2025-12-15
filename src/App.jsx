import React, { useState, useEffect } from 'react';
import { Layout, Menu, theme, Button, Dropdown, Space, Avatar } from 'antd';
import {
  HomeOutlined,
  BookOutlined,
  FileTextOutlined,
  MessageOutlined,
  BarChartOutlined,
  LogoutOutlined,
  UserOutlined,
} from '@ant-design/icons';

import MascotCharacter from './components/MascotCharacter';
import HomePage from './pages/HomePage';
import GenerateSyllabusPage from './pages/generateSyllabusPage';
import CourseComparisonPage from './pages/courseComparisonPage';
import GenerateLessonPage from './pages/generateLessonPage';
import LessonComparisonPage from './pages/lessonComparisonPage';

import SyllabusGenerator from './pages/SyllabusGenerator';
import ParticipativeLearning from './pages/ParticipativeLearning';
import LearningObjectives from './pages/LearningObjectives';
import StudentAssessment from './pages/StudentAssessment';
import IdeologicalEducation from './pages/IdeologicalEducation';
import CourseComparison from './pages/CourseComparison';
import ChatInterface from './pages/ChatInterface';
import GuidePagePage from './pages/GuidePagePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

import { authService } from './services/authService';
import './App.css';

const { Header, Content, Sider } = Layout;

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showRegister, setShowRegister] = useState(false);

  // 初始化：检查用户是否已登录
  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user) {
      setIsLoggedIn(true);
      setCurrentUser(user);
    }
  }, []);

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
      icon: <BookOutlined />,
      label: '整门课程',
      children:[
        {
          key:'generateSyllabus',
          label:'生成教学大纲',
        },
        {
          key:'courseComparison',
          label:'课程比较优化',
        }
      ]
    },
    {
      key: 'lesson',
      icon: <FileTextOutlined />,
      label: '单次课时',
      children: [
        {
          key: 'generateLesson',
          label: '生成教学设计',
        },
        {
          key:'lessonComparison',
          label:'教学设计比较优化',
        }
      ],
    },
    {
      key: 'chat',
      icon: <MessageOutlined />,
      label: 'AI教学助手',
    },
    {
      key: 'syllabus11',
      icon: <FileTextOutlined />,
      label: '快速生成教学大纲',
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

  // 处理登录
  const handleLoginSuccess = (username) => {
    const user = authService.getCurrentUser();
    setIsLoggedIn(true);
    setCurrentUser(user);
    setCurrentPage('home');
  };

  // 处理注册成功
  const handleRegisterSuccess = () => {
    setShowRegister(false);
  };

  // 处理登出
  const handleLogout = () => {
    authService.logout();
    setIsLoggedIn(false);
    setCurrentUser(null);
    setCurrentPage('home');
  };

  // 用户菜单项
  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: `用户: ${currentUser?.username}`,
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '登出',
      onClick: handleLogout,
    },
  ];

  // 如果未登录，显示登录或注册页面
  if (!isLoggedIn) {
    return showRegister ? (
      <RegisterPage 
        onRegisterSuccess={handleRegisterSuccess}
        onSwitchToLogin={() => setShowRegister(false)}
      />
    ) : (
      <LoginPage 
        onLoginSuccess={handleLoginSuccess}
        onSwitchToRegister={() => setShowRegister(true)}
      />
    );
  }

  // ------ 页面渲染映射（必须与 import 名字一致）------
  const renderContent = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={setCurrentPage} />;

      case 'generateSyllabus':
        return <GenerateSyllabusPage />;

      case 'courseComparison':
        return <CourseComparisonPage />;

      case 'generateLesson':
        return <GenerateLessonPage />;

      case 'lessonComparison':
        return <LessonComparisonPage />;

        
      case 'syllabus11':
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
      case 'chat':
        return <ChatInterface />;
      case 'guide':
        return <GuidePagePage />;

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
          justifyContent: 'space-between',
          background: '#001529',
          padding: '0 24px',
        }}
      >
        <div style={{ color: 'white', fontSize: '20px', fontWeight: 'bold' }}>
          📚 教学智能助手 Teaching AI Assistant
        </div>
        
        {/* 用户菜单 */}
        {isLoggedIn && currentUser && (
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <Button type="text" style={{ color: 'white' }}>
              <Space>
                <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />
                <span>{currentUser.username}</span>
              </Space>
            </Button>
          </Dropdown>
        )}
      </Header>

      <Layout>
        <Sider width={250} style={{ background: colorBgContainer, position: 'relative' }}>
          <Menu
            mode="inline"
            defaultSelectedKeys={['home']}
            style={{
              height: '100%',
              borderRight: 0,
              overflow: 'auto',
            }}
            items={menuItems}
            onClick={({ key }) => setCurrentPage(key)}
          />
        </Sider>

        <Layout style={{ padding: '24px' }}>
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
//-----------------------------------------------------------------
// import React, { useState } from 'react';
// import { Layout, Menu, theme } from 'antd';
// import {
//   HomeOutlined,
//   BookOutlined,
//   FileTextOutlined,
//   TeamOutlined,
//   HeartOutlined,
//   BarChartOutlined,
//   SettingOutlined,
//   MessageOutlined,
// } from '@ant-design/icons';
// import HomePage from './pages/HomePage';
// import SyllabusGenerator from './pages/SyllabusGenerator';
// import ParticipativeLearning from './pages/ParticipativeLearning';
// import LearningObjectives from './pages/LearningObjectives';
// import StudentAssessment from './pages/StudentAssessment';
// import IdeologicalEducation from './pages/IdeologicalEducation';
// import CourseComparison from './pages/CourseComparison';
// import ChatInterface from './pages/ChatInterface';
// import './App.css';

// const { Header, Content, Sider } = Layout;

// function App() {
//   const [currentPage, setCurrentPage] = useState('home');
//   const {
//     token: { colorBgContainer, borderRadiusLG },
//   } = theme.useToken();

//   const menuItems = [
//     {
//       key: 'home',
//       icon: <HomeOutlined />,
//       label: '首页',
//     },
//     {
//       key: 'syllabus',
//       icon: <FileTextOutlined />,
//       label: '课程大纲生成',
//     },
//     {
//       key: 'modules',
//       icon: <BookOutlined />,
//       label: '核心模块',
//       children: [
//         {
//           key: 'participative',
//           label: '参与式学习',
//         },
//         {
//           key: 'objectives',
//           label: '目标撰写',
//         },
//         {
//           key: 'assessment',
//           label: '学生评估',
//         },
//         {
//           key: 'ideology',
//           label: '课程思政',
//         },
//       ],
//     },
//     {
//       key: 'comparison',
//       icon: <BarChartOutlined />,
//       label: '课程比较优化',
//     },
//     {
//       key: 'chat',
//       icon: <MessageOutlined />,
//       label: 'AI教学助手',
//     },
//   ];

//   const renderContent = () => {
//     switch (currentPage) {
//       case 'home':
//         return <HomePage />;
//       case 'syllabus':
//         return <SyllabusGenerator />;
//       case 'participative':
//         return <ParticipativeLearning />;
//       case 'objectives':
//         return <LearningObjectives />;
//       case 'assessment':
//         return <StudentAssessment />;
//       case 'ideology':
//         return <IdeologicalEducation />;
//       case 'comparison':
//         return <CourseComparison />;
//       case 'chat':
//         return <ChatInterface />;
//       default:
//         return <HomePage />;
//     }
//   };

//   return (
//     <Layout style={{ minHeight: '100vh' }}>
//       <Header
//         style={{
//           display: 'flex',
//           alignItems: 'center',
//           background: '#001529',
//           padding: '0 24px',
//         }}
//       >
//         <div style={{ color: 'white', fontSize: '20px', fontWeight: 'bold' }}>
//           📚 教学智能助手 Teaching AI Assistant
//         </div>
//       </Header>
//       <Layout>
//         <Sider
//           width={250}
//           style={{
//             background: colorBgContainer,
//           }}
//         >
//           <Menu
//             mode="inline"
//             defaultSelectedKeys={['home']}
//             defaultOpenKeys={['modules']}
//             style={{
//               height: '100%',
//               borderRight: 0,
//             }}
//             items={menuItems}
//             onClick={({ key }) => setCurrentPage(key)}
//           />
//         </Sider>
//         <Layout
//           style={{
//             padding: '24px',
//           }}
//         >
//           <Content
//             style={{
//               padding: 24,
//               margin: 0,
//               minHeight: 280,
//               background: colorBgContainer,
//               borderRadius: borderRadiusLG,
//             }}
//           >
//             {renderContent()}
//           </Content>
//         </Layout>
//       </Layout>
//     </Layout>
//   );
// }