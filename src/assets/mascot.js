/**
 * 吉祥物配置系统
 * 管理教学助手的品牌吉祥物及其各种状态和动画
 */

// 吉祥物基础配置
export const mascot = {
  name: '蓝色教学精灵',
  src: '/images/mascot.png',
  alt: '教学智能助手吉祥物',
  description: '友好、活泼的教学助手品牌角色',
};

// 吉祥物的不同状态
export const mascotStates = {
  // 欢迎状态 - 首页展示
  welcome: {
    src: '/images/mascot-welcome.png',
    alt: '欢迎状态',
    position: 'right',
    animation: 'bounce',
    description: '热情欢迎用户',
  },
  
  // 思考状态 - 加载时显示
  thinking: {
    src: '/images/mascot-thinking.png',
    alt: '思考状态',
    position: 'center',
    animation: 'pulse',
    description: 'AI正在思考',
  },
  
  // 成功状态 - 生成完成时显示
  success: {
    src: '/images/mascot-success.png',
    alt: '成功状态',
    position: 'center',
    animation: 'celebrate',
    description: '生成成功，庆祝',
  },
  
  // 帮助状态 - 提示和引导
  help: {
    src: '/images/mascot-help.png',
    alt: '帮助状态',
    position: 'left',
    animation: 'wave',
    description: '提供帮助和引导',
  },
  
  // 错误状态 - 出现问题时显示
  error: {
    src: '/images/mascot-error.png',
    alt: '错误状态',
    position: 'center',
    animation: 'shake',
    description: '出现问题',
  },
};

// 吉祥物的对话气泡
export const mascotDialogues = {
  welcome: [
    '欢迎使用教学智能助手！',
    '我来帮您设计精彩的课程！',
    '让我们一起创造优质教学！',
  ],
  
  generating: [
    '正在为您生成教学设计...',
    '我在思考最好的教学方案...',
    '稍等，我在为您准备内容...',
  ],
  
  success: [
    '完成！您的教学设计已生成！',
    '太棒了！这个设计很不错！',
    '成功！现在您可以下载或编辑了！',
  ],
  
  help: [
    '需要帮助吗？点击这里了解更多！',
    '不确定如何填写？我来帮您！',
    '有任何问题，我都在这里！',
  ],
  
  error: [
    '哎呀，出现了一些问题...',
    '让我们重新试试吧！',
    '不用担心，我们可以解决这个问题！',
  ],
};

// 吉祥物的动画配置
export const mascotAnimations = {
  bounce: {
    keyframes: `
      @keyframes mascotBounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-20px); }
      }
    `,
    duration: '2s',
    iterationCount: 'infinite',
  },
  
  pulse: {
    keyframes: `
      @keyframes mascotPulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.7; }
      }
    `,
    duration: '1.5s',
    iterationCount: 'infinite',
  },
  
  celebrate: {
    keyframes: `
      @keyframes mascotCelebrate {
        0% { transform: scale(1) rotate(0deg); }
        25% { transform: scale(1.1) rotate(-5deg); }
        50% { transform: scale(1) rotate(5deg); }
        75% { transform: scale(1.1) rotate(-5deg); }
        100% { transform: scale(1) rotate(0deg); }
      }
    `,
    duration: '0.6s',
    iterationCount: 'infinite',
  },
  
  wave: {
    keyframes: `
      @keyframes mascotWave {
        0%, 100% { transform: rotate(0deg); }
        25% { transform: rotate(14deg); }
        75% { transform: rotate(-14deg); }
      }
    `,
    duration: '0.5s',
    iterationCount: 'infinite',
    transformOrigin: '70% 70%',
  },
  
  shake: {
    keyframes: `
      @keyframes mascotShake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-10px); }
        75% { transform: translateX(10px); }
      }
    `,
    duration: '0.5s',
    iterationCount: 'infinite',
  },
};

// 吉祥物的位置配置
export const mascotPositions = {
  topLeft: {
    top: '20px',
    left: '20px',
    width: '100px',
    height: '100px',
  },
  
  topRight: {
    top: '20px',
    right: '20px',
    width: '100px',
    height: '100px',
  },
  
  bottomLeft: {
    bottom: '20px',
    left: '20px',
    width: '120px',
    height: '120px',
  },
  
  bottomRight: {
    bottom: '20px',
    right: '20px',
    width: '120px',
    height: '120px',
  },
  
  center: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '150px',
    height: '150px',
  },
};

// 吉祥物的使用场景
export const mascotScenes = {
  // 首页场景
  homepage: {
    state: 'welcome',
    position: 'topRight',
    dialogue: 'welcome',
    visible: true,
    interactive: true,
  },
  
  // 生成页面场景
  generating: {
    state: 'thinking',
    position: 'center',
    dialogue: 'generating',
    visible: true,
    interactive: false,
  },
  
  // 生成完成场景
  success: {
    state: 'success',
    position: 'center',
    dialogue: 'success',
    visible: true,
    interactive: true,
  },
  
  // 错误场景
  error: {
    state: 'error',
    position: 'center',
    dialogue: 'error',
    visible: true,
    interactive: true,
  },
  
  // 帮助场景
  help: {
    state: 'help',
    position: 'bottomRight',
    dialogue: 'help',
    visible: true,
    interactive: true,
  },
};

// 吉祥物的交互事件
export const mascotInteractions = {
  // 点击吉祥物时的反应
  onClick: {
    responses: [
      '你好！有什么我可以帮助的吗？',
      '点击我可以获取帮助！',
      '我很高兴见到你！',
      '让我们一起创造优质教学！',
    ],
    animation: 'wave',
  },
  
  // 悬停时的反应
  onHover: {
    animation: 'bounce',
    showTooltip: true,
  },
  
  // 页面加载时的反应
  onPageLoad: {
    animation: 'bounce',
    dialogue: 'welcome',
    duration: 3000, // 显示3秒
  },
};

export default {
  mascot,
  mascotStates,
  mascotDialogues,
  mascotAnimations,
  mascotPositions,
  mascotScenes,
  mascotInteractions,
};
