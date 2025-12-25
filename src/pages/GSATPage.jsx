import React, { useState } from 'react'
import { API_BASE } from '../App'

const SUBJECTS = [
  { id: 'PHY', name: '物理', icon: '⚡' },
  { id: 'CHEM', name: '化學', icon: '🧪' },
  { id: 'MATH', name: '數學', icon: '📐' },
  { id: 'BIO', name: '生物', icon: '🧬' },
  { id: 'ES', name: '地科', icon: '🌍' },
  { id: 'CHI', name: '國文', icon: '📖' },
  { id: 'ENG', name: '英文', icon: '🔤' },
  { id: 'HIS', name: '歷史', icon: '🏛️' },
  { id: 'GEO', name: '地理', icon: '🗺️' },
  { id: 'CIV', name: '公民', icon: '⚖️' },
]

export default function GSATPage() {
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(false)
  const [question, setQuestion] = useState(null)

  const startPractice = async (subject) => {
    setSelected(subject)
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/gsat/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: subject.name, difficulty: 'medium' })
      })
      const data = await res.json()
      if (data.success) setQuestion(data.data)
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  if (selected) {
    return (
      <div className="p-4">
        <button onClick={() => setSelected(null)} className="text-blue-600 mb-4">
          ← 返回選擇
        </button>
        <h2 className="text-xl font-bold mb-4">{selected.icon} {selected.name}</h2>
        {loading ? (
          <div className="text-center py-8">載入中...</div>
        ) : question ? (
          <div className="bg-white rounded-xl p-4 shadow">
            <pre className="whitespace-pre-wrap">{JSON.stringify(question, null, 2)}</pre>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">尚未連接後端API</div>
        )}
      </div>
    )
  }

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">📚 學測題庫</h1>
      <p className="text-gray-500 mb-4">選擇科目開始練習</p>
      <div className="grid grid-cols-2 gap-3">
        {SUBJECTS.map(s => (
          <button
            key={s.id}
            onClick={() => startPractice(s)}
            className="bg-white rounded-xl p-4 shadow hover:shadow-lg transition-all flex flex-col items-center gap-2"
          >
            <span className="text-3xl">{s.icon}</span>
            <span className="font-medium">{s.name}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
