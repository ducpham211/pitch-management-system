import { useNavigate } from 'react-router-dom';
import { FaTimesCircle } from 'react-icons/fa';
import Button from '../../components/common/Button';

const PaymentCancel = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 animate-fade-in-up">
      <div className="bg-white p-8 md:p-12 rounded-3xl shadow-lg border border-gray-100 text-center max-w-lg w-full">
        <div className="w-24 h-24 bg-red-100 text-red-500 rounded-full flex items-center justify-center text-5xl mx-auto mb-6 shadow-inner">
          <FaTimesCircle />
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Thanh Toán Bị Hủy</h1>
        <p className="text-gray-600 mb-8 leading-relaxed">
          Giao dịch của bạn đã bị hủy bỏ hoặc không thành công. Bạn có thể thử lại ngay hoặc chọn phương thức thanh toán khác.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="outline" className="w-full sm:w-auto" onClick={() => navigate('/')}>Trang Chủ</Button>
          <Button variant="primary" className="w-full sm:w-auto !bg-green-600 hover:!bg-green-700" onClick={() => navigate('/pitches')}>Thử Đặt Lại</Button>
        </div>
      </div>
    </div>
  );
};

export default PaymentCancel;