/**
 * api.js - 北斗教育統一 API 模組
 * v2.0 - 整合 P1 新 API
 */

const BeidouAPI = (function() {
  // API 基礎設定
  const CONFIG = {
    BASE_URL: 'https://beidou-edu-server-1.onrender.com/api',
    TIMEOUT: 10000,
    RETRY: 2
  };

  // Token 管理
  function getToken() {
    return localStorage.getItem('beidou_token');
  }

  function getUserId() {
    const user = JSON.parse(localStorage.getItem('beidou_user') || '{}');
    return user.id || user._id || 'guest';
  }

  // 通用請求
  async function request(endpoint, options = {}) {
    const url = `${CONFIG.BASE_URL}${endpoint}`;
    const token = getToken();
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers
      },
      ...options
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }
      
      return data;
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  // ============================================================
  // 用戶 API
  // ============================================================
  const user = {
    login: (email, password) => request('/user/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    }),
    
    register: (data) => request('/user/register', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    
    profile: () => request('/user/profile'),
    
    stats: (days = 7) => request(`/user/stats?days=${days}`)
  };

  // ============================================================
  // 進度 API (P1 新增)
  // ============================================================
  const progress = {
    get: (userId) => request(`/progress/${userId || getUserId()}`),
    
    summary: (userId) => request(`/progress/summary/${userId || getUserId()}`),
    
    bySubject: (subjectId, userId) => 
      request(`/progress/subject/${userId || getUserId()}/${subjectId}`),
    
    update: (nodeId, data) => request('/progress/update', {
      method: 'POST',
      body: JSON.stringify({
        userId: getUserId(),
        nodeId,
        ...data
      })
    })
  };

  // ============================================================
  // 答題 API (P1 新增)
  // ============================================================
  const answers = {
    submit: (data) => request('/answers/submit', {
      method: 'POST',
      body: JSON.stringify({
        userId: getUserId(),
        ...data
      })
    }),
    
    history: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/answers/history/${getUserId()}?${query}`);
    },
    
    stats: (userId) => request(`/answers/stats/${userId || getUserId()}`),
    
    wrong: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/answers/wrong/${getUserId()}?${query}`);
    }
  };

  // ============================================================
  // 統計 API (P1 新增)
  // ============================================================
  const analytics = {
    dashboard: (userId) => request(`/analytics/dashboard/${userId || getUserId()}`),
    
    trends: (userId, days = 30) => 
      request(`/analytics/trends/${userId || getUserId()}?days=${days}`),
    
    weakness: (userId) => request(`/analytics/weakness/${userId || getUserId()}`),
    
    leaderboard: (type = 'mastery', limit = 20) => 
      request(`/analytics/leaderboard?type=${type}&limit=${limit}`)
  };

  // ============================================================
  // 題庫 API
  // ============================================================
  const quiz = {
    // 學測題目 (主要使用)
    getQuestions: (params) => {
      const query = new URLSearchParams(params).toString();
      return request(`/quiz/gsat/questions?${query}`);
    },
    
    // 舊版兼容
    getQuestionsLegacy: (params) => {
      const query = new URLSearchParams(params).toString();
      return request(`/quiz/questions?${query}`);
    },
    
    getByNode: (nodeId, count = 10) => 
      request(`/quiz/node/${nodeId}?count=${count}`),
    
    getSubjects: () => request('/quiz/subjects'),
    
    getChapters: (subject) => request(`/quiz/chapters/${subject}`)
  };

  // ============================================================
  // XTF 知識節點 API
  // ============================================================
  const xtf = {
    // 節點列表 (星圖用)
    list: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/xtf/list?${query}`);
    },
    
    // 節點詳情 (字卡用)
    node: (nodeId) => request(`/xtf/v2/node/${nodeId}`),
    
    // 隨機節點 (字卡用)
    random: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/xtf/v2/random?${query}`);
    }
  };

  // ============================================================
  // 認證 API
  // ============================================================
  const cert = {
    list: () => request('/cert/exams'),
    
    questions: (certId, limit = 20) => 
      request(`/cert/${certId}/questions?limit=${limit}`),
    
    submit: (certId, answers) => request(`/cert/${certId}/submit`, {
      method: 'POST',
      body: JSON.stringify({ answers })
    })
  };

  // ============================================================
  // 成就 API
  // ============================================================
  const achievements = {
    mine: () => request('/achievements/mine'),
    all: () => request('/achievements/all')
  };

  // ============================================================
  // 金流 API
  // ============================================================
  const payment = {
    create: (plan, email) => request('/payment/create', {
      method: 'POST',
      body: JSON.stringify({ plan, email })
    }),
    
    status: (orderId) => request(`/payment/status/${orderId}`)
  };

  // 公開介面
  return {
    CONFIG,
    request,
    user,
    progress,
    answers,
    analytics,
    quiz,
    xtf,
    cert,
    achievements,
    payment,
    getToken,
    getUserId
  };
})();

