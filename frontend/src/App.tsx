// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/player/Home';
import FindPitch from './pages/player/FindPitch';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {/* Có thể thêm Navbar Component ở đây sau này */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tim-san" element={<FindPitch />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;