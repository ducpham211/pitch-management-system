import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FaCheckCircle } from 'react-icons/fa';
import Button from '../../components/common/Button';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (sessionId) {
      console.log(sessionId);
    }
  }, [searchParams]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 animate-fade-in-up">
      <div className="bg-white p-8 md:p-12 rounded-3xl shadow-lg border border-gray-100 text-center max-w-lg w-full">
        <div className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center text-5xl mx-auto mb-6 shadow-inner">
          <FaCheckCircle />
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Thanh Toán Thành Công!</h1>
        <p className="text-gray-600 mb-8 leading-relaxed">
          Giao dịch của bạn đã được hệ thống ghi nhận an toàn. Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi. Vui lòng kiểm tra lại đơn đặt sân trong hồ sơ cá nhân.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="outline" className="w-full sm:w-auto" onClick={() => navigate('/')}>Trang Chủ</Button>
          <Button variant="primary" className="w-full sm:w-auto !bg-green-600 hover:!bg-green-700" onClick={() => navigate('/ho-so')}>Xem Đơn Đặt</Button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;