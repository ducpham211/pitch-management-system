import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEnvelope, FaLock } from 'react-icons/fa';
import Button from '../../components/common/Button';
import axios from 'axios';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Vui lòng nhập đầy đủ email và mật khẩu.');
      return;
    }
    
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email: email,
        password: password
      });

      const { accessToken, message } = response.data;

      if (accessToken) {
        localStorage.setItem('accessToken', accessToken);
        window.dispatchEvent(new Event('storage'));
      }

      alert(message || 'Đăng nhập thành công!');
      
      if (email.toLowerCase().includes('admin')) {
        navigate('/admin');
      } else if (email.toLowerCase().includes('owner')) {
        navigate('/chu-san');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Đã xảy ra lỗi kết nối đến máy chủ. Vui lòng thử lại.');
      }
    }
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
          <div>
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
            </div>
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