import { Link, useNavigate } from 'react-router-dom';
import { FaSearch, FaHandshake, FaCreditCard, FaStar } from 'react-icons/fa';
import Button from '../../components/common/Button';
import PitchCard from '../../components/common/PitchCard';
import { MOCK_PITCHES } from '../../mocks/pitchData';

const Home = () => {
  const navigate = useNavigate();
  const featuredPitches = MOCK_PITCHES.slice(0, 4);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl flex flex-col gap-16">
      
      <div className="bg-gradient-to-r from-green-50 to-blue-50 p-10 md:p-16 rounded-3xl shadow-sm text-center border border-green-100 relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-800 mb-6 leading-tight">
            Hệ Thống <span className="text-green-600">Đặt Sân</span> & <span className="text-blue-600">Ghép Trận</span>
          </h1>
          <p className="text-gray-600 mb-10 text-lg md:text-xl max-w-3xl mx-auto">
            Nền tảng giúp bạn tìm kiếm sân bóng gần nhất, đặt lịch nhanh chóng, cọc giữ chỗ an toàn và kết nối giao hữu với hàng ngàn đội bóng khác.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/tim-san" className="w-full sm:w-auto">
              <Button variant="primary" className="text-lg px-8 py-4 shadow-lg !bg-green-600 hover:!bg-green-700 w-full">
                Bắt đầu Tìm Sân
              </Button>
            </Link>
            <Link to="/ghep-tran" className="w-full sm:w-auto">
              <Button variant="secondary" className="text-lg px-8 py-4 shadow-md border border-gray-300 w-full bg-white hover:bg-gray-50">
                Tham Gia Ghép Trận
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center text-3xl mb-6">
            <FaSearch />
          </div>
          <h3 className="text-xl font-bold mb-3 text-gray-800">Tìm Sân Dễ Dàng</h3>
          <p className="text-gray-600 leading-relaxed mb-6 flex-1">
            Xem lịch trống, giá cả và vị trí các sân bóng xung quanh khu vực của bạn một cách trực quan.
          </p>
          <Link to="/tim-san" className="w-full">
            <Button variant="primary" className="w-full !bg-blue-600 hover:!bg-blue-700">Tìm Sân Ngay</Button>
          </Link>
        </div>
        
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center text-3xl mb-6">
            <FaHandshake />
          </div>
          <h3 className="text-xl font-bold mb-3 text-gray-800">Ghép Trận Nhanh Chóng</h3>
          <p className="text-gray-600 leading-relaxed mb-6 flex-1">
            Đăng tin tìm đối thủ, lướt bảng tin nhận kèo và thương lượng trực tiếp qua hệ thống chat nội bộ.
          </p>
          <Link to="/ghep-tran" className="w-full">
            <Button variant="primary" className="w-full !bg-green-600 hover:!bg-green-700">Đến Bảng Tin</Button>
          </Link>
        </div>
        
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center text-3xl mb-6">
            <FaCreditCard />
          </div>
          <h3 className="text-xl font-bold mb-3 text-gray-800">Thanh Toán Tiện Lợi</h3>
          <p className="text-gray-600 leading-relaxed mb-6 flex-1">
            Hỗ trợ cọc tiền sân qua ví MoMo, thẻ tín dụng online, đảm bảo giữ chỗ minh bạch, an toàn 100%.
          </p>
          <Button variant="secondary" className="w-full cursor-default bg-gray-50 border-gray-200">Bảo mật cao</Button>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
              <FaStar className="text-yellow-400" /> Sân Bóng Nổi Bật
            </h2>
            <p className="text-gray-600 text-lg">Các sân bóng được đánh giá cao và đặt nhiều nhất trong tuần</p>
          </div>
          <Link to="/tim-san" className="hidden md:block text-green-600 font-bold hover:underline">
            Xem tất cả &rarr;
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredPitches.map((pitch) => (
            <PitchCard
              key={pitch.id}
              id={pitch.id}
              name={pitch.name}
              location={pitch.location}
              type={pitch.type}
              price={pitch.price}
              onActionClick={() => navigate(`/san/${pitch.id}`)}
            />
          ))}
        </div>
        
        <div className="mt-6 text-center md:hidden">
          <Link to="/tim-san" className="text-green-600 font-bold hover:underline">
            Xem tất cả sân bóng &rarr;
          </Link>
        </div>
      </div>

      <div className="bg-gray-800 text-white rounded-3xl p-10 md:p-16 text-center shadow-xl relative overflow-hidden mb-8">
        <div className="relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Bạn là chủ sân bóng?</h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto text-lg">
            Đăng ký đối tác với nền tảng của chúng tôi ngay hôm nay để quản lý lịch đặt sân dễ dàng, tăng doanh thu và tiếp cận hàng ngàn đội bóng.
          </p>
          <Link to="/dang-ky">
            <Button variant="primary" className="!bg-white !text-gray-900 hover:!bg-gray-100 text-lg px-8 py-3 font-bold">
              Trở thành Đối Tác
            </Button>
          </Link>
        </div>
      </div>

    </div>
  );
};

export default Home;