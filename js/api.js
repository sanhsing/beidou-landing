/**
 * BeidouAPI v60 - 北斗教育 API 模組
 * 完整版：GSAT + RPG + PvP + 學習路徑 + 通知
 */

const API_BASE = 'https://beidou-edu-server-1.onrender.com';

const BeidouAPI = {
  request: async (endpoint, options = {}) => {
    const url = `${API_BASE}/api${endpoint}`;
    const config = {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options
    };
    try {
      const response = await fetch(url, config);
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      return { success: false, error: error.message };
    }
  },

  // ============================================================
  // GSAT 題庫
  // ============================================================
  gsat: {
    questions: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return BeidouAPI.request(`/gsat/questions?${query}`);
    },
    subjects: () => BeidouAPI.request('/gsat/subjects'),
    stats: () => BeidouAPI.request('/gsat/stats')
  },

  // ============================================================
  // PvE 戰鬥
  // ============================================================
  battle: {
    start: (params) => BeidouAPI.request('/battle/start', {
      method: 'POST', body: JSON.stringify(params)
    }),
    answer: (battleId, answer) => BeidouAPI.request('/battle/answer', {
      method: 'POST', body: JSON.stringify({ battle_id: battleId, answer })
    }),
    status: (battleId) => BeidouAPI.request(`/battle/status/${battleId}`)
  },

  // ============================================================
  // 怪獸
  // ============================================================
  monsters: {
    list: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return BeidouAPI.request(`/monsters?${query}`);
    },
    detail: (monsterId) => BeidouAPI.request(`/monsters/${monsterId}`),
    subjects: () => BeidouAPI.request('/monsters/subjects')
  },

  // ============================================================
  // PvP 對戰 (前端暫不開放)
  // ============================================================
  pvp: {
    join: (playerId) => BeidouAPI.request('/pvp/join', {
      method: 'POST', body: JSON.stringify({ player_id: playerId })
    }),
    match: (playerId) => BeidouAPI.request(`/pvp/match?player_id=${playerId}`),
    leave: (playerId) => BeidouAPI.request('/pvp/leave', {
      method: 'POST', body: JSON.stringify({ player_id: playerId })
    }),
    battleStart: (battleId, playerId) => BeidouAPI.request('/pvp/battle/start', {
      method: 'POST', body: JSON.stringify({ battle_id: battleId, player_id: playerId })
    }),
    battleAnswer: (battleId, playerId, answer, time) => BeidouAPI.request('/pvp/battle/answer', {
      method: 'POST', body: JSON.stringify({ battle_id: battleId, player_id: playerId, answer, response_time: time })
    }),
    leaderboard: (limit = 20) => BeidouAPI.request(`/pvp/leaderboard?limit=${limit}`),
    ranks: () => BeidouAPI.request('/pvp/ranks'),
    bots: () => BeidouAPI.request('/pvp/bots')
  },

  // ============================================================
  // 玩家
  // ============================================================
  player: {
    get: (playerId) => BeidouAPI.request(`/player/${playerId}`),
    stats: (playerId) => BeidouAPI.request(`/player/${playerId}/stats`),
    inventory: (playerId) => BeidouAPI.request(`/player/${playerId}/inventory`),
    achievements: (playerId) => BeidouAPI.request(`/player/${playerId}/achievements`),
    titles: (playerId) => BeidouAPI.request(`/player/${playerId}/titles`)
  },

  // ============================================================
  // 每日系統
  // ============================================================
  daily: {
    status: (playerId) => BeidouAPI.request(`/daily/status?player_id=${playerId || 1}`),
    checkin: (playerId) => BeidouAPI.request('/daily/checkin', {
      method: 'POST', body: JSON.stringify({ player_id: playerId || 1 })
    }),
    missions: (playerId) => BeidouAPI.request(`/daily/missions?player_id=${playerId || 1}`),
    challenge: () => BeidouAPI.request('/daily/challenge')
  },

  // ============================================================
  // 學習路徑
  // ============================================================
  learning: {
    paths: () => BeidouAPI.request('/learning/paths'),
    pathDetail: (pathId) => BeidouAPI.request(`/learning/paths/${pathId}`),
    progress: (playerId) => BeidouAPI.request(`/learning/progress/${playerId}`),
    recommend: (playerId) => BeidouAPI.request(`/learning/recommend/${playerId}`)
  },

  // ============================================================
  // 排行榜
  // ============================================================
  leaderboard: {
    get: (type, limit = 20) => BeidouAPI.request(`/leaderboard/${type}?limit=${limit}`),
    rank: (type, playerId) => BeidouAPI.request(`/leaderboard/${type}/rank/${playerId}`)
  },

  // ============================================================
  // 通知
  // ============================================================
  notifications: {
    list: (playerId, limit = 20, unreadOnly = false) => 
      BeidouAPI.request(`/notifications/${playerId}?limit=${limit}&unread=${unreadOnly}`),
    read: (playerId, ids = []) => BeidouAPI.request(`/notifications/${playerId}/read`, {
      method: 'POST', body: JSON.stringify({ ids })
    }),
    count: (playerId) => BeidouAPI.request(`/notifications/${playerId}/count`)
  },

  // ============================================================
  // 成就/稱號
  // ============================================================
  achievements: {
    list: (category) => BeidouAPI.request(`/achievements${category ? '?category=' + category : ''}`),
    player: (playerId) => BeidouAPI.request(`/player/${playerId}/achievements`)
  },

  titles: {
    list: (rarity) => BeidouAPI.request(`/titles${rarity ? '?rarity=' + rarity : ''}`),
    player: (playerId) => BeidouAPI.request(`/player/${playerId}/titles`)
  },

  // ============================================================
  // 健康檢查
  // ============================================================
  health: () => BeidouAPI.request('/health')
};

console.log('🚀 BeidouAPI v60 已載入 (40+ API)');

// ============================================================
// v5.5 整合 API
// ============================================================
BeidouAPI.generator = {
  batch: (params) => BeidouAPI.request('/gsat/batch', {
    method: 'POST', body: JSON.stringify(params)
  }),
  createExam: (params) => BeidouAPI.request('/exam/create', {
    method: 'POST', body: JSON.stringify(params)
  }),
  learningPath: (start, depth = 3) => 
    BeidouAPI.request(`/learning/path/generate?start=${start}&depth=${depth}`),
  statsReport: () => BeidouAPI.request('/stats/report'),
  listSeeds: (subject) => 
    BeidouAPI.request(`/seeds/list${subject ? '?subject=' + subject : ''}`)
};

BeidouAPI.texts = {
  get: (category) => BeidouAPI.request(`/texts/${category}`)
};

console.log('🚀 BeidouAPI v61 已載入 (44 API)');
