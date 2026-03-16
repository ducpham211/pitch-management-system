import React from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import Home from './pages/player/Home.tsx'
import FindPitch from './pages/player/FindPitch.tsx'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-blue-600 text-white p-4 shadow-md sticky top-0 z-50">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <div className="text-xl font-bold tracking-wider">PitchBooking</div>
            <div className="flex gap-6 font-medium">
              <Link to="/" className="hover:text-blue-200 transition">Trang chủ</Link>
              <Link to="/tim-san" className="hover:text-blue-200 transition">Tìm sân</Link>
            </div>
          </div>
        </nav>
        
        <main className="max-w-6xl mx-auto p-4 mt-6">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/tim-san" element={<FindPitch />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App