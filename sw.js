/**
 * 北斗教育 Service Worker v2.0
 * PWA 離線支援 + 題庫快取
 */

const CACHE_VERSION = 'v2';
const STATIC_CACHE = `beidou-static-${CACHE_VERSION}`;
const QUIZ_CACHE = `beidou-quiz-${CACHE_VERSION}`;
const API_CACHE = `beidou-api-${CACHE_VERSION}`;

// 靜態資源
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/auth.html',
  '/dashboard.html',
  '/quiz_ui.html',
  '/wrong_book.html',
  '/report.html',
  '/achievements.html',
  '/leaderboard.html',
  '/xtf_starmap.html',
  '/xtf_flashcard.html',
  '/learning_path.html',
  '/class.html',
  '/class_students.html',
  '/courses.html',
  '/course_learn.html',
  '/cert_exam.html',
  '/status.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

// 可快取的 API 路徑
const CACHEABLE_API = [
  '/api/quiz/subjects',
  '/api/quiz/stats',
  '/api/achievements',
  '/api/courses'
];

// 安裝
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('📦 快取靜態資源');
        return cache.addAll(STATIC_ASSETS);
      }),
      caches.open(QUIZ_CACHE).then((cache) => {
        console.log('📝 初始化題庫快取');
        return cache;
      })
    ])
  );
  self.skipWaiting();
});

// 啟用 - 清理舊快取
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => {
            return name.startsWith('beidou-') && 
                   !name.endsWith(CACHE_VERSION);
          })
          .map((name) => {
            console.log('🗑️ 清理舊快取:', name);
            return caches.delete(name);
          })
      );
    })
  );
  self.clients.claim();
});

// 請求攔截
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // 只處理 GET 請求
  if (request.method !== 'GET') {
    return;
  }
  
  // API 請求處理
  if (url.pathname.startsWith('/api')) {
    event.respondWith(handleApiRequest(request, url));
    return;
  }
  
  // 靜態資源：快取優先 + 背景更新
  event.respondWith(handleStaticRequest(request));
});

// 處理 API 請求
async function handleApiRequest(request, url) {
  const isCacheable = CACHEABLE_API.some(path => url.pathname.startsWith(path));
  
  // 題庫隨機題目：特殊處理
  if (url.pathname === '/api/quiz/random') {
    return handleQuizRequest(request, url);
  }
  
  // 可快取 API：網路優先，失敗用快取
  if (isCacheable) {
    try {
      const response = await fetch(request);
      if (response.ok) {
        const cache = await caches.open(API_CACHE);
        cache.put(request, response.clone());
      }
      return response;
    } catch (error) {
      const cached = await caches.match(request);
      if (cached) {
        console.log('📴 使用 API 快取:', url.pathname);
        return cached;
      }
      return new Response(JSON.stringify({ 
        success: false, 
        error: '離線模式，無法取得資料',
        offline: true 
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
  
  // 其他 API：直接請求
  return fetch(request);
}

// 處理題庫請求
async function handleQuizRequest(request, url) {
  const subject = url.searchParams.get('subject') || 'all';
  const limit = url.searchParams.get('limit') || 10;
  const cacheKey = `quiz-${subject}`;
  
  try {
    // 嘗試網路請求
    const response = await fetch(request);
    if (response.ok) {
      const data = await response.clone().json();
      
      // 快取題目到 IndexedDB 或 Cache
      if (data.success && data.data) {
        const cache = await caches.open(QUIZ_CACHE);
        // 儲存為特定科目的快取
        cache.put(new Request(cacheKey), new Response(JSON.stringify(data.data)));
      }
      
      return response;
    }
  } catch (error) {
    console.log('📴 離線模式，嘗試使用快取題庫');
    
    // 從快取取得題目
    const cache = await caches.open(QUIZ_CACHE);
    const cached = await cache.match(cacheKey);
    
    if (cached) {
      const questions = await cached.json();
      // 隨機抽取
      const shuffled = questions.sort(() => Math.random() - 0.5);
      const selected = shuffled.slice(0, parseInt(limit));
      
      return new Response(JSON.stringify({
        success: true,
        data: selected,
        offline: true,
        message: '離線模式：使用快取題目'
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify({
      success: false,
      error: '離線模式且無快取題目',
      offline: true
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// 處理靜態資源請求
async function handleStaticRequest(request) {
  const cached = await caches.match(request);
  
  if (cached) {
    // 背景更新
    fetch(request).then((response) => {
      if (response.ok) {
        caches.open(STATIC_CACHE).then((cache) => {
          cache.put(request, response);
        });
      }
    }).catch(() => {});
    
    return cached;
  }
  
  // 無快取：網路請求
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    // 離線且無快取：返回離線頁
    if (request.destination === 'document') {
      return caches.match('/index.html');
    }
    throw error;
  }
}

// 預載入題庫（供前端呼叫）
self.addEventListener('message', (event) => {
  if (event.data.type === 'PRELOAD_QUIZ') {
    const { subject } = event.data;
    preloadQuizData(subject);
  }
  
  if (event.data.type === 'CLEAR_CACHE') {
    clearAllCache();
  }
  
  if (event.data.type === 'GET_CACHE_STATUS') {
    getCacheStatus().then(status => {
      event.ports[0].postMessage(status);
    });
  }
});

// 預載入題庫
async function preloadQuizData(subject = 'all') {
  const API_BASE = 'https://beidou-edu-server-1.onrender.com';
  const subjects = subject === 'all' 
    ? ['數學', '物理', '化學', '生物', '地科', '國文', '英文', '歷史', '地理', '公民']
    : [subject];
  
  for (const subj of subjects) {
    try {
      const response = await fetch(`${API_BASE}/api/quiz/random?subject=${encodeURIComponent(subj)}&limit=50`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const cache = await caches.open(QUIZ_CACHE);
          await cache.put(
            new Request(`quiz-${subj}`), 
            new Response(JSON.stringify(data.data))
          );
          console.log(`✅ 已快取 ${subj} 題庫`);
        }
      }
    } catch (error) {
      console.log(`⚠️ 快取 ${subj} 失敗:`, error);
    }
  }
  
  // 通知前端
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({ type: 'PRELOAD_COMPLETE', subject });
    });
  });
}

// 清除快取
async function clearAllCache() {
  const cacheNames = await caches.keys();
  await Promise.all(cacheNames.map(name => caches.delete(name)));
  console.log('🗑️ 已清除所有快取');
}

// 取得快取狀態
async function getCacheStatus() {
  const staticCache = await caches.open(STATIC_CACHE);
  const quizCache = await caches.open(QUIZ_CACHE);
  const apiCache = await caches.open(API_CACHE);
  
  const staticKeys = await staticCache.keys();
  const quizKeys = await quizCache.keys();
  const apiKeys = await apiCache.keys();
  
  return {
    version: CACHE_VERSION,
    static: staticKeys.length,
    quiz: quizKeys.length,
    api: apiKeys.length,
    total: staticKeys.length + quizKeys.length + apiKeys.length
  };
}

// 推送通知
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-72.png',
      vibrate: [100, 50, 100],
      data: {
        url: data.url || '/'
      },
      actions: [
        { action: 'open', title: '開啟' },
        { action: 'close', title: '關閉' }
      ]
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// 點擊通知
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'close') return;
  
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});

// 背景同步（未來擴展）
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-answers') {
    event.waitUntil(syncPendingAnswers());
  }
});

async function syncPendingAnswers() {
  // 待實作：同步離線作答記錄
  console.log('🔄 同步離線答案');
}
