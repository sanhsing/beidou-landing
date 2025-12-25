import React, { useState, useEffect } from 'react'
import { API_BASE } from '../App'

export default function CertPage() {
  const [certs, setCerts] = useState([])
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])

  useEffect(() => {
    fetch(`${API_BASE}/api/cert/list`)
      .then(r => r.json())
      .then(d => { if (d.success) setCerts(d.data) })
      .catch(() => {})
  }, [])

  const search = () => {
    if (query.length < 2) return
    fetch(`${API_BASE}/api/cert/glossary/search?q=${query}`)
      .then(r => r.json())
      .then(d => { if (d.success) setResults(d.data.results || []) })
  }

  const icons = { google_ai: '🔵', aws_ai: '🟠', azure_ai: '🔷', ipas: '🛡️' }

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">🎓 AI 認證中心</h1>
      
      {/* 搜尋 */}
      <div className="bg-white rounded-xl p-4 shadow mb-4">
        <div className="flex gap-2">
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && search()}
            placeholder="搜尋術語..."
            className="flex-1 border rounded-lg px-3 py-2"
          />
          <button onClick={search} className="bg-blue-600 text-white px-4 rounded-lg">
            搜尋
          </button>
        </div>
        {results.length > 0 && (
          <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
            {results.map(t => (
              <div key={t.id} className="border-l-4 border-blue-500 pl-3 py-1">
                <div className="font-medium">{t.term}</div>
                <div className="text-sm text-gray-500">{t.definition?.slice(0, 80)}...</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 認證列表 */}
      <div className="grid gap-3">
        {certs.map(c => (
          <div key={c.cert_key} className="bg-white rounded-xl p-4 shadow">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{icons[c.cert_key] || '📜'}</span>
              <div>
                <h3 className="font-bold">{c.name}</h3>
                <p className="text-sm text-gray-500">{c.term_count} 術語</p>
              </div>
            </div>
          </div>
        ))}
        {certs.length === 0 && (
          <div className="text-center py-8 text-gray-500">載入中...</div>
        )}
      </div>
    </div>
  )
}
