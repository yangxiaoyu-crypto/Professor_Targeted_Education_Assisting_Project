/**
 * 吉祥物角色组件
 * 可在各个页面显示教学助手的品牌吉祥物
 */

import React, { useState, useEffect } from 'react';
import { Tooltip } from 'antd';
import { mascot, mascotStates, mascotAnimations, mascotPositions, mascotDialogues } from '../assets/mascot';

const MascotCharacter = ({
  state = 'welcome',
  position = 'topRight',
  showDialogue = true,
  interactive = true,
  size = 'normal',
  onClick = null,
  style = {},
  removeBackground = false,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [currentDialogue, setCurrentDialogue] = useState('');
  const [showBubble, setShowBubble] = useState(showDialogue);

  // 获取当前状态的配置
  const currentState = mascotStates[state] || mascotStates.welcome;
  const positionStyle = mascotPositions[position] || mascotPositions.topRight;
  const animationConfig = mascotAnimations[currentState.animation] || {};
  const dialogueList = mascotDialogues[state] || mascotDialogues.welcome;

  // 初始化对话
  useEffect(() => {
    if (dialogueList && dialogueList.length > 0) {
      const randomDialogue = dialogueList[Math.floor(Math.random() * dialogueList.length)];
      setCurrentDialogue(randomDialogue);
    }
  }, [state, dialogueList]);

  // 处理点击事件
  const handleClick = () => {
    if (interactive) {
      // 显示随机对话
      if (dialogueList && dialogueList.length > 0) {
        const randomDialogue = dialogueList[Math.floor(Math.random() * dialogueList.length)];
        setCurrentDialogue(randomDialogue);
        setShowBubble(true);
        
        // 3秒后隐藏对话气泡
        setTimeout(() => setShowBubble(false), 3000);
      }
      
      // 调用外部点击处理函数
      if (onClick) {
        onClick();
      }
    }
  };

  // 确定吉祥物的大小
  const sizeMap = {
    small: { width: '60px', height: '60px' },
    normal: { width: '100px', height: '100px' },
    large: { width: '150px', height: '150px' },
  };

  const mascotSize = sizeMap[size] || sizeMap.normal;

  // 构建样式
  const mascotStyle = {
    position: 'relative',
    display: 'inline-block',
    cursor: interactive ? 'pointer' : 'default',
    ...mascotSize,
    ...positionStyle,
    ...style,
  };

  // 构建动画样式
  const animationStyle = animationConfig.keyframes ? {
    animation: `${currentState.animation} ${animationConfig.duration || '2s'} ${animationConfig.iterationCount || 'infinite'}`,
  } : {};

  return (
    <div style={mascotStyle}>
      {/* 动画样式注入 */}
      {animationConfig.keyframes && (
        <style>{animationConfig.keyframes}</style>
      )}

      {/* 吉祥物图片 */}
      <Tooltip 
        title={interactive ? '点击我获取帮助！' : ''}
        placement="top"
      >
        <img
          src={currentState.src}
          alt={currentState.alt}
          onClick={handleClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            filter: isHovered && interactive ? 'drop-shadow(0 4px 12px rgba(0,0,0,0.15))' : 'drop-shadow(0 2px 8px rgba(0,0,0,0.1))',
            transition: 'filter 0.3s ease',
            backgroundColor: removeBackground ? 'transparent' : 'inherit',
            ...animationStyle,
          }}
        />
      </Tooltip>

      {/* 对话气泡 */}
      {showBubble && currentDialogue && (
        <div
          style={{
            position: 'absolute',
            bottom: '110%',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'white',
            border: '2px solid #667eea',
            borderRadius: '12px',
            padding: '12px 16px',
            whiteSpace: 'nowrap',
            fontSize: '14px',
            fontWeight: '500',
            color: '#333',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 1000,
            animation: 'fadeInUp 0.3s ease',
          }}
        >
          {currentDialogue}
          {/* 气泡尖角 */}
          <div
            style={{
              position: 'absolute',
              bottom: '-8px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: '8px solid transparent',
              borderRight: '8px solid transparent',
              borderTop: '8px solid white',
            }}
          />
        </div>
      )}

      {/* 淡入淡出动画 */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default MascotCharacter;
