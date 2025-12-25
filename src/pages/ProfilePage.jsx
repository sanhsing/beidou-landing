import React from 'react'

export default function ProfilePage() {
  return (
    <div className="p-4">
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 text-white mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-3xl">
            👤
          </div>
          <div>
            <h2 className="text-xl font-bold">學習者</h2>
            <p className="text-purple-200">持續進步中</p>
          </div>
        </div>
      </div>

      <h3 className="font-bold mb-3">📊 學習統計</h3>
      
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-xl p-4 shadow text-center">
          <div className="text-2xl font-bold text-blue-600">0</div>
          <div className="text-sm text-gray-500">答題數</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow text-center">
          <div className="text-2xl font-bold text-green-600">0%</div>
          <div className="text-sm text-gray-500">正確率</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow text-center">
          <div className="text-2xl font-bold text-purple-600">0</div>
          <div className="text-sm text-gray-500">連續天數</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow text-center">
          <div className="text-2xl font-bold text-orange-600">0</div>
          <div className="text-sm text-gray-500">成就數</div>
        </div>
      </div>
    </div>
  )
}
