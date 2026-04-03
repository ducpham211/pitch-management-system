import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEnvelope, FaLock, FaGoogle, FaFacebook } from 'react-icons/fa';
import Button from '../../components/common/Button';
import axiosClient from '../../api/axiosClient';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Vui lòng điền đầy đủ email và mật khẩu.');
      return;
    }

    try {
      const response = await axiosClient.post('/auth/login', {
        email,
        password
      });

      const { accessToken, userId, role } = response.data;
      
      login(accessToken, {
        id: userId,
        email: email,
        fullName: '',
        role: role
      });

      if (role === 'ADMIN') {
        navigate('/admin');
      } else if (role === 'OWNER') {
        navigate('/chu-san');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (typeof err.response?.data === 'string') {
        setError(err.response.data);
      } else {
        setError('Sai email hoặc mật khẩu. Vui lòng thử lại.');
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

        <form onSubmit={handleLogin} className="space-y-5">
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
            <label className="flex items-center text-gray-600 cursor-pointer">
              <input type="checkbox" className="mr-2 rounded border-gray-300 text-green-600 focus:ring-green-500" />
              Ghi nhớ đăng nhập
            </label>
            <a href="#" className="text-green-600 hover:text-green-700 font-medium">Quên mật khẩu?</a>
          </div>

          <Button type="submit" variant="primary" className="w-full py-3 text-lg !bg-green-600 hover:!bg-green-700 mt-2">
            Đăng Nhập
          </Button>
        </form>

        <div className="mt-8">
          <div className="relative flex items-center justify-center">
            <span className="absolute inset-x-0 h-px bg-gray-200"></span>
            <span className="relative bg-white px-4 text-sm text-gray-500">Hoặc đăng nhập bằng</span>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-6">
            <button className="flex items-center justify-center gap-2 py-2.5 border border-gray-300 rounded-xl hover:bg-gray-50 transition text-gray-700 font-medium">
              <FaGoogle className="text-red-500" /> Google
            </button>
            <button className="flex items-center justify-center gap-2 py-2.5 border border-gray-300 rounded-xl hover:bg-gray-50 transition text-gray-700 font-medium">
              <FaFacebook className="text-blue-600" /> Facebook
            </button>
          </div>
        </div>

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