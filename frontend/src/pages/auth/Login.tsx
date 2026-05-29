import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEnvelope, FaLock, FaGoogle, FaFacebook, FaKey } from 'react-icons/fa';
import Button from '../../components/common/Button';
import PopupMessage from '../../components/common/PopupMessage';
import axiosClient from '../../api/axiosClient';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [step, setStep] = useState<'login' | 'forgot-email' | 'forgot-otp' | 'forgot-reset'>('login');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [forgotEmail, setForgotEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [popupInfo, setPopupInfo] = useState({
    isOpen: false,
    type: 'info' as 'success' | 'error' | 'info',
    title: '',
    message: '',
    onConfirm: () => {}
  });

  const closePopup = () => {
    setPopupInfo(prev => ({ ...prev, isOpen: false }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setPopupInfo({
        isOpen: true,
        type: 'error',
        title: 'Thiếu thông tin',
        message: 'Vui lòng điền đầy đủ email và mật khẩu.',
        onConfirm: closePopup
      });
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

      setPopupInfo({
        isOpen: true,
        type: 'success',
        title: 'Thành công',
        message: 'Đăng nhập thành công!',
        onConfirm: () => {
          closePopup();
          if (role === 'ADMIN') {
            navigate('/admin');
          } else if (role === 'OWNER') {
            navigate('/owner');
          } else {
            navigate('/');
          }
        }
      });
    } catch (err: any) {
      let errorMessage = 'Sai email hoặc mật khẩu. Vui lòng thử lại.';
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (typeof err.response?.data === 'string') {
        errorMessage = err.response.data;
      }

      setPopupInfo({
        isOpen: true,
        type: 'error',
        title: 'Thất bại',
        message: errorMessage,
        onConfirm: closePopup
      });
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) {
      setPopupInfo({ isOpen: true, type: 'error', title: 'Lỗi', message: 'Vui lòng nhập email.', onConfirm: closePopup });
      return;
    }
    try {
      await axiosClient.post('/auth/forgot-password', { email: forgotEmail });
      setPopupInfo({ isOpen: true, type: 'success', title: 'Thành công', message: 'Mã OTP đã được gửi đến email của bạn.', onConfirm: closePopup });
      setStep('forgot-otp');
    } catch (err: any) {
      setPopupInfo({ isOpen: true, type: 'error', title: 'Lỗi', message: err.response?.data?.message || 'Có lỗi xảy ra', onConfirm: closePopup });
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) {
      setPopupInfo({ isOpen: true, type: 'error', title: 'Lỗi', message: 'Vui lòng nhập mã OTP.', onConfirm: closePopup });
      return;
    }
    try {
      await axiosClient.post('/auth/verify-otp', { email: forgotEmail, otp });
      setStep('forgot-reset');
    } catch (err: any) {
      setPopupInfo({ isOpen: true, type: 'error', title: 'Lỗi', message: err.response?.data?.message || 'OTP không hợp lệ', onConfirm: closePopup });
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      setPopupInfo({ isOpen: true, type: 'error', title: 'Lỗi', message: 'Vui lòng điền đầy đủ mật khẩu.', onConfirm: closePopup });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPopupInfo({ isOpen: true, type: 'error', title: 'Lỗi', message: 'Mật khẩu xác nhận không khớp.', onConfirm: closePopup });
      return;
    }
    try {
      await axiosClient.post('/auth/reset-password', { email: forgotEmail, otp, newPassword });
      setPopupInfo({
        isOpen: true,
        type: 'success',
        title: 'Thành công',
        message: 'Đổi mật khẩu thành công. Vui lòng đăng nhập lại.',
        onConfirm: () => {
          closePopup();
          setStep('login');
          setForgotEmail('');
          setOtp('');
          setNewPassword('');
          setConfirmPassword('');
        }
      });
    } catch (err: any) {
      setPopupInfo({ isOpen: true, type: 'error', title: 'Lỗi', message: err.response?.data?.message || 'Có lỗi xảy ra', onConfirm: closePopup });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 w-full max-w-md">
        
        {step === 'login' && (
          <>
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Đăng Nhập</h2>
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
                <button type="button" onClick={() => setStep('forgot-email')} className="text-green-600 hover:text-green-700 font-medium bg-transparent border-none p-0 cursor-pointer">Quên mật khẩu?</button>
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
              <Link to="/register" className="text-green-600 hover:text-green-700 font-bold">
                Đăng ký ngay
              </Link>
            </div>
          </>
        )}

        {step === 'forgot-email' && (
          <>
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Quên Mật Khẩu</h2>
            <p className="text-sm text-gray-600 text-center mb-6">Nhập email của bạn để nhận mã xác nhận OTP.</p>
            <form onSubmit={handleSendOtp} className="space-y-5">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <FaEnvelope />
                </div>
                <input
                  type="email"
                  placeholder="Email của bạn"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                />
              </div>
              <Button type="submit" variant="primary" className="w-full py-3 text-lg !bg-green-600 hover:!bg-green-700 mt-2">
                Gửi mã OTP
              </Button>
              <button type="button" onClick={() => setStep('login')} className="w-full py-2 text-gray-600 hover:text-gray-800 font-medium bg-transparent border-none mt-2 cursor-pointer">
                Quay lại đăng nhập
              </button>
            </form>
          </>
        )}

        {step === 'forgot-otp' && (
          <>
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Nhập Mã OTP</h2>
            <p className="text-sm text-gray-600 text-center mb-6">Mã OTP đã được gửi đến <strong>{forgotEmail}</strong></p>
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <FaKey />
                </div>
                <input
                  type="text"
                  placeholder="Nhập mã OTP (6 số)"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition text-center tracking-widest text-lg font-semibold"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                />
              </div>
              <Button type="submit" variant="primary" className="w-full py-3 text-lg !bg-green-600 hover:!bg-green-700 mt-2">
                Xác nhận
              </Button>
              <button type="button" onClick={() => setStep('login')} className="w-full py-2 text-gray-600 hover:text-gray-800 font-medium bg-transparent border-none mt-2 cursor-pointer">
                Hủy bỏ
              </button>
            </form>
          </>
        )}

        {step === 'forgot-reset' && (
          <>
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Tạo Mật Khẩu Mới</h2>
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <FaLock />
                </div>
                <input
                  type="password"
                  placeholder="Mật khẩu mới"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <FaLock />
                </div>
                <input
                  type="password"
                  placeholder="Xác nhận mật khẩu mới"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              <Button type="submit" variant="primary" className="w-full py-3 text-lg !bg-green-600 hover:!bg-green-700 mt-2">
                Đổi mật khẩu
              </Button>
            </form>
          </>
        )}

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

export default Login;