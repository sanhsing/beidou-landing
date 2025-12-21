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
