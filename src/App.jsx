import React from 'react'
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom'
import HomePage from './pages/HomePage'
import GSATPage from './pages/GSATPage'
import CertPage from './pages/CertPage'
import PvEPage from './pages/PvEPage'
import ProfilePage from './pages/ProfilePage'

// API 基礎路徑
export const API_BASE = import.meta.env.VITE_API_URL || 'https://beidou-edu-server-1.onrender.com'

function NavBar() {
  const location = useLocation()
  const navItems = [
    { path: '/', label: '首頁', icon: '🏠' },
    { path: '/gsat', label: '學測', icon: '📚' },
    { path: '/cert', label: '認證', icon: '🎓' },
    { path: '/pve', label: '挑戰', icon: '🎮' },
    { path: '/profile', label: '我的', icon: '👤' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50">
      <div className="flex justify-around py-2">
        {navItems.map(item => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center px-4 py-1 rounded-lg transition-all
              ${location.pathname === item.path 
                ? 'text-blue-600 bg-blue-50' 
                : 'text-gray-500 hover:text-gray-700'}`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="text-xs mt-1">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-100 pb-20">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/gsat/*" element={<GSATPage />} />
          <Route path="/cert/*" element={<CertPage />} />
          <Route path="/pve/*" element={<PvEPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
        <NavBar />
      </div>
    </BrowserRouter>
  )
}
