import React, { useState, useEffect } from 'react'
import { API_BASE } from '../App'

// 元素圖示
const ELEMENTS = {
  fire: { icon: '🔥', name: '火', color: 'red' },
  water: { icon: '💧', name: '水', color: 'blue' },
  earth: { icon: '🪨', name: '土', color: 'amber' },
  wind: { icon: '🌪️', name: '風', color: 'teal' },
  light: { icon: '✨', name: '光', color: 'yellow' },
  dark: { icon: '🌑', name: '暗', color: 'purple' },
}

// 難度設定
const DIFFICULTIES = [
  { id: 'easy', name: '簡單', icon: '🌱', color: 'green', hpMult: 1 },
  { id: 'normal', name: '普通', icon: '⚔️', color: 'blue', hpMult: 1.5 },
  { id: 'hard', name: '困難', icon: '💀', color: 'red', hpMult: 2 },
]

export default function PvEPage() {
  const [view, setView] = useState('select') // select | battle | result
  const [difficulty, setDifficulty] = useState(null)
  const [monster, setMonster] = useState(null)
  const [playerHP, setPlayerHP] = useState(100)
  const [monsterHP, setMonsterHP] = useState(100)
  const [question, setQuestion] = useState(null)
  const [combo, setCombo] = useState(0)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  // 生成怪獸
  const generateMonster = (diff) => {
    const elements = Object.keys(ELEMENTS)
    const element = elements[Math.floor(Math.random() * elements.length)]
    const names = ['史萊姆', '哥布林', '骷髏兵', '火焰狼', '冰霜熊', '暗影蝙蝠']
    const name = names[Math.floor(Math.random() * names.length)]
    
    return {
      name: `${ELEMENTS[element].icon} ${name}`,
      element,
      maxHP: Math.round(100 * diff.hpMult),
      attack: 10 + Math.floor(Math.random() * 10),
    }
  }

  // 開始戰鬥
  const startBattle = async (diff) => {
    setDifficulty(diff)
    const mon = generateMonster(diff)
    setMonster(mon)
    setMonsterHP(mon.maxHP)
    setPlayerHP(100)
    setCombo(0)
    setView('battle')
    await fetchQuestion()
  }

  // 獲取題目
  const fetchQuestion = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/gsat/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ difficulty: 'medium' })
      })
      const data = await res.json()
      if (data.success && data.data) {
        setQuestion({
          stem: data.data.questions?.[0]?.stem || '測試題目：1+1=?',
          options: data.data.questions?.[0]?.options || ['(A) 1', '(B) 2', '(C) 3', '(D) 4'],
          answer: data.data.questions?.[0]?.answer || 'B',
        })
      } else {
        // 備用題目
        setQuestion({
          stem: '動量的公式是？',
          options: ['(A) p=mv', '(B) F=ma', '(C) E=mc²', '(D) v=at'],
          answer: 'A',
        })
      }
    } catch (e) {
      // 備用題目
      setQuestion({
        stem: '1+1=?',
        options: ['(A) 1', '(B) 2', '(C) 3', '(D) 4'],
        answer: 'B',
      })
    }
    setLoading(false)
  }

  // 回答問題
  const handleAnswer = async (ans) => {
    const isCorrect = ans === question.answer
    
    if (isCorrect) {
      // 答對 - 攻擊怪獸
      const damage = 20 + combo * 5
      const newMonsterHP = Math.max(0, monsterHP - damage)
      setMonsterHP(newMonsterHP)
      setCombo(c => c + 1)
      
      if (newMonsterHP <= 0) {
        // 勝利
        setResult({ win: true, combo })
        setView('result')
        return
      }
    } else {
      // 答錯 - 怪獸攻擊
      const damage = monster.attack
      const newPlayerHP = Math.max(0, playerHP - damage)
      setPlayerHP(newPlayerHP)
      setCombo(0)
      
      if (newPlayerHP <= 0) {
        // 失敗
        setResult({ win: false, combo: 0 })
        setView('result')
        return
      }
    }
    
    // 下一題
    await fetchQuestion()
  }

  // 選擇難度
  if (view === 'select') {
    return (
      <div className="p-4">
        <h1 className="text-xl font-bold mb-4">🎮 PvE 怪獸挑戰</h1>
        <p className="text-gray-500 mb-6">答對題目攻擊怪獸，答錯會被反擊！</p>
        
        <div className="space-y-4">
          {DIFFICULTIES.map(d => (
            <button
              key={d.id}
              onClick={() => startBattle(d)}
              className={`w-full bg-white rounded-xl p-5 shadow-md flex items-center gap-4 hover:shadow-lg transition-all border-l-4 border-${d.color}-500`}
            >
              <span className="text-4xl">{d.icon}</span>
              <div className="text-left">
                <h3 className="font-bold text-lg">{d.name}</h3>
                <p className="text-gray-500 text-sm">怪獸血量 ×{d.hpMult}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    )
  }

  // 戰鬥畫面
  if (view === 'battle') {
    return (
      <div className="p-4">
        {/* 怪獸狀態 */}
        <div className="bg-white rounded-xl p-4 shadow mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="font-bold">{monster?.name}</span>
            <span className="text-sm text-gray-500">{monsterHP}/{monster?.maxHP}</span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-red-500 transition-all duration-300"
              style={{ width: `${(monsterHP / monster?.maxHP) * 100}%` }}
            />
          </div>
        </div>

        {/* 玩家狀態 */}
        <div className="bg-blue-50 rounded-xl p-4 mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="font-bold">👤 玩家</span>
            <span className="text-sm">
              ❤️ {playerHP}/100 | 🔥 連擊 {combo}
            </span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-green-500 transition-all duration-300"
              style={{ width: `${playerHP}%` }}
            />
          </div>
        </div>

        {/* 題目 */}
        {loading ? (
          <div className="bg-white rounded-xl p-8 shadow text-center">
            <div className="text-4xl animate-bounce">⚔️</div>
            <p className="mt-2 text-gray-500">準備下一題...</p>
          </div>
        ) : question && (
          <div className="bg-white rounded-xl p-4 shadow">
            <p className="font-medium mb-4">{question.stem}</p>
            <div className="space-y-2">
              {question.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleAnswer(['A', 'B', 'C', 'D'][i])}
                  className="w-full text-left p-3 rounded-lg border hover:bg-blue-50 hover:border-blue-500 transition-all"
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  // 結果畫面
  if (view === 'result') {
    return (
      <div className="p-4">
        <div className={`rounded-2xl p-8 text-center text-white ${result?.win ? 'bg-gradient-to-r from-green-500 to-teal-500' : 'bg-gradient-to-r from-red-500 to-orange-500'}`}>
          <div className="text-6xl mb-4">{result?.win ? '🎉' : '💀'}</div>
          <h2 className="text-2xl font-bold">{result?.win ? '勝利！' : '失敗...'}</h2>
          {result?.win && (
            <p className="mt-2">最高連擊: {result.combo + 1}</p>
          )}
        </div>
        
        <button
          onClick={() => setView('select')}
          className="w-full mt-6 bg-blue-600 text-white py-3 rounded-xl font-bold"
        >
          再來一次
        </button>
      </div>
    )
  }
}
