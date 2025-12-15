/**
 * 本地存储工具
 * 使用 localStorage 实现数据持久化
 */

const STORAGE_KEYS = {
  HISTORY: 'teachingAssistant_history',
  SETTINGS: 'teachingAssistant_settings',
  DRAFTS: 'teachingAssistant_drafts',
};

export const storage = {
  /**
   * 保存生成历史
   * @param {string} type - 类型：syllabus, participative, objectives, assessment, ideological, comparison
   * @param {object} data - 数据对象 { title, content, formData }
   * @returns {string|null} 返回记录ID，失败返回null
   */
  saveHistory(type, data) {
    try {
      const history = this.getHistory();
      const newItem = {
        id: Date.now().toString(),
        type,
        title: data.title || data.courseName || '未命名',
        content: data.content || '',
        formData: data.formData || {},
        timestamp: new Date().toISOString(),
        createdAt: new Date().toLocaleString('zh-CN'),
      };
      
      // 最新的放在前面
      history.unshift(newItem);
      
      // 限制最多保存100条
      if (history.length > 100) {
        history.pop();
      }
      
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
      
      return newItem.id;
    } catch (error) {
      console.error('保存历史记录失败:', error);
      return null;
    }
  },

  /**
   * 获取历史记录
   * @param {string|null} type - 可选，筛选类型
   * @returns {Array} 历史记录数组
   */
  getHistory(type = null) {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.HISTORY);
      const history = data ? JSON.parse(data) : [];
      
      if (type) {
        return history.filter(item => item.type === type);
      }
      
      return history;
    } catch (error) {
      console.error('读取历史记录失败:', error);
      return [];
    }
  },

  /**
   * 根据ID获取单条历史记录
   * @param {string} id - 记录ID
   * @returns {object|null}
   */
  getHistoryById(id) {
    try {
      const history = this.getHistory();
      return history.find(item => item.id === id) || null;
    } catch (error) {
      console.error('读取历史记录失败:', error);
      return null;
    }
  },

  /**
   * 删除历史记录
   * @param {string} id - 记录ID
   * @returns {boolean} 成功返回true
   */
  deleteHistory(id) {
    try {
      const history = this.getHistory();
      const newHistory = history.filter(item => item.id !== id);
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(newHistory));
      return true;
    } catch (error) {
      console.error('删除历史记录失败:', error);
      return false;
    }
  },

  /**
   * 清空所有历史记录
   * @returns {boolean}
   */
  clearHistory() {
    try {
      localStorage.removeItem(STORAGE_KEYS.HISTORY);
      return true;
    } catch (error) {
      console.error('清空历史记录失败:', error);
      return false;
    }
  },

  /**
   * 保存草稿
   * @param {string} type - 类型
   * @param {object} data - 表单数据
   * @returns {boolean}
   */
  saveDraft(type, data) {
    try {
      const drafts = this.getDrafts();
      drafts[type] = {
        data,
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEYS.DRAFTS, JSON.stringify(drafts));
      return true;
    } catch (error) {
      console.error('保存草稿失败:', error);
      return false;
    }
  },

  /**
   * 获取草稿
   * @param {string} type - 类型
   * @returns {object|null}
   */
  getDraft(type) {
    try {
      const drafts = this.getDrafts();
      return drafts[type]?.data || null;
    } catch (error) {
      console.error('读取草稿失败:', error);
      return null;
    }
  },

  /**
   * 获取所有草稿
   * @returns {object}
   */
  getDrafts() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DRAFTS);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('读取草稿失败:', error);
      return {};
    }
  },

  /**
   * 删除草稿
   * @param {string} type - 类型
   * @returns {boolean}
   */
  deleteDraft(type) {
    try {
      const drafts = this.getDrafts();
      delete drafts[type];
      localStorage.setItem(STORAGE_KEYS.DRAFTS, JSON.stringify(drafts));
      return true;
    } catch (error) {
      console.error('删除草稿失败:', error);
      return false;
    }
  },

  /**
   * 保存用户设置
   * @param {object} settings - 设置对象
   * @returns {boolean}
   */
  saveSettings(settings) {
    try {
      const currentSettings = this.getSettings();
      const newSettings = { ...currentSettings, ...settings };
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(newSettings));
      return true;
    } catch (error) {
      console.error('保存设置失败:', error);
      return false;
    }
  },

  /**
   * 获取用户设置
   * @returns {object}
   */
  getSettings() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? JSON.parse(data) : {
        theme: 'light',
        fontSize: 14,
        autoSave: true,
      };
    } catch (error) {
      console.error('读取设置失败:', error);
      return {
        theme: 'light',
        fontSize: 14,
        autoSave: true,
      };
    }
  },

  /**
   * 导出所有数据（备份）
   * @returns {object|null}
   */
  exportData() {
    try {
      return {
        history: this.getHistory(),
        drafts: this.getDrafts(),
        settings: this.getSettings(),
        exportTime: new Date().toISOString(),
        version: '1.0',
      };
    } catch (error) {
      console.error('导出数据失败:', error);
      return null;
    }
  },

  /**
   * 导入数据（恢复）
   * @param {object} data - 导入的数据
   * @returns {boolean}
   */
  importData(data) {
    try {
      if (!data || typeof data !== 'object') {
        throw new Error('无效的导入数据');
      }

      if (data.history && Array.isArray(data.history)) {
        localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(data.history));
      }
      
      if (data.drafts && typeof data.drafts === 'object') {
        localStorage.setItem(STORAGE_KEYS.DRAFTS, JSON.stringify(data.drafts));
      }
      
      if (data.settings && typeof data.settings === 'object') {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data.settings));
      }
      
      return true;
    } catch (error) {
      console.error('导入数据失败:', error);
      return false;
    }
  },

  /**
   * 获取存储统计信息
   * @returns {object}
   */
  getStats() {
    try {
      const history = this.getHistory();
      const typeCounts = {};
      
      history.forEach(item => {
        typeCounts[item.type] = (typeCounts[item.type] || 0) + 1;
      });

      return {
        totalCount: history.length,
        typeCounts,
        oldestRecord: history.length > 0 ? history[history.length - 1].createdAt : null,
        newestRecord: history.length > 0 ? history[0].createdAt : null,
      };
    } catch (error) {
      console.error('获取统计信息失败:', error);
      return {
        totalCount: 0,
        typeCounts: {},
        oldestRecord: null,
        newestRecord: null,
      };
    }
  },
};

export default storage;

