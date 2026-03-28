import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEnvelope, FaLock } from 'react-icons/fa';
import Button from '../../components/common/Button';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Vui lòng nhập đầy đủ email và mật khẩu.');
      return;
    }
    
    // Giả lập gọi API đăng nhập
    setTimeout(() => {
      alert('Đăng nhập thành công!');
      
      // LOGIC KIỂM TRA ROLE GIẢ LẬP Ở ĐÂY:
      // Nếu email chứa chữ "owner" hoặc "admin" thì cho vào trang Chủ sân
      if (email.toLowerCase().includes('owner') || email.toLowerCase().includes('admin')) {
        navigate('/chu-san');
      } else {
        // Mặc định là tài khoản Người chơi
        navigate('/');
      }
    }, 1000);
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Đăng Nhập</h2>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <FaEnvelope />
            </div>
            <input
              type="email"
              placeholder="Email của bạn"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {/* Thêm mẹo test cho dev */}
            <p className="text-xs text-gray-400 mt-2">
              *Mẹo: Nhập email có chữ "owner" (VD: owner@gmail.com) để vào kênh Chủ Sân.
            </p>
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <FaLock />
            </div>
            <input
              type="password"
              placeholder="Mật khẩu"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer text-gray-600">
              <input type="checkbox" className="rounded text-green-600 focus:ring-green-500" />
              Ghi nhớ tài khoản
            </label>
            <a href="#" className="text-green-600 hover:text-green-700 font-medium">Quên mật khẩu?</a>
          </div>

          <Button type="submit" variant="primary" className="w-full py-3 text-lg !bg-green-600 hover:!bg-green-700">
            Đăng Nhập
          </Button>
        </form>

        <div className="mt-6 text-center text-gray-600">
          Chưa có tài khoản?{' '}
          <Link to="/dang-ky" className="text-green-600 hover:text-green-700 font-bold">
            Đăng ký ngay
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;