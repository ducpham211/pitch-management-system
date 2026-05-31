import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEnvelope, FaLock, FaUser, FaKey } from 'react-icons/fa';
import Button from '../../components/common/Button';
import PopupMessage from '../../components/common/PopupMessage';
import axios from 'axios';

const Register = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  
  const [popupInfo, setPopupInfo] = useState({
    isOpen: false,
    type: 'info' as 'success' | 'error' | 'info',
    title: '',
    message: '',
    onConfirm: () => {}
  });
  
  const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

  const closePopup = () => {
    setPopupInfo(prev => ({ ...prev, isOpen: false }));
  };

  const handleSendOtp = async () => {
    if (!email) {
      setPopupInfo({
        isOpen: true,
        type: 'error',
        title: 'Thiếu email',
        message: 'Vui lòng nhập email trước khi gửi OTP.',
        onConfirm: closePopup
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setPopupInfo({
        isOpen: true,
        type: 'error',
        title: 'Email không hợp lệ',
        message: 'Vui lòng nhập đúng định dạng email.',
        onConfirm: closePopup
      });
      return;
    }

    setIsSendingOtp(true);
    try {
      const response = await axios.post(`${API_URL}/auth/send-register-otp`, { email });
      setPopupInfo({
        isOpen: true,
        type: 'success',
        title: 'Thành công',
        message: response.data.message || 'Mã OTP đã được gửi đến email của bạn!',
        onConfirm: closePopup
      });
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Lỗi khi gửi OTP. Vui lòng thử lại sau.';
      setPopupInfo({
        isOpen: true,
        type: 'error',
        title: 'Lỗi',
        message: errorMessage,
        onConfirm: closePopup
      });
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !otp || !password || !confirmPassword) {
      setPopupInfo({
        isOpen: true,
        type: 'error',
        title: 'Thiếu thông tin',
        message: 'Vui lòng điền đầy đủ thông tin và mã OTP.',
        onConfirm: closePopup
      });
      return;
    }
    
    if (password.length < 6) {
      setPopupInfo({
        isOpen: true,
        type: 'error',
        title: 'Mật khẩu quá ngắn',
        message: 'Mật khẩu phải chứa ít nhất 6 ký tự.',
        onConfirm: closePopup
      });
      return;
    }

    if (password !== confirmPassword) {
      setPopupInfo({
        isOpen: true,
        type: 'error',
        title: 'Lỗi xác nhận',
        message: 'Mật khẩu xác nhận không khớp.',
        onConfirm: closePopup
      });
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/auth/register`, {
        email: email,
        password: password,
        fullName: name,
        otp: otp
      });

      setPopupInfo({
        isOpen: true,
        type: 'success',
        title: 'Thành công!',
        message: response.data.message || 'Đăng ký tài khoản thành công!',
        onConfirm: () => {
            closePopup();
            navigate('/login');
        }
      });
    } catch (err: any) {
      let errorMessage = 'Đã xảy ra lỗi kết nối đến máy chủ. Vui lòng thử lại.';
      
      const errString = (
        err.response?.data?.message || 
        JSON.stringify(err.response?.data) || 
        err.message || 
        ''
      ).toLowerCase();

      if (
        errString.includes('user_already_exists') || 
        errString.includes('already registered') || 
        errString.includes('already exists') || 
        errString.includes('duplicate')
      ) {
        errorMessage = 'Email này đã được sử dụng. Vui lòng chọn email khác.';
      } else if (
        errString.includes('weak_password') || 
        errString.includes('at least 6 characters')
      ) {
        errorMessage = 'Mật khẩu quá yếu. Mật khẩu phải chứa ít nhất 6 ký tự.';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (typeof err.response?.data === 'string') {
        errorMessage = err.response.data;
      }
      
      setPopupInfo({
        isOpen: true,
        type: 'error',
        title: 'Đăng ký thất bại',
        message: errorMessage,
        onConfirm: closePopup
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Tạo Tài Khoản</h2>
        
        <form onSubmit={handleRegister} className="space-y-5">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <FaUser />
            </div>
            <input
              type="text"
              placeholder="Họ và tên"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="flex space-x-2">
            <div className="relative flex-1">
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
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleSendOtp}
              disabled={isSendingOtp}
              className="px-4 whitespace-nowrap !rounded-xl"
            >
              {isSendingOtp ? 'Đang gửi...' : 'Gửi OTP'}
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <FaKey />
            </div>
            <input
              type="text"
              placeholder="Nhập mã OTP"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
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

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <FaLock />
            </div>
            <input
              type="password"
              placeholder="Xác nhận mật khẩu"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <Button type="submit" variant="primary" className="w-full py-3 text-lg !bg-green-600 hover:!bg-green-700 mt-2">
            Đăng Ký
          </Button>
        </form>

        <div className="mt-6 text-center text-gray-600">
          Đã có tài khoản?{' '}
          <Link to="/login" className="text-green-600 hover:text-green-700 font-bold">
            Đăng nhập
          </Link>
        </div>
      </div>
      
      <PopupMessage
        isOpen={popupInfo.isOpen}
        onClose={closePopup}
        type={popupInfo.type}
        title={popupInfo.title}
        message={popupInfo.message}
        onConfirm={popupInfo.onConfirm}
      />
    </div>
  );
};

export default Register;