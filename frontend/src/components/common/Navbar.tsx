import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaBars, FaTimes, FaFutbol, FaUserCircle, FaSignOutAlt, FaUser, FaHistory } from 'react-icons/fa';
import Button from './Button';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname === path;
  
  const checkAuth = () => {
    const token = localStorage.getItem('accessToken');
    setIsLoggedIn(!!token);
  };

  useEffect(() => {
    checkAuth();
    
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    setIsLoggedIn(false);
    setShowDropdown(false);
    navigate('/dang-nhap');
  };

  const navLinks = [
    { name: 'Trang Chủ', path: '/' },
    { name: 'Tìm Sân', path: '/tim-san' },
    { name: 'Ghép Trận', path: '/ghep-tran' },
    { name: 'Tin Nhắn', path: '/tin-nhan' },
    { name: 'Hồ Sơ', path: '/ho-so' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-100 shrink-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2">
            <FaFutbol className="text-green-600 text-3xl" />
            <span className="font-bold text-xl text-gray-800">PitchSync</span>
          </Link>

          {}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`font-medium transition-colors ${
                  isActive(link.path) ? 'text-green-600' : 'text-gray-600 hover:text-green-600'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {isLoggedIn ? (
              <div 
                className="relative"
                onMouseEnter={() => setShowDropdown(true)}
                onMouseLeave={() => setShowDropdown(false)}
              >
                <button className="flex items-center gap-2 text-gray-700 hover:text-green-600 transition py-2 px-1 outline-none">
                  <FaUserCircle className="text-2xl" />
                  <span className="font-medium">Tài khoản</span>
                </button>

                {showDropdown && (
                  <div className="absolute right-0 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 mt-0 z-50 overflow-hidden">
                    <Link to="/ho-so" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-green-50 hover:text-green-600 transition">
                      <FaUser className="text-sm" /> Hồ sơ của tôi
                    </Link>
                    <Link to="/lich-su" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-green-50 hover:text-green-600 transition">
                      <FaHistory className="text-sm" /> Lịch sử đặt sân
                    </Link>
                    <hr className="my-1 border-gray-100" />
                    <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 w-full text-left text-red-600 hover:bg-red-50 transition">
                      <FaSignOutAlt className="text-sm" /> Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/dang-nhap">
                  <Button variant="secondary" className="bg-transparent border border-gray-300">Đăng Nhập</Button>
                </Link>
                <Link to="/dang-ky">
                  <Button variant="primary" className="!bg-green-600 hover:!bg-green-700">Đăng Ký</Button>
                </Link>
              </>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-600 hover:text-green-600 focus:outline-none">
              {isOpen ? <FaTimes className="text-2xl" /> : <FaBars className="text-2xl" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-white border-b border-gray-100 absolute w-full left-0">
          <div className="px-4 pt-2 pb-4 space-y-2 shadow-lg">
            {navLinks.map((link) => (
              <Link key={link.path} to={link.path} onClick={() => setIsOpen(false)} className={`block px-3 py-3 rounded-md text-base font-medium ${isActive(link.path) ? 'text-green-600 bg-green-50' : 'text-gray-700 hover:text-green-600 hover:bg-gray-50'}`}>
                {link.name}
              </Link>
            ))}
            <div className="pt-4 flex flex-col gap-3 border-t border-gray-100">
              {isLoggedIn ? (
                <Button onClick={handleLogout} variant="secondary" className="w-full text-center border border-red-200 text-red-600 bg-red-50 py-3">Đăng Xuất</Button>
              ) : (
                <>
                  <Link to="/dang-nhap" onClick={() => setIsOpen(false)}>
                    <Button variant="secondary" className="w-full text-center border border-gray-300 bg-transparent py-3">Đăng Nhập</Button>
                  </Link>
                  <Link to="/dang-ky" onClick={() => setIsOpen(false)}>
                    <Button variant="primary" className="w-full text-center !bg-green-600 py-3">Đăng Ký</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;