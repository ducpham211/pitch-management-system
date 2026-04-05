import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaBars, FaTimes, FaFutbol, FaUserCircle, FaSignOutAlt, FaUser, FaBell, FaCheck } from 'react-icons/fa';
import Button from './Button';
import { useAuth } from '../../context/AuthContext';
import { notificationApi } from '../../api/notificationApi';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const location = useLocation();
  const { user, logout } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const res = await notificationApi.getMyNotifications();
      setNotifications(res.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const handleRead = async (id: string) => {
    try {
      await notificationApi.markAsRead(id);
      fetchNotifications();
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogout = () => {
    setShowDropdown(false);
    logout();
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const navLinks = [
    { name: 'Trang Chủ', path: '/' },
    { name: 'Tìm Sân', path: '/tim-san' },
    { name: 'Ghép Trận', path: '/ghep-tran' },
    { name: 'Tin Nhắn', path: '/tin-nhan' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-100 shrink-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2">
            <FaFutbol className="text-green-600 text-3xl" />
            <span className="font-bold text-xl text-gray-800">PitchSync</span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link key={link.path} to={link.path} className={`font-medium transition-colors ${isActive(link.path) ? 'text-green-600' : 'text-gray-600 hover:text-green-600'}`}>
                {link.name}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center space-x-6">
            {user ? (
              <>
                <div className="relative">
                  <button onClick={() => setShowNotif(!showNotif)} className="text-gray-500 hover:text-green-600 transition relative outline-none mt-1">
                    <FaBell className="text-xl" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                  
                  {showNotif && (
                    <div className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50">
                      <div className="p-3 border-b border-gray-100 bg-gray-50 font-bold text-gray-700 flex justify-between">
                        Thông báo
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-4 text-center text-sm text-gray-500">Chưa có thông báo nào</div>
                        ) : (
                          notifications.map((n: any) => (
                            <div key={n.id} onClick={() => handleRead(n.id)} className={`p-3 border-b border-gray-50 text-sm cursor-pointer transition ${n.isRead ? 'bg-white opacity-70' : 'bg-blue-50/50 hover:bg-blue-50'}`}>
                              <p className={`text-gray-800 ${n.isRead ? '' : 'font-semibold'}`}>{n.message}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="relative" onMouseEnter={() => setShowDropdown(true)} onMouseLeave={() => setShowDropdown(false)}>
                  <button className="flex items-center gap-2 text-gray-700 hover:text-green-600 transition py-2 px-1 outline-none">
                    <FaUserCircle className="text-2xl" />
                    <span className="font-medium truncate max-w-[120px]">{user.fullName || 'Tài khoản'}</span>
                  </button>

                  {showDropdown && (
                    <div className="absolute right-0 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 mt-0 z-50 overflow-hidden">
                      <Link to="/ho-so" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-green-50 hover:text-green-600 transition"><FaUser className="text-sm" /> Hồ sơ cá nhân</Link>
                      {user.role === 'OWNER' && <Link to="/chu-san" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition"><FaFutbol className="text-sm" /> Kênh Chủ Sân</Link>}
                      {user.role === 'ADMIN' && <Link to="/admin" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition"><FaCheck className="text-sm" /> Quản Trị Hệ Thống</Link>}
                      <hr className="my-1 border-gray-100" />
                      <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 w-full text-left text-red-600 hover:bg-red-50 transition"><FaSignOutAlt className="text-sm" /> Đăng xuất</button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/dang-nhap"><Button variant="secondary" className="bg-transparent border border-gray-300">Đăng Nhập</Button></Link>
                <Link to="/dang-ky"><Button variant="primary" className="!bg-green-600 hover:!bg-green-700">Đăng Ký</Button></Link>
              </>
            )}
          </div>
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-600 focus:outline-none">
              {isOpen ? <FaTimes className="text-2xl" /> : <FaBars className="text-2xl" />}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;