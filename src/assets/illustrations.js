/**
 * 插画资源配置
 * 存储项目中使用的所有插画和装饰图片
 */

// Hero Banner 插画 - 温暖、友好的学习氛围
export const heroIllustration = {
  src: '/images/hero-illustration.png',
  alt: '教学智能助手欢迎插画',
  description: '温暖、友好的学习氛围插画',
};

// 加载动画插画
export const loadingIllustration = {
  svg: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cstyle%3E@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } } .spinner { animation: spin 2s linear infinite; transform-origin: 50%25 50%25; }%3C/style%3E%3Ccircle class='spinner' cx='50' cy='50' r='40' fill='none' stroke='%23667eea' stroke-width='4' stroke-dasharray='60 100'/%3E%3C/svg%3E`,
  alt: '加载中',
  description: '加载动画',
};

// 空状态插画
export const emptyStateIllustration = {
  svg: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Ccircle cx='100' cy='80' r='30' fill='%23E8E8E8'/%3E%3Crect x='70' y='120' width='60' height='50' fill='%23E8E8E8' rx='5'/%3E%3Crect x='75' y='130' width='50' height='8' fill='%23F5F5F5' rx='2'/%3E%3Crect x='75' y='145' width='50' height='8' fill='%23F5F5F5' rx='2'/%3E%3C/svg%3E`,
  alt: '暂无内容',
  description: '空状态提示插画',
};

// 成功状态插画
export const successIllustration = {
  svg: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='45' fill='%2352c41a'/%3E%3Cpath d='M 35 50 L 45 60 L 65 40' stroke='white' stroke-width='4' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E`,
  alt: '成功',
  description: '成功状态插画',
};

// 错误状态插画
export const errorIllustration = {
  svg: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='45' fill='%23ff4d4f'/%3E%3Cline x1='35' y1='35' x2='65' y2='65' stroke='white' stroke-width='4' stroke-linecap='round'/%3E%3Cline x1='65' y1='35' x2='35' y2='65' stroke='white' stroke-width='4' stroke-linecap='round'/%3E%3C/svg%3E`,
  alt: '错误',
  description: '错误状态插画',
};

// 背景装饰
export const backgroundDecorations = {
  // 渐变背景
  gradientBg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  
  // 浮动云朵装饰
  cloudPattern: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400'%3E%3Ccircle cx='100' cy='100' r='40' fill='rgba(255,255,255,0.1)'/%3E%3Ccircle cx='300' cy='150' r='50' fill='rgba(255,255,255,0.08)'/%3E%3Ccircle cx='150' cy='300' r='35' fill='rgba(255,255,255,0.12)'/%3E%3C/svg%3E")`,
  
  // 网格背景
  gridPattern: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20'%3E%3Crect width='20' height='20' fill='%23f0f0f0'/%3E%3Cpath d='M 20 0 L 0 20 M 0 0 L 20 20' stroke='%23e0e0e0' stroke-width='0.5'/%3E%3C/svg%3E")`,
};

export default {
  heroIllustration,
  loadingIllustration,
  emptyStateIllustration,
  successIllustration,
  errorIllustration,
  backgroundDecorations,
};
