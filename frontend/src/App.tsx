import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import Home from './pages/player/Home';
import FindPitch from './pages/player/FindPitch';
import PitchDetail from './pages/player/PitchDetail';
import Checkout from './pages/player/Checkout';
import MatchBoard from './pages/player/MatchBoard';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Chat from './pages/player/Chat';
import Profile from './pages/player/Profile';
import TeamManagement from './pages/player/TeamManagement';
import OwnerDashboard from './pages/owner/Dashboard';
import AdminDashboard from './pages/admin/Dashboard';
import PaymentSuccess from './pages/payment/PaymentSuccess';
import PaymentCancel from './pages/payment/PaymentCancel';
import { AuthProvider } from './context/AuthContext';
import FloatingChatbot from './components/common/FloatingChatbot';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-800">
          <Navbar />
          <main className="flex-1 w-full mt-4">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/pitches" element={<FindPitch />} />
              <Route path="/pitches/:id" element={<PitchDetail />} />
              <Route path="/checkout/:id" element={<Checkout />} />
              <Route path="/matches" element={<MatchBoard />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/messages" element={<Chat />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/teams" element={<TeamManagement />} />
              <Route path="/owner/*" element={<OwnerDashboard />} />
              <Route path="/admin/*" element={<AdminDashboard />} />
              <Route path="/payment/success" element={<PaymentSuccess />} />
              <Route path="/payment/cancel" element={<PaymentCancel />} />
            </Routes>
          </main>
          <Footer />
          <FloatingChatbot />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;