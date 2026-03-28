import { Link } from 'react-router-dom';
import { FaFutbol, FaFacebook, FaTiktok, FaInstagram, FaMapMarkerAlt, FaPhone, FaEnvelope } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-white text-gray-700 mt-12 shrink-0 border-t border-gray-100 shadow-inner">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2 text-gray-900">
              <FaFutbol className="text-green-600 text-3xl" />
              <span className="font-bold text-2xl">PitchSync</span>
            </Link>
            <p className="text-sm text-gray-600 leading-relaxed">
              Nền tảng đặt sân bóng và ghép trận hàng đầu. Kết nối đam mê, nâng tầm trải nghiệm thể thao của bạn mỗi ngày.
            </p>
            <div className="flex gap-4 pt-2">
              <a href="#" className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-green-600 hover:text-white transition">
                <FaFacebook className="text-xl" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-green-600 hover:text-white transition">
                <FaInstagram className="text-xl" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-green-600 hover:text-white transition">
                <FaTiktok className="text-xl" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-gray-900 font-bold text-lg mb-4 border-b border-gray-100 pb-2">Khám phá</h3>
            <ul className="space-y-3 text-sm">
              <li><Link to="/tim-san" className="hover:text-green-600 transition">Tìm sân bóng</Link></li>
              <li><Link to="/ghep-tran" className="hover:text-green-600 transition">Bảng tin ghép trận</Link></li>
              <li><Link to="/ho-so" className="hover:text-green-600 transition">Lịch sử đặt sân</Link></li>
              <li><Link to="#" className="hover:text-green-600 transition">Bảng xếp hạng</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-gray-900 font-bold text-lg mb-4 border-b border-gray-100 pb-2">Dành cho đối tác</h3>
            <ul className="space-y-3 text-sm">
              <li><Link to="/dang-ky" className="hover:text-green-600 transition">Đăng ký làm Chủ sân</Link></li>
              <li><Link to="/chu-san" className="hover:text-green-600 transition">Kênh Quản lý Chủ sân</Link></li>
              <li><Link to="#" className="hover:text-green-600 transition">Quy chế hoạt động</Link></li>
              <li><Link to="#" className="hover:text-green-600 transition">Chính sách bảo mật</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-gray-900 font-bold text-lg mb-4 border-b border-gray-100 pb-2">Liên hệ</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <FaMapMarkerAlt className="text-green-600 mt-1 shrink-0" />
                <span>Khu phố 6, P.Linh Trung, Tp.Thủ Đức, Tp.Hồ Chí Minh.</span>
              </li>
              <li className="flex items-center gap-3">
                <FaPhone className="text-green-600 shrink-0" />
                <span>0123 456 789</span>
              </li>
              <li className="flex items-center gap-3">
                <FaEnvelope className="text-green-600 shrink-0" />
                <span>hotro@pitchsync.com</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="border-t border-gray-100 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
          <p>&copy; {new Date().getFullYear()} PitchSync. All rights reserved.</p>
          <div className="flex gap-4 mt-2 md:mt-0">
            <a href="#" className="hover:text-green-600 transition">Điều khoản sử dụng</a>
            <a href="#" className="hover:text-green-600 transition">Quyền riêng tư</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;