// 全域匯出
window.BeidouAPI = BeidouAPI;

// ============================================================
// XTF v2 統一知識節點 API (2025-12-24 新增)
// ============================================================

BeidouAPI.xtfV2 = {
  /**
   * 取得節點列表 (星圖用)
   * @param {Object} params - {type: 'gsat'|'ai'|'all', subject: '數學', limit: 100}
   */
  list: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return BeidouAPI.request(`/xtf/v2/list?${query}`);
  },

  /**
   * 取得單一節點詳情 (字卡用)
   * @param {string} nodeId - 節點ID
   */
  node: (nodeId) => BeidouAPI.request(`/xtf/v2/node/${nodeId}`),

  /**
   * 隨機取得節點 (字卡複習用)
   * @param {Object} params - {type, subject, cert, count}
   */
  random: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return BeidouAPI.request(`/xtf/v2/random?${query}`);
  },

  /**
   * 搜尋節點
   * @param {string} q - 搜尋關鍵字
   */
  search: (q, limit = 20) => 
    BeidouAPI.request(`/xtf/v2/search?q=${encodeURIComponent(q)}&limit=${limit}`),

  /**
   * 取得科目/認證列表
   */
  subjects: () => BeidouAPI.request('/xtf/v2/subjects'),

  /**
   * 取得統計資訊
   */
  stats: () => BeidouAPI.request('/xtf/v2/stats')
};

console.log('🌟 BeidouAPI.xtfV2 已載入');

// ============================================================
// 智能學習引擎 API (2025-12-24 新增)
// ============================================================

BeidouAPI.learn = {
  /**
   * 提交答題記錄
   * @param {Object} data - {user_id, question_id, node_id, subject, is_correct, time_spent}
   */
  submitAnswer: (data) => BeidouAPI.request('/learn/answer', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  /**
   * 取得弱點診斷報告
   * @param {string} userId
   * @param {Object} params - {days, subject}
   */
  diagnosis: (userId, params = {}) => {
    const query = new URLSearchParams(params).toString();
    return BeidouAPI.request(`/learn/diagnosis/${userId}?${query}`);
  },

  /**
   * 取得推薦學習路徑
   * @param {string} userId
   * @param {Object} params - {subject, limit}
   */
  path: (userId, params = {}) => {
    const query = new URLSearchParams(params).toString();
    return BeidouAPI.request(`/learn/path/${userId}?${query}`);
  },

  /**
   * 取得待複習項目 (艾賓浩斯)
   * @param {string} userId
   * @param {Object} params - {subject, limit}
   */
  review: (userId, params = {}) => {
    const query = new URLSearchParams(params).toString();
    return BeidouAPI.request(`/learn/review/${userId}?${query}`);
  },

  /**
   * 完成複習
   * @param {Object} data - {user_id, node_id, quality: 1-5}
   */
  completeReview: (data) => BeidouAPI.request('/learn/review/complete', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  /**
   * 取得學習統計
   * @param {string} userId
   * @param {number} days - 統計天數
   */
  stats: (userId, days = 7) => 
    BeidouAPI.request(`/learn/stats/${userId}?days=${days}`),

  /**
   * 取得遺忘預測
   * @param {string} userId
   * @param {number} days - 預測天數
   */
  predict: (userId, days = 7) => 
    BeidouAPI.request(`/learn/predict/${userId}?days=${days}`)
};

console.log('🧠 BeidouAPI.learn 智能學習引擎已載入');

// v2.0 新增：批量答題
BeidouAPI.learn.submitBatch = (data) => BeidouAPI.request('/learn/answer/batch', {
  method: 'POST',
  body: JSON.stringify(data)
});

// v2.0 新增：視覺化數據
BeidouAPI.learn.visual = (userId, days = 30) => 
  BeidouAPI.request(`/learn/diagnosis/${userId}/visual?days=${days}`);

console.log('🧠 BeidouAPI.learn v2.0 已更新');
