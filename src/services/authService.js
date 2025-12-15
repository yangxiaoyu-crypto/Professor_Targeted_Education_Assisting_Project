/**
 * 认证服务
 * 管理用户登录、注册、登出等认证相关功能
 */

// 初始化演示账户
const initializeDemoUser = () => {
  const usersData = localStorage.getItem('users');
  if (!usersData) {
    const demoUsers = [
      {
        username: 'demo',
        password: '123456',
        email: 'demo@example.com',
        registerTime: new Date().toISOString(),
      },
      {
        username: 'teacher',
        password: '123456',
        email: 'teacher@example.com',
        registerTime: new Date().toISOString(),
      },
    ];
    localStorage.setItem('users', JSON.stringify(demoUsers));
  }
};

// 初始化
initializeDemoUser();

/**
 * 认证服务对象
 */
export const authService = {
  /**
   * 检查用户是否已登录
   * @returns {boolean} 是否已登录
   */
  isLoggedIn: () => {
    const currentUser = localStorage.getItem('currentUser');
    return !!currentUser;
  },

  /**
   * 获取当前登录用户信息
   * @returns {Object|null} 用户信息或null
   */
  getCurrentUser: () => {
    const currentUser = localStorage.getItem('currentUser');
    return currentUser ? JSON.parse(currentUser) : null;
  },

  /**
   * 用户登录
   * @param {string} username - 用户名
   * @param {string} password - 密码
   * @returns {Object} 登录结果 {success: boolean, message: string, user: Object}
   */
  login: (username, password) => {
    try {
      const usersData = localStorage.getItem('users');
      const users = usersData ? JSON.parse(usersData) : [];

      const user = users.find(
        (u) => u.username === username && u.password === password
      );

      if (user) {
        const currentUser = {
          username: user.username,
          email: user.email,
          loginTime: new Date().toISOString(),
        };
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        return {
          success: true,
          message: '登录成功',
          user: currentUser,
        };
      } else {
        return {
          success: false,
          message: '用户名或密码错误',
          user: null,
        };
      }
    } catch (error) {
      return {
        success: false,
        message: '登录失败：' + error.message,
        user: null,
      };
    }
  },

  /**
   * 用户注册
   * @param {string} username - 用户名
   * @param {string} email - 邮箱
   * @param {string} password - 密码
   * @returns {Object} 注册结果 {success: boolean, message: string}
   */
  register: (username, email, password) => {
    try {
      const usersData = localStorage.getItem('users');
      const users = usersData ? JSON.parse(usersData) : [];

      // 检查用户名是否已存在
      if (users.some((u) => u.username === username)) {
        return {
          success: false,
          message: '用户名已存在',
        };
      }

      // 检查邮箱是否已存在
      if (users.some((u) => u.email === email)) {
        return {
          success: false,
          message: '邮箱已被注册',
        };
      }

      // 添加新用户
      const newUser = {
        username,
        email,
        password,
        registerTime: new Date().toISOString(),
      };

      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));

      return {
        success: true,
        message: '注册成功',
      };
    } catch (error) {
      return {
        success: false,
        message: '注册失败：' + error.message,
      };
    }
  },

  /**
   * 用户登出
   */
  logout: () => {
    localStorage.removeItem('currentUser');
  },

  /**
   * 修改密码
   * @param {string} username - 用户名
   * @param {string} oldPassword - 旧密码
   * @param {string} newPassword - 新密码
   * @returns {Object} 修改结果 {success: boolean, message: string}
   */
  changePassword: (username, oldPassword, newPassword) => {
    try {
      const usersData = localStorage.getItem('users');
      const users = usersData ? JSON.parse(usersData) : [];

      const userIndex = users.findIndex(
        (u) => u.username === username && u.password === oldPassword
      );

      if (userIndex === -1) {
        return {
          success: false,
          message: '原密码错误',
        };
      }

      users[userIndex].password = newPassword;
      localStorage.setItem('users', JSON.stringify(users));

      return {
        success: true,
        message: '密码修改成功',
      };
    } catch (error) {
      return {
        success: false,
        message: '密码修改失败：' + error.message,
      };
    }
  },

  /**
   * 获取所有用户（仅用于开发调试）
   * @returns {Array} 用户列表
   */
  getAllUsers: () => {
    const usersData = localStorage.getItem('users');
    return usersData ? JSON.parse(usersData) : [];
  },
};

export default authService;
