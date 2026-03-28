import { Link } from 'react-router-dom'
import { FaSearch, FaHandshake, FaCreditCard } from 'react-icons/fa'
import Button from '../../components/common/Button'

const Home = () => {
  return (
    <div className="flex flex-col gap-10">
      <div className="bg-white p-10 rounded-2xl shadow-sm text-center border border-gray-100">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
          Hệ Thống Đặt Sân & Ghép Trận
        </h1>
        <p className="text-gray-600 mb-8 text-lg max-w-2xl mx-auto">
          Nền tảng giúp bạn tìm kiếm sân bóng gần nhất, đặt lịch nhanh chóng, cọc giữ chỗ an toàn và kết nối giao hữu với hàng ngàn đội bóng khác.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link to="/tim-san">
            <Button variant="primary" className="text-lg px-8 py-3 shadow-md">
              Bắt đầu Tìm Sân
            </Button>
          </Link>
          <Link to="/ghep-tran">
            <Button variant="secondary" className="text-lg px-8 py-3 shadow-md border border-gray-300">
              Tham Gia Ghép Trận
            </Button>
          </Link>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-2xl mb-4">
            <FaSearch />
          </div>
          <h3 className="text-xl font-semibold mb-2 text-gray-800">Tìm Sân Dễ Dàng</h3>
          <p className="text-gray-600 leading-relaxed mb-6 flex-1">
            Xem lịch trống, giá cả và vị trí các sân bóng xung quanh khu vực của bạn.
          </p>
          <Link to="/tim-san" className="w-full">
            <Button variant="primary" className="w-full">Tìm Sân Ngay</Button>
          </Link>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-green-100 text-green-600 rounded-lg flex items-center justify-center text-2xl mb-4">
            <FaHandshake />
          </div>
          <h3 className="text-xl font-semibold mb-2 text-gray-800">Ghép Trận Nhanh Chóng</h3>
          <p className="text-gray-600 leading-relaxed mb-6 flex-1">
            Đăng tin tìm đối thủ, lướt bảng tin nhận kèo và thương lượng trực tiếp.
          </p>
          <Link to="/ghep-tran" className="w-full">
            <Button variant="primary" className="w-full !bg-green-600 hover:!bg-green-700">Đến Bảng Tin</Button>
          </Link>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center text-2xl mb-4">
            <FaCreditCard />
          </div>
          <h3 className="text-xl font-semibold mb-2 text-gray-800">Thanh Toán Tiện Lợi</h3>
          <p className="text-gray-600 leading-relaxed mb-6 flex-1">
            Hỗ trợ cọc tiền sân qua các cổng thanh toán online, đảm bảo giữ chỗ minh bạch.
          </p>
          <Button variant="secondary" className="w-full cursor-default">An Toàn 100%</Button>
        </div>
      </div>
    </div>
  )
}

export default Home