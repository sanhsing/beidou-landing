import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { API_BASE } from '../App'

export default function HomePage() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    fetch(`${API_BASE}/api/health`)
      .then(r => r.json())
      .then(d => setStats(d))
      .catch(() => {})
  }, [])

  const features = [
    { path: '/gsat', icon: '📚', title: '學測題庫', desc: '10科30種子', color: 'blue' },
    { path: '/cert', icon: '🎓', title: 'AI認證', desc: '4大認證課程', color: 'green' },
    { path: '/pve', icon: '🎮', title: 'PvE挑戰', desc: '怪獸對戰學習', color: 'purple' },
  ]

  return (
    <div className="p-4">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white mb-6">
        <h1 className="text-2xl font-bold">北斗教育 v55</h1>
        <p className="text-blue-100 mt-1">智慧學習，精準備考</p>
        {stats && (
          <div className="mt-3 text-sm text-blue-100">
            ✓ 系統運行中
          </div>
        )}
      </div>

      <div className="grid gap-4">
        {features.map(f => (
          <Link
            key={f.path}
            to={f.path}
            className="bg-white rounded-xl p-5 shadow-md flex items-center gap-4 hover:shadow-lg transition-shadow"
          >
            <span className="text-4xl">{f.icon}</span>
            <div>
              <h3 className="font-bold text-lg">{f.title}</h3>
              <p className="text-gray-500 text-sm">{f.desc}</p>
            </div>
            <span className="ml-auto text-gray-400">→</span>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3 mt-6">
        <div className="bg-white rounded-xl p-4 text-center shadow">
          <div className="text-2xl font-bold text-blue-600">30</div>
          <div className="text-xs text-gray-500">題目種子</div>
        </div>
        <div className="bg-white rounded-xl p-4 text-center shadow">
          <div className="text-2xl font-bold text-green-600">345</div>
          <div className="text-xs text-gray-500">認證術語</div>
        </div>
        <div className="bg-white rounded-xl p-4 text-center shadow">
          <div className="text-2xl font-bold text-purple-600">11</div>
          <div className="text-xs text-gray-500">學習引擎</div>
        </div>
      </div>
    </div>
  )
}